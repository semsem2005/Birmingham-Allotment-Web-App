import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

import signupRouter from "../routes/signup.js";

describe("signup routes", () => {
    let accountModel;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();

        accountModel = require("../model/account");

        accountModel.signup = vi.fn();

        
        delete require.cache[
            require.resolve("../routes/signup")
        ];
    });

    function createApp() {
        const app = express();

        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());

        app.use((req, res, next) => {
            res.render = (view, data) => {
                res.status(200).json({ view, data });
            };
            next();
        });

        const router = require("../routes/signup");
        app.use("/", router);

        return app;
    }

    it("POST redirects when signup is successful", async () => {
        accountModel.signup.mockResolvedValue(true);

        const app = createApp();

        const res = await request(app)
            .post("/")
            .type("form")
            .send({
                username: "TestUser",
                email: "test@gmail.com",
                password: "Password1!",
                confirmpassword: "Password1!"
            });

        expect(accountModel.signup).toHaveBeenCalledWith(
            "test@gmail.com",
            "TestUser",
            "Password1!"
        );

        expect(res.status).toBe(302);
    });

    it("renders error when account already exists", async () => {
        accountModel.signup.mockResolvedValue(false);

        const app = createApp();

        const res = await request(app)
            .post("/")
            .type("form")
            .send({
                username: "TestUser",
                email: "test@test.com",
                password: "Password1!",
                confirmpassword: "Password1!"
            });

        expect(accountModel.signup).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(res.body.data.error).toBe("Account already exists");
    });
});