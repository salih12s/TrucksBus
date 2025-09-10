import { Router } from "express";
import {
  getCities,
  getDistrictsByCity,
} from "../controllers/locationController";

const router = Router();

// Public routes
router.get("/", getCities);
router.get("/:cityId/districts", getDistrictsByCity);

export default router;
