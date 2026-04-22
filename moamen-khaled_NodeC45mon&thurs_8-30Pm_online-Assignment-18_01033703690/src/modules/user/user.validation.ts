import z from "zod";
import { generalValidationFields } from "../../common/validation/general.validation.js";

//logout schema
export const logoutSchema = {
  body: z.strictObject({
    flag: generalValidationFields.flag,
  }),
};

//share profile schema
export const shareProfileSchema = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
};
