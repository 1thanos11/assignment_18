import { IUser } from "../../common/interfaces/user.interface.js";
import { User } from "../models";
import { DataBaseRepository } from "./base.repository";

export class UserRepository extends DataBaseRepository<IUser> {
  constructor() {
    super(User);
  }
}
