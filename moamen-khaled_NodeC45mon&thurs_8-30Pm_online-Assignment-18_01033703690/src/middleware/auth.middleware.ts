import type { NextFunction, Request, Response } from "express";
import { TokenTypeEnum } from "../common/enums/security.enums.js";
import {
  BadRequestException,
  ForbiddenException,
} from "../common/exceptions/domain.exception.js";
import { TokenService } from "../common/services/token.service.js";
import { RoleEnum } from "../common/enums/user.enums.js";

//authentication
export const authentication = (
  tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const tokenService: TokenService = new TokenService();
    if (!req.headers.authorization) {
      throw new BadRequestException("not token passed");
    }
    const [flag, token] = req.headers.authorization.split(" ");
    if (!token) {
      throw new BadRequestException("no token passed");
    }
    const { user, decode } = await tokenService.decodeToken({
      token,
      tokenType,
    });
    req.user = user;
    req.decode = decode;

    next();
  };
};

//authorization
export const authorization = (allowedRoles: RoleEnum[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenException(
        "you are not authorize to access this end point",
      );
    }

    next();
  };
};
