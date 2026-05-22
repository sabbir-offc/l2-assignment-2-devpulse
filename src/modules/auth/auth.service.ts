import bcrypt from "bcrypt";
import { pool } from "../../db";
import { SignupBody } from "./auth.interface";

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

export const authService = {
  signupUserIntoDB,
};
