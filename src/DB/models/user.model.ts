import { model, models, Schema } from "mongoose";

import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums";
import { IUser } from "../../common/interfaces";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: {
      type: String,
      required: function (this) {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    role: { type: Number, enum: RoleEnum, default: RoleEnum.USER },
    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.SYSTEM,
    },
    gender: { type: Number, enum: GenderEnum, default: GenderEnum.MALE },
    phone: String,
    profilePicture: String,
    coverPictures: [String],
    changeCredentialsTime: Date,
    confirmEmail: Date,
    DOB: Date,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//virtual
userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName as string;
    this.lastName = lastName as string;
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });

//export model
export const User = models.User || model("User", userSchema);
