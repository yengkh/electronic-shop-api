import { TokenPayload } from "../types/token-payload.interface";
import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_LIFE = process.env.REFRESH_TOKEN_LIFE;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined.");
}
if (!REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET is not defined.");
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_LIFE as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload) => {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_LIFE as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};
