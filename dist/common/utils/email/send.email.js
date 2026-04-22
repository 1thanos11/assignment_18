"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../../config/config");
const exceptions_1 = require("../../exceptions");
const sendEmail = async ({ to, cc, bcc, html, attachments = [], }) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: config_1.EMAIL_USER,
            pass: config_1.EMAIL_PASS,
        },
    });
    if (!to && !cc && !bcc) {
        throw new exceptions_1.BadRequestException("invalid recipient");
    }
    if (!html?.length && !attachments?.length) {
        throw new exceptions_1.BadRequestException("invalid mail content");
    }
    const info = transporter.sendMail({
        to,
        cc,
        bcc,
        html,
        attachments,
        from: `${config_1.APPLICATION_NAME} ${config_1.EMAIL_USER}`,
    });
    console.log("mail sent", (await info).messageId);
};
exports.sendEmail = sendEmail;
