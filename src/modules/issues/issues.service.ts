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
const getAllIssuesFromDB = async (
  sort: string,
  type: string,
  status: string,
) => {
  let sqlQuery = "SELECT * FROM issues";
  const params: string[] = [];
  const conditions: string[] = [];

  if (type) {
    conditions.push(`type = $${params.length + 1}`);
    params.push(type);
  }

  if (status) {
    conditions.push(`status = $${params.length + 1}`);
    params.push(status);
  }

  if (conditions.length > 0) {
    sqlQuery += " WHERE " + conditions.join(" AND ");
  }

  if (sort === "oldest") {
    sqlQuery += " ORDER BY created_at ASC";
  } else {
    sqlQuery += " ORDER BY created_at DESC";
  }

  const issuesResult = await pool.query(sqlQuery, params);
  const issues = issuesResult.rows;

  if (issues.length === 0) {
    return [];
  }

  const issuesWithReporter = [];

  for (const issue of issues) {
    const userResult = await pool.query(
      "SELECT id, name, role FROM users WHERE id = $1",
      [issue.reporter_id],
    );

    const { reporter_id, ...rest } = issue;

    issuesWithReporter.push({
      ...rest,
      reporter: userResult.rows[0],
    });
  }

  return issuesWithReporter;
};
export const issuesService = {
  createIssueService,
  getAllIssuesFromDB,
};
