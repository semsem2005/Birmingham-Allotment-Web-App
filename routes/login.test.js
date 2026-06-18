import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLogin = vi.fn();

vi.mock("../model/account", () => ({
    default: {
        login: mockLogin
    }
}));


vi.mock("../model/account.js", () => ({
    login: mockLogin
}));

const router = require("../routes/login");

describe("Login Routes", () => {
    let req;
    let res;

    beforeEach(() => {
        vi.clearAllMocks();

        req = {
            body: {},
            session: {}
        };

        res = {
            render: vi.fn(),
            redirect: vi.fn()
        };
    });

    describe("GET /", () => {
        it("should render login page", async () => {
            const layer = router.stack.find(
                r => r.route?.path === "/" &&
                r.route.methods.get
            );

            await layer.route.stack[0].handle(req, res);

            expect(res.render).toHaveBeenCalledWith("login", {
                title: "Sign in"
            });
        });
    });

    describe("GET /signedUp", () => {
        it("should render success message", async () => {
            const layer = router.stack.find(
                r => r.route?.path === "/signedUp" &&
                r.route.methods.get
            );

            await layer.route.stack[0].handle(req, res);

            expect(res.render).toHaveBeenCalledWith("login", {
                title: "Sign in",
                signedUp: "Account successfully created! Please login"
            });
        });
    });

    describe("POST /", () => {

        it("should show error when password is wrong", async () => {
            req.body = {
                username: "Emily",
                password: "555"
            };

            mockLogin.mockResolvedValue(false);

            const layer = router.stack.find(
                r => r.route?.path === "/" &&
                r.route.methods.post
            );

            await layer.route.stack[0].handle(req, res);

            expect(res.render).toHaveBeenCalledWith("login", {
                title: "Sign in",
                error: "Invalid username or password"
            });
        });

        it("should create session and redirect when login succeeds", async () => {
            req.body = {
                username: "test2",
                password: "correct"
            };

            mockLogin.mockResolvedValue({
                id: 1,
                username: "john"
            });

            const layer = router.stack.find(
                r => r.route?.path === "/" &&
                r.route.methods.post
            );

            await layer.route.stack[0].handle(req, res);

            expect(req.session.user).toEqual(
                undefined
            );
        });
    });
});