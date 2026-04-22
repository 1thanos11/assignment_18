import type { RedisClientType } from "redis";
import { createClient } from "redis";

import { REDIS_URI } from "../../config/config.js";
import { Types } from "mongoose";
import { EmailEnum } from "../enums/email.enums.js";

type OtpKeyType = { email: string; subject?: EmailEnum };

class RedisService {
  private client: RedisClientType;
  constructor() {
    this.client = createClient({ url: REDIS_URI });
    this.eventsHandler();
  }
  //event handler
  private eventsHandler() {
    this.client.on("connect", () =>
      console.log(`REDIS_DB Connected Successfully`),
    );
    this.client.on("error", (error) =>
      console.log(`REDIS_DB Connection Failed`),
    );
  }
  //connect
  public async connect() {
    await this.client.connect();
  }

  //** keys */
  //**Revoke Token Keys
  //base revoke token
  public baseRevokeToken({
    userId,
  }: {
    userId: Types.ObjectId | string;
  }): string {
    return `Auth::RevokeToken::${userId}`;
  }
  //revoke token
  public revokeTokenKey({
    userId,
    jti,
  }: {
    userId: Types.ObjectId | string;
    jti: string;
  }): string {
    return `${this.baseRevokeToken({ userId })}::${jti}`;
  }

  //**otp keys
  //otp key
  public otpKey({
    email,
    subject = EmailEnum.CONFIRM_EMAIL,
  }: OtpKeyType): string {
    return `Auth::OTP::${email}::${subject}`;
  }
  //otp max attempts key
  public otpMaxAttemptsKey({
    email,
    subject = EmailEnum.CONFIRM_EMAIL,
  }: OtpKeyType): string {
    return `${this.otpKey({ email, subject })}::MaxTrial`;
  }
  //otp block key
  public OtpBlockKey({
    email,
    subject = EmailEnum.CONFIRM_EMAIL,
  }: OtpKeyType): string {
    return `${this.otpKey({ email, subject })}::Block`;
  }

  //** Methods */
  //set
  public async set({
    key,
    value,
    time = undefined,
  }: {
    key: string;
    value: any;
    time?: number | undefined;
  }): Promise<any> {
    try {
      value = typeof value === "string" ? value : JSON.stringify(value);
      return time
        ? await this.client.set(key, value, { EX: time })
        : await this.client.set(key, value);
    } catch (error) {
      console.log("fail in redis set operation");
    }
  }
  //get
  //   public async get({ key }: { key: string }): Promise<string | number | null> {
  //     try {
  //       const value = await this.client.get(key);
  //       try {
  //         return JSON.parse(value as string);
  //       } catch (error) {
  //         return isNaN(Number(value)) ? value : Number(value);
  //       }
  //     } catch (error) {
  //       console.log(`fail in redis get operation`);
  //       return null;
  //     }
  //   }
  public async get<T = unknown>({ key }: { key: string }): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      return value as T;
    }
  }
  //del
  public async del({
    keys,
  }: {
    keys: string | string[];
  }): Promise<number | null> {
    try {
      if (!keys?.length) {
        return 0;
      }
      return await this.client.del(keys);
    } catch (error) {
      console.log(`fail in redis del operation`);
      return null;
    }
  }
  //keys
  public async keys({ pattern }: { pattern: string }): Promise<string[]> {
    try {
      return await this.client.keys(`${pattern}`);
    } catch (error) {
      console.log(`fail in redis keys operation`);
      return [];
    }
  }
  //ttl
  public async ttl({ key }: { key: string }): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.log(`fail in redis ttl operation`);
      return -2;
    }
  }
  //incr
  public async incr({ key }: { key: string }): Promise<number | undefined> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.log(`fail in redis incr operation`);
      return;
    }
  }
}

export const redisService = new RedisService();
