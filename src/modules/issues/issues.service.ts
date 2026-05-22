import { pool } from "../../db";
import { CreateIssueBody, UpdateIssueBody } from "./issues.interface";

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
const getSingleIssueFromDB = async (id: number) => {
  const issueResult = await pool.query("SELECT * FROM issues WHERE id = $1", [
    id,
  ]);

  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueResult.rows[0];

  // get reporter separately - no joins
  const userResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id],
  );

  const { reporter_id, ...rest } = issue;

  return {
    ...rest,
    reporter: userResult.rows[0] || null,
  };
};

const updateIssueIntoDB = async (
  id: number,
  body: UpdateIssueBody,
  userId: number,
  userRole: string,
) => {
  // first check if issue exists
  const issueResult = await pool.query("SELECT * FROM issues WHERE id = $1", [
    id,
  ]);

  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueResult.rows[0];

  // check permissions
  if (userRole === "contributor") {
    if (issue.reporter_id !== userId) {
      throw new Error("You can only update your own issues");
    }

    if (issue.status !== "open") {
      throw new Error("You can only edit issues that are still open");
    }
  }

  // validate fields if provided
  if (body.title && body.title.length > 150) {
    throw new Error("Title must be 150 characters or less");
  }

  if (body.description && body.description.length < 20) {
    throw new Error("Description must be at least 20 characters");
  }

  if (body.type && body.type !== "bug" && body.type !== "feature_request") {
    throw new Error("Type must be bug or feature_request");
  }

  // build update query with only provided fields
  const fields: string[] = [];
  const values: any[] = [];
  let count = 1;

  if (body.title) {
    fields.push(`title = $${count}`);
    values.push(body.title);
    count++;
  }

  if (body.description) {
    fields.push(`description = $${count}`);
    values.push(body.description);
    count++;
  }

  if (body.type) {
    fields.push(`type = $${count}`);
    values.push(body.type);
    count++;
  }

  if (fields.length === 0) {
    throw new Error("Nothing to update");
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE issues SET ${fields.join(", ")} WHERE id = $${count} RETURNING *`,
    values,
  );

  return result.rows[0];
};
export const issuesService = {
  createIssueService,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
};
