import { pool } from "../../db";
import { CreateIssueBody } from "./issues.interface";

const createIssueService = async (
  body: CreateIssueBody,
  reporterId: number,
) => {
  const { title, description, type } = body;

  // basic validation
  if (!title || !description || !type) {
    throw new Error("title, description and type are required");
  }

  if (title.length > 150) {
    throw new Error("Title must be 150 characters or less");
  }

  if (description.length < 20) {
    throw new Error("Description must be at least 20 characters");
  }

  if (type !== "bug" && type !== "feature_request") {
    throw new Error("Type must be bug or feature_request");
  }

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporterId],
  );

  return result.rows[0];
};

export const issuesService = {
  createIssueService,
};
