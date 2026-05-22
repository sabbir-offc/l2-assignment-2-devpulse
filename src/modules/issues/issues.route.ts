import { Router } from "express";

import verifyToken from "../../middleware/verifyToken";
import { issuesController } from "./issues.controller";

const router = Router();

router.post("/", verifyToken, issuesController.createIssue);
router.get("/", issuesController.getAllIssues);
router.get("/:id", issuesController.getSingleIssue);

router.patch("/:id", verifyToken, issuesController.updateIssue);
router.delete("/:id", verifyToken, issuesController.deleteIssue);

export const issuesRoute = router;
