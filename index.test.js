import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

import indexRouter from "../routes/index.js";
import * as model from "../model/index.js";
import * as getPlotInfo from "../model/getPlotInfo.js";

describe("index routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rendering index page with plots", async () => {
        vi.spyOn(model, "getPlotLocation")
            .mockResolvedValue([
                {
                    address: "113 Pope St, Birmingham B1 3AG",
                    place_name: "Pottery Studio",
                    spaceid: 33
                }
            ]);

        const app = express();

        app.use((req, res, next) => {
            res.render = (view, data) => {
                res.json({ view, data });
            };
            next();
        });

        app.use("/", indexRouter);

        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        expect(response.body.view).toBe("index");
        expect(response.body.data.spaces).toHaveLength(12);
    });
});