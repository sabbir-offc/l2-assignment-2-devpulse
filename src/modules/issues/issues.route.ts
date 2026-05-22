import { Router } from "express";

import verifyToken from "../../middleware/verifyToken";
import { issuesController } from "./issues.controller";

const router = Router();

router.post("/", verifyToken, issuesController.createIssue);

export const issuesRoute = router;
