"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../../common/enums");
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: {
        type: String,
        required: function () {
            return this.provider === enums_1.ProviderEnum.SYSTEM;
        },
    },
    role: { type: Number, enum: enums_1.RoleEnum, default: enums_1.RoleEnum.USER },
    provider: {
        type: Number,
        enum: enums_1.ProviderEnum,
        default: enums_1.ProviderEnum.SYSTEM,
    },
    gender: { type: Number, enum: enums_1.GenderEnum, default: enums_1.GenderEnum.MALE },
    phone: String,
    profilePicture: String,
    coverPictures: [String],
    changeCredentialsTime: Date,
    confirmEmail: Date,
    DOB: Date,
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
})
    .get(function () {
    return this.firstName + " " + this.lastName;
});
exports.User = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
