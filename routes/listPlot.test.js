import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

describe("listPlot routes", () => {
    let app;
    let router;
    let listPlotModel;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();

        listPlotModel = require("../model/listPlotInfo");

        listPlotModel.addGrowingSpace = vi.fn();

        delete require.cache[
            require.resolve("../routes/listPlot")
        ];

        router = require("../routes/listPlot");

        app = express();
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());

        app.use((req, res, next) => {
            req.session = { user: { id: 1 } };
            next();
        });

        app.use((req, res, next) => {
            res.render = (view, data) =>
                res.status(200).json({ view, ...data });
            next();
        });

        app.use("/", router);
    });

    it("redirects to /plotInfo when plot is successfully created", async () => {
        listPlotModel.addGrowingSpace.mockResolvedValue(123);

        const response = await request(app)
            .post("/")
            .send({
                placeName: "Pottery Studio",
                address: "113 Pope St",
                postcode: "B1 3AG",
                email: "test@gmail.com",
                phone: "12345678910",
                startTime: "08:00",
                endTime: "17:00",
                legal: "on"
            });

        expect(listPlotModel.addGrowingSpace).toHaveBeenCalledWith(
            1,
            "Pottery Studio",
            "113 Pope St B1 3AG",
            "08:00",
            "17:00",
            "12345678910",
            "test@gmail.com"
        );

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/plotInfo?plot=123");
    });
});