import bcrypt from "bcrypt";
import { pool } from "../../db";
import { SignupBody } from "./auth.interface";
import jwt from "jsonwebtoken";
import config from "../../config";

const signupUserIntoDB = async (body: SignupBody) => {
  const { name, email, password, role } = body;

  // check if email already exists
  const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);

  if (emailCheck.rows.length > 0) {
    throw new Error("Email already registered");
  }

  // hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role],
  );

  return result.rows[0];
};

const loginUserFromDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  // check if user exists
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  // compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // generate token
  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    config.jwt_secret as string,
    { expiresIn: config.jwt_expires_in as "7d" },
  );

  // dont send password back
  const { password: _pw, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};
export const authService = {
  signupUserIntoDB,
  loginUserFromDB,
};
