"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exceptions_1 = require("../../common/exceptions");
const repository_1 = require("../../DB/repository");
const email_1 = require("../../common/utils/email");
const utils_1 = require("../../common/utils");
const config_1 = require("../../config/config");
const services_1 = require("../../common/services");
const enums_1 = require("../../common/enums");
const google_auth_library_1 = require("google-auth-library");
class AuthService {
    userRepository;
    securityService;
    redis = services_1.redisService;
    tokenService;
    constructor() {
        this.userRepository = new repository_1.UserRepository();
        this.securityService = new services_1.SecurityService();
        this.tokenService = new services_1.TokenService();
    }
    async sendEmailOtp({ email, subject = enums_1.EmailEnum.CONFIRM_EMAIL, title, }) {
        const blockKey = this.redis.OtpBlockKey({ email, subject });
        const isBlockedTTL = await this.redis.ttl({ key: blockKey });
        if (isBlockedTTL >= 0) {
            throw new exceptions_1.ConflictException(`you are blocked please try again after ${isBlockedTTL} seconds`);
        }
        const maxAttemptsKey = this.redis.otpMaxAttemptsKey({
            email,
            subject,
        });
        const count = await this.redis.get({ key: maxAttemptsKey });
        if (count && count > 3) {
            await this.redis.set({ key: blockKey, value: 1, time: 10 * 60 });
        }
        await this.redis.incr({ key: maxAttemptsKey });
        const otpKey = this.redis.otpKey({ email, subject });
        const isValidOtp = await this.redis.ttl({ key: otpKey });
        if (isValidOtp >= 0) {
            throw new exceptions_1.ConflictException("the previous otp is still valid");
        }
        const otp = await (0, utils_1.generateOtp)();
        const hashedOtp = await this.securityService.generateHash({
            data: `${otp}`,
            rounds: config_1.OTP_SALT_ROUNd,
        });
        await this.redis.set({ key: otpKey, value: hashedOtp, time: 10 * 60 });
        email_1.sendMailEvent.emit("sendMail", {
            to: email,
            html: (0, email_1.emailTemplate)({ title, code: otp }),
        });
        return;
    }
    async verifyGoogleAccount(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config_1.CLIENT_IDS,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new exceptions_1.BadRequestException("Fail to authenticate this account with google");
        }
        return payload;
    }
    async signupWithGmail(idToken) {
        const payload = await this.verifyGoogleAccount(idToken);
        const isUserExist = await this.userRepository.findOne({
            filter: { email: payload.email },
        });
        if (isUserExist) {
            if (isUserExist.provider !== enums_1.ProviderEnum.GOOGLE) {
                throw new exceptions_1.ConflictException("email already exist");
            }
            return {
                status: 200,
                credentials: await this.loginWithGmail(idToken),
            };
        }
        const user = await this.userRepository.createOne({
            data: {
                firstName: payload.given_name,
                lastName: payload.family_name,
                email: payload.email,
                provider: enums_1.ProviderEnum.GOOGLE,
                profilePicture: payload.profile,
                confirmEmail: new Date(),
            },
        });
        return {
            status: 201,
            credentials: await this.tokenService.createLoginCredentials({
                user,
            }),
        };
    }
    async loginWithGmail(idToken) {
        const payload = await this.verifyGoogleAccount(idToken);
        const user = await this.userRepository.findOne({
            filter: {
                email: payload.email,
                confirmEmail: { $exists: true },
                provider: enums_1.ProviderEnum.GOOGLE,
            },
        });
        if (!user) {
            throw new exceptions_1.NotFoundException("user not found");
        }
        return await this.tokenService.createLoginCredentials({ user });
    }
    signup = async (inputs) => {
        const { username, email, password, phone } = inputs;
        const isUserExist = await this.userRepository.findOne({
            filter: { email: inputs.email },
            projection: "email",
            options: { lean: true },
        });
        if (isUserExist) {
            throw new exceptions_1.ConflictException("email already exist");
        }
        const user = await this.userRepository.createOne({
            data: {
                username,
                email,
                password: await this.securityService.generateHash({ data: password }),
                phone: phone
                    ? await this.securityService.encrypt({ plaintext: phone })
                    : undefined,
            },
        });
        await this.sendEmailOtp({ email, title: "Verify Email Otp" });
        return user.toJSON();
    };
    async confirmEmail(inputs) {
        const { email, otp } = inputs;
        const otpKey = this.redis.otpKey({ email });
        const isOtpExist = await this.redis.get({ key: otpKey });
        if (!isOtpExist) {
            throw new exceptions_1.BadRequestException("expired OTP");
        }
        const isValidOtp = await this.securityService.compareHash({
            plaintext: `${otp}`,
            encrypted: isOtpExist,
        });
        if (!isValidOtp) {
            throw new exceptions_1.BadRequestException("wrong OTP");
        }
        const user = await this.userRepository.findOneAndUpdate({
            filter: { email, provider: enums_1.ProviderEnum.SYSTEM, confirmEmail: null },
            update: { confirmEmail: new Date() },
        });
        if (!user) {
            throw new exceptions_1.NotFoundException("user not found may be you write wrong email");
        }
        await this.redis.del({
            keys: await this.redis.keys({
                pattern: `${this.redis.otpKey({ email })}*`,
            }),
        });
        return;
    }
    async resendConfirmEmailOtp(inputs) {
        const { email } = inputs;
        const user = await this.userRepository.findOne({
            filter: { email, provider: enums_1.ProviderEnum.SYSTEM, confirmEmail: null },
            projection: "email",
            options: { lean: true },
        });
        if (!user) {
            throw new exceptions_1.NotFoundException("user not found may be you write wrong email");
        }
        await this.sendEmailOtp({ email, title: "confirm email OTP" });
        return;
    }
    async login(inputs) {
        const { email, password } = inputs;
        const user = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: true },
                provider: enums_1.ProviderEnum.SYSTEM,
            },
        });
        if (!user) {
            throw new exceptions_1.NotFoundException("email or password is wrong");
        }
        const isCorrectPassword = await this.securityService.compareHash({
            plaintext: password,
            encrypted: user.password,
        });
        if (!isCorrectPassword) {
            throw new exceptions_1.NotFoundException("email or password is wrong");
        }
        return await this.tokenService.createLoginCredentials({ user });
    }
    async forgotPassword(inputs) {
        const { email } = inputs;
        const user = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: true },
                provider: enums_1.ProviderEnum.SYSTEM,
            },
        });
        if (!user) {
            throw new exceptions_1.NotFoundException("user not found may be you enter invalid email");
        }
        await this.sendEmailOtp({
            title: "Forgot Password OTP",
            subject: enums_1.EmailEnum.FORGOT_PASSWORD,
            email,
        });
        return;
    }
    async resetPassword(inputs) {
        const { email, password, otp } = inputs;
        const user = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: true },
                provider: enums_1.ProviderEnum.SYSTEM,
            },
        });
        if (!user) {
            throw new exceptions_1.NotFoundException("user not found may be you enter invalid email");
        }
        const otpKey = this.redis.otpKey({
            email,
            subject: enums_1.EmailEnum.FORGOT_PASSWORD,
        });
        const isOtpExist = await this.redis.get({ key: otpKey });
        if (!isOtpExist) {
            throw new exceptions_1.NotFoundException("expired otp");
        }
        const isValidOtp = await this.securityService.compareHash({
            plaintext: `${otp}`,
            encrypted: isOtpExist,
        });
        if (!isValidOtp) {
            throw new exceptions_1.BadRequestException("wrong otp");
        }
        const hashedPassword = await this.securityService.generateHash({
            data: password,
        });
        user.password = hashedPassword;
        await user.save();
        const keys = await this.redis.keys({
            pattern: `${this.redis.otpKey({ email, subject: enums_1.EmailEnum.FORGOT_PASSWORD })}*`,
        });
        await this.redis.del({ keys });
        return;
    }
}
exports.default = new AuthService();
