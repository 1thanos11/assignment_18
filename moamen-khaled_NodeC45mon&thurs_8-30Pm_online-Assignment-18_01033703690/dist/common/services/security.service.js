"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const security_1 = require("../utils/security");
class SecurityService {
    constructor() { }
    generateHash = security_1.generateHash;
    compareHash = security_1.compareHash;
    encrypt = security_1.encrypt;
    decrypt = security_1.decrypt;
}
exports.SecurityService = SecurityService;
