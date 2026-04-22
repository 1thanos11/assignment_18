"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalErrorHandler = void 0;
const GlobalErrorHandler = (error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        msg: error.message || "internal server error",
        stack: error.stack,
        cause: error.cause,
        error,
    });
};
exports.GlobalErrorHandler = GlobalErrorHandler;
