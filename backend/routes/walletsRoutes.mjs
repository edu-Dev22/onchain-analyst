import express from "express";
import { rebuildFlow, getFlow } from "../controllers/controller.mjs";

const router = express.Router();

router.get("/flow", getFlow);
router.post("/rebuild", rebuildFlow);

export default router;
