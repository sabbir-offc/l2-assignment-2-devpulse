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
const getAllIssues = async (req: AuthRequest, res: Response) => {
  try {
    const sort = req.query.sort as string;
    const type = req.query.type as string;
    const status = req.query.status as string;

    const result = await issuesService.getAllIssuesFromDB(sort, type, status);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleIssue = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await issuesService.getSingleIssueFromDB(id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: error.message,
    });
  }
};

const updateIssue = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await issuesService.updateIssueIntoDB(
      id,
      req.body,
      userId,
      userRole,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    // figure out what status code to send based on error message
    if (error.message === "Issue not found") {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    } else if (
      error.message === "You can only update your own issues" ||
      error.message === "You can only edit issues that are still open"
    ) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }
};

export const issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
};
