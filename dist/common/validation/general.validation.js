"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const zod_1 = __importDefault(require("zod"));
const security_enums_js_1 = require("../enums/security.enums.js");
const mongoose_1 = require("mongoose");
exports.generalValidationFields = {
    username: zod_1.default
        .string({ error: "username must be string" })
        .min(1, { error: "username can't be less than 1" })
        .max(15, { error: "username can't be exceed 15" }),
    confirmPassword: zod_1.default.string(),
    email: zod_1.default.email({ error: "enter valid email format" }),
    password: zod_1.default.string({ error: "password must be string" }),
    phone: zod_1.default.string(),
    otp: zod_1.default.coerce.number().int().min(100000).max(999999),
    flag: zod_1.default.enum(security_enums_js_1.LogoutEnum).default(security_enums_js_1.LogoutEnum.ONE),
    id: zod_1.default.string().refine((val) => {
        return mongoose_1.Types.ObjectId.isValid(val);
    }, {
        error: "invalid id",
    }),
};
