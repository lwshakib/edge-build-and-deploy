import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } from "../env";

export const pub = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT, 10),
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
});

export const sub = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT, 10),
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
});
