import z from "zod";
import { LogoutEnum } from "../enums/security.enums.js";
import { Types } from "mongoose";

export const generalValidationFields = {
  username: z
    .string({ error: "username must be string" })
    .min(1, { error: "username can't be less than 1" })
    .max(15, { error: "username can't be exceed 15" }),
  confirmPassword: z.string(),
  email: z.email({ error: "enter valid email format" }),
  password: z.string({ error: "password must be string" }),
  phone: z.string(),
  otp: z.coerce.number().int().min(100000).max(999999),
  flag: z.enum(LogoutEnum).default(LogoutEnum.ONE),
  id: z.string().refine(
    (val) => {
      return Types.ObjectId.isValid(val);
    },
    {
      error: "invalid id",
    },
  ),
};
