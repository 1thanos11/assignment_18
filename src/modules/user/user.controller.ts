import type { NextFunction, Request, Response } from "express";
import { Router } from "express";

import { authentication } from "../../middleware/auth.middleware.js";
import { userService } from "./user.service.js";
import { successResponse } from "../../common/response/success.response.js";
import { TokenTypeEnum } from "../../common/enums/security.enums.js";
import { validate } from "../../middleware/validation.middleware.js";
import { logoutSchema, shareProfileSchema } from "./user.validation.js";

const router = Router();

//refresh token
router.post(
  "/refresh-token",
  authentication(TokenTypeEnum.REFRESH),
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken, refreshToken } = await userService.refreshToken({
      user: req.user,
      decode: req.decode,
    });

    return successResponse({ res, data: { accessToken, refreshToken } });
  },
);

//profile
router.get(
  "/me",
  authentication(),
  async (req: Request, res: Response, next: NextFunction) => {
    const profile = await userService.profile({ user: req.user });

    return successResponse({ res, data: profile });
  },
);

//logout
router.patch(
  "/logout",
  authentication(),
  validate(logoutSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { flag } = req.body;
    await userService.logout({ user: req.user, decode: req.decode, flag });

    return successResponse({ res, message: "logged out successfully" });
  },
);

//share profile
router.get(
  "/share-profile/:id",
  authentication(),
  validate(shareProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await userService.shareProfile({ id: id as string });

    return successResponse({ res, data: user });
  },
);

export default router;
