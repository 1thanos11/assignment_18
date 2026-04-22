"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const error_middleware_1 = require("./middleware/error.middleware");
const modules_1 = require("./modules");
const config_1 = require("./config/config");
const DB_1 = __importDefault(require("./DB"));
const services_1 = require("./common/services");
async function bootstrap() {
    await (0, DB_1.default)();
    await services_1.redisService.connect();
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use("/api/auth", modules_1.authRouter);
    app.use("/api/user", modules_1.userRouter);
    app.use(error_middleware_1.GlobalErrorHandler);
    app.listen(config_1.PORT, () => {
        console.log(`Server Is Running On PORT ${config_1.PORT}`);
    });
}
exports.default = bootstrap;
