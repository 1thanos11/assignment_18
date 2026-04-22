"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const enums_1 = require("../../common/enums");
const services_1 = require("../../common/services");
const repository_1 = require("../../DB/repository");
const config_js_1 = require("../../config/config.js");
const exceptions_1 = require("../../common/exceptions");
class UserService {
    userRepository;
    securityService;
    tokenService;
    redis;
    constructor(userRepository = new repository_1.UserRepository(), securityService = new services_1.SecurityService(), tokenService = new services_1.TokenService(), redis = services_1.redisService) {
        this.userRepository = userRepository;
        this.securityService = securityService;
        this.tokenService = tokenService;
        this.redis = redis;
    }
    async refreshToken(inputs) {
        const { user, decode } = inputs;
        const userId = user._id.toString();
        if (Date.now() + 30000 <
            (decode?.iat + config_js_1.JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN) * 1000) {
            throw new exceptions_1.ConflictException("previous token is still valid");
        }
        const revokeTokenKey = this.redis.revokeTokenKey({
            userId,
            jti: decode?.jti,
        });
        await this.redis.set({
            key: revokeTokenKey,
            value: decode?.jti,
            time: decode?.iat + config_js_1.JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
        });
        return await this.tokenService.createLoginCredentials({ user });
    }
    async profile(inputs) {
        const { user } = inputs;
        if (user.phone) {
            user.phone = await this.securityService.decrypt({
                encryptedData: user.phone,
            });
        }
        return user;
    }
    async logout(inputs) {
        const { user, decode, flag } = inputs;
        switch (flag) {
            case enums_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                const keys = await this.redis.keys({
                    pattern: `${this.redis.baseRevokeToken({
                        userId: user._id,
                    })}*`,
                });
                await this.redis.del({ keys });
                break;
            default:
                const revokeTokenKey = this.redis.revokeTokenKey({
                    userId: user._id,
                    jti: decode?.jti,
                });
                await this.redis.set({
                    key: revokeTokenKey,
                    value: decode?.jti,
                    time: decode?.iat + config_js_1.JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
                });
                break;
        }
        return;
    }
    async shareProfile(inputs) {
        const { id } = inputs;
        const targetUser = await this.userRepository.findOne({
            filter: { _id: id, confirmEmail: { $exists: true } },
            projection: "-email -password -confirmEmail -role -provider -changeCredentialsTime -_id -updatedAt -__v",
        });
        if (!targetUser) {
            throw new exceptions_1.NotFoundException("user not found");
        }
        if (targetUser.phone) {
            targetUser.phone = await this.securityService.decrypt({
                encryptedData: targetUser.phone,
            });
        }
        return targetUser;
    }
}
exports.userService = new UserService();
