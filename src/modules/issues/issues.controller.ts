import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../../middleware/verifyToken";
import { issuesService } from "./issues.service";

const createIssue = async (req: AuthRequest, res: Response) => {
  try {
    const reporterId = req.user!.id;
    const result = await issuesService.createIssueService(req.body, reporterId);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

export const issuesController = {
  createIssue,
};
