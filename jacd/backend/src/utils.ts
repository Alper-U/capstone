import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwt_secret } from "./auth";
import { NotFoundError } from "./error";

interface JwtPayload {
  uid: number
}

export function generateHash(password: string): string {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

export function generateToken(uid: number): string {
  return jwt.sign({ uid: uid }, jwt_secret);
}

export function verifyToken(token: string, uid: number): boolean {
  try {
    const data = jwt.verify(token, jwt_secret) as JwtPayload;
    if (data.uid != uid) return false;
    else return true;
  } catch {
    throw new NotFoundError("No token parsed");
  }
}

export function decodeToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, jwt_secret) as JwtPayload;
  } catch {
    throw new NotFoundError("No token parsed");
  }
}

export function validEmail(email: string): boolean {
  // Adapted from email-validator for node
  const regex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  const splitEmail = email.split('@');

  if (splitEmail.length !== 2) return false;

  const name = splitEmail[0];
  const domain = splitEmail[1];

  if (name.length > 64) return false;
  if (domain.length > 255) return false;

  const splitDomain = domain.split('.');
  
  if (splitDomain.some(function (part) {
    return part.length > 64;
  })) return false;

  return regex.test(email);
}
