import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

describe("plotInfo routes", () => {
    let app;
    let plotInfoModel;
    let router;

    beforeEach(() => {
        vi.clearAllMocks();

        // Get the model and replace functions with mocks
        plotInfoModel = require("../model/getPlotInfo");

        plotInfoModel.getPlotInfo = vi.fn();
        plotInfoModel.addPlant = vi.fn();
        plotInfoModel.reducePlant = vi.fn();
        plotInfoModel.removePlant = vi.fn();

        // Force router to reload after mocks are attached
        delete require.cache[
            require.resolve("../routes/plotInfo")
        ];

        router = require("../routes/plotInfo");

        app = express();

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        app.use((req, res, next) => {
            req.session = {
                user: {
                    id: 1
                }
            };

            res.render = (view, data) => {
                res.json({ view, data });
            };

            next();
        });

        app.use("/plotInfo", router);
    });

    it("returns error when plot id missing", async () => {
        const response = await request(app)
            .get("/plotInfo");

        expect(response.text).toContain("Plot not supplied");
    });

    it("renders plot info when plot exists", async () => {
        plotInfoModel.getPlotInfo.mockResolvedValue({
            name: "Test Plot",
            userID: 1,
            plants: []
        });

        const response = await request(app)
            .get("/plotInfo?plot=123");

        expect(plotInfoModel.getPlotInfo)
            .toHaveBeenCalledWith("123");

        expect(response.status).toBe(200);
        expect(response.body.view).toBe("plotInfo");
        expect(response.body.data.info.name).toBe("Test Plot");
    });

    it("returns not found when plot doesn't exist", async () => {
        plotInfoModel.getPlotInfo.mockResolvedValue({});

        const response = await request(app)
            .get("/plotInfo?plot=123");

        expect(response.text).toContain("Plot not found");
    });

    it("adds plant successfully", async () => {
        plotInfoModel.getPlotInfo.mockResolvedValue({
            name: "Test Plot",
            userID: 1,
            plants: []
        });

        await request(app)
            .get("/plotInfo?plot=123");

        plotInfoModel.addPlant.mockResolvedValue(true);

        const response = await request(app)
            .post("/plotInfo/add")
            .type("form")
            .send({
                plantName: "Tomato",
                plantType: "fruit",
                addAmount: 10
            });

        expect(plotInfoModel.addPlant)
            .toHaveBeenCalledWith(
                "123",
                "Tomato",
                "fruit",
                "10"
            );

        expect(response.status).toBe(302);
        expect(response.headers.location)
            .toBe("/plotInfo?plot=123");
    });

    it("fails add plant when user does not own plot", async () => {
        plotInfoModel.getPlotInfo.mockResolvedValue({
            name: "Test Plot",
            userID: 99,
            plants: []
        });

        await request(app)
            .get("/plotInfo?plot=123");

        const response = await request(app)
            .post("/plotInfo/add")
            .type("form")
            .send({
                plantName: "Tomato",
                plantType: "fruit",
                addAmount: 10
            });

        expect(plotInfoModel.addPlant)
            .not.toHaveBeenCalled();

        expect(response.text)
            .toContain("Failed to add plant");
    });

    it("reduces plant quantity", async () => {
        plotInfoModel.getPlotInfo.mockResolvedValue({
            name: "Test Plot",
            userID: 1,
            plants: [
                {
                    id: 1,
                    amount: 10
                }
            ]
        });

        await request(app)
            .get("/plotInfo?plot=123");

        plotInfoModel.reducePlant
            .mockResolvedValue(true);

        const response = await request(app)
            .post("/plotInfo/remove")
            .type("form")
            .send({
                remPlant: 1,
                remAmount: 5
            });

        expect(plotInfoModel.reducePlant)
            .toHaveBeenCalledWith(
                "123",
                1,
                5
            );

        expect(response.status).toBe(302);
    });

    it("removes plant completely when amount <= 0", async () => {
        plotInfoModel.getPlotInfo.mockResolvedValue({
            name: "Test Plot",
            userID: 1,
            plants: [
                {
                    id: 1,
                    amount: 10
                }
            ]
        });

        await request(app)
            .get("/plotInfo?plot=123");

        plotInfoModel.removePlant
            .mockResolvedValue(true);

        const response = await request(app)
            .post("/plotInfo/remove")
            .type("form")
            .send({
                remPlant: 1,
                remAmount: 10
            });

        expect(plotInfoModel.removePlant)
            .toHaveBeenCalledWith(
                "123",
                1
            );

        expect(response.status).toBe(302);
    });
});