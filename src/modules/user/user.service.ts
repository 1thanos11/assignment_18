import { LogoutEnum } from "../../common/enums";
import { IUser } from "../../common/interfaces";
import {
  SecurityService,
  TokenService,
  redisService,
} from "../../common/services";
import { UserRepository } from "../../DB/repository";
import { IAuthDto, LogoutDto, ShareProfileDto } from "./user.dto";
import { JWT_CONFIG } from "../../config/config.js";
import { ConflictException, NotFoundException } from "../../common/exceptions";

class UserService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly securityService = new SecurityService(),
    private readonly tokenService = new TokenService(),
    private readonly redis = redisService,
  ) {}
  //refresh token
  public async refreshToken(inputs: IAuthDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { user, decode } = inputs;
    const userId = user._id.toString();
    if (
      Date.now() + 30000 <
      ((decode?.iat as number) + JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN) * 1000
    ) {
      throw new ConflictException("previous token is still valid");
    }
    const revokeTokenKey = this.redis.revokeTokenKey({
      userId,
      jti: decode?.jti as string,
    });
    await this.redis.set({
      key: revokeTokenKey,
      value: decode?.jti,
      time: (decode?.iat as number) + JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
    });

    return await this.tokenService.createLoginCredentials({ user });
  }

  //profile
  public async profile(inputs: IAuthDto): Promise<IUser> {
    const { user } = inputs;
    if (user.phone) {
      user.phone = await this.securityService.decrypt({
        encryptedData: user.phone,
      });
    }

    return user;
  }

  //logout
  public async logout(inputs: LogoutDto & IAuthDto): Promise<void> {
    const { user, decode, flag } = inputs;
    switch (flag) {
      case LogoutEnum.ALL:
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
          jti: decode?.jti as string,
        });
        await this.redis.set({
          key: revokeTokenKey,
          value: decode?.jti,
          time: (decode?.iat as number) + JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
        });
        break;
    }

    return;
  }

  //share profile
  public async shareProfile(inputs: ShareProfileDto): Promise<any> {
    const { id } = inputs;
    const targetUser = await this.userRepository.findOne({
      filter: { _id: id, confirmEmail: { $exists: true } },
      projection:
        "-email -password -confirmEmail -role -provider -changeCredentialsTime -_id -updatedAt -__v",
    });
    if (!targetUser) {
      throw new NotFoundException("user not found");
    }
    if (targetUser.phone) {
      targetUser.phone = await this.securityService.decrypt({
        encryptedData: targetUser.phone,
      });
    }

    return targetUser;
  }
}

export const userService = new UserService();
