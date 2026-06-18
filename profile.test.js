import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

describe("profile routes", () => {
    let app;
    let router;
    let db;
    let plotInfoModel;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();

        // Mock db connection
        db = require("../model/dbConnection");
        db.getConnection = vi.fn(() => {
            return vi.fn().mockResolvedValue([
                {
                    username: "testUser",
                    email: "test@test.com",
                    name: "Test",
                    gender: "M",
                    bio: "hello",
                    dark_mode: false
                }
            ]);
        });

        // Mock plot model
        plotInfoModel = require("../model/getPlotInfo");
        plotInfoModel.getUserPlots = vi.fn().mockResolvedValue([
            { spaceid: 1, place_name: "Plot A" }
        ]);

        // Reload router AFTER mocks
        delete require.cache[require.resolve("../routes/profile")];
        router = require("../routes/profile");

        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        app.use((req, res, next) => {
            req.session = {
                user: { id: 1 }
            };

            res.render = (view, data) => {
                res.json({ view, data });
            };

            next();
        });

        app.use("/profile", router);
    });

    it("redirects to login when not logged in", async () => {
        app = express();

        app.use((req, res, next) => {
            req.session = {};
            next();
        });

        app.use("/profile", router);

        const res = await request(app).get("/profile");

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("/login");
    });

    it("renders profile page when user exists", async () => {
        const res = await request(app).get("/profile");

        expect(res.status).toBe(200);
        expect(res.body.view).toBe("profile");
        expect(res.body.data.user.username).toBe("testUser");
        expect(plotInfoModel.getUserPlots).toHaveBeenCalledWith(1);
    });

    it("redirects to login when user not found in DB", async () => {
        db.getConnection.mockReturnValueOnce(
            vi.fn().mockResolvedValue([])
        );

        const res = await request(app).get("/profile");

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("/login");
    });

    it("POST fails when username/email missing", async () => {
        const res = await request(app)
            .post("/profile")
            .type("form")
            .send({
                username: "",
                email: ""
            });

        expect(res.body.view).toBe("profile");
        expect(res.body.data.error).toContain("required");
    });

    it("POST updates profile successfully (no password change)", async () => {
        const res = await request(app)
            .post("/profile")
            .type("form")
            .send({
                username: "newUser",
                email: "new@test.com",
                name: "New Name",
                gender: "F",
                bio: "new bio",
                dark_mode: "on"
            });

        expect(res.status).toBe(200);
        expect(res.body.data.success).toBe(true);
    });

    it("POST fails when passwords do not match", async () => {
        const res = await request(app)
            .post("/profile")
            .type("form")
            .send({
                username: "user",
                email: "test@gmail.com",
                password: "123",
                confirmPassword: "456"
            });

        expect(res.body.data.error).toContain("do not match");
    });
});