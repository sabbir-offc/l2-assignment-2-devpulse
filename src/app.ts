import express from "express";
import cors from "cors";
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "devpulse server is running!",
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRoute);

export default app;
