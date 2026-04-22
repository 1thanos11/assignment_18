import { decrypt, encrypt, compareHash, generateHash } from "../utils/security";

export class SecurityService {
  constructor() {}
  public generateHash = generateHash;
  public compareHash = compareHash;

  public encrypt = encrypt;
  public decrypt = decrypt;
}
