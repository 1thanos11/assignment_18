"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const models_1 = require("../models");
const base_repository_1 = require("./base.repository");
class UserRepository extends base_repository_1.DataBaseRepository {
    constructor() {
        super(models_1.User);
    }
}
exports.UserRepository = UserRepository;
