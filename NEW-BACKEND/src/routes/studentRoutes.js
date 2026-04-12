import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { 
  getCoreInfo, saveCoreInfo, 
  getPersonalInfo, savePersonalInfo, 
  getOfficialInfo, saveOfficialInfo,
  getSchooling, saveSchooling,
  getCurrentScores, saveCurrentScores,
  getPreviousEdu, savePreviousEdu,
  getStatuses,
  getDocument, saveDocument,
  getOffersList, createOffer, getOffer, saveOffer
} from "../controllers/studentController.js";

const studentRoutes = express.Router();

// Enforce auth strictly on all student profile endpoints
studentRoutes.use(authMiddleware);

studentRoutes.get("/statuses", getStatuses);

studentRoutes.get("/core-info", getCoreInfo);
studentRoutes.post("/core-info", saveCoreInfo);

studentRoutes.get("/personal-info", getPersonalInfo);
studentRoutes.post("/personal-info", savePersonalInfo);

studentRoutes.get("/official-info", getOfficialInfo);
studentRoutes.post("/official-info", saveOfficialInfo);

studentRoutes.get("/academics/schooling", getSchooling);
studentRoutes.post("/academics/schooling", saveSchooling);

studentRoutes.get("/academics/current-scores", getCurrentScores);
studentRoutes.post("/academics/current-scores", saveCurrentScores);

studentRoutes.get("/academics/previous-edu", getPreviousEdu);
studentRoutes.post("/academics/previous-edu", savePreviousEdu);

studentRoutes.get("/document/:docKey", getDocument);
studentRoutes.post("/document/:docKey", saveDocument);

studentRoutes.get("/offers", getOffersList);
studentRoutes.post("/offers/new", createOffer);
studentRoutes.get("/offers/:id", getOffer);
studentRoutes.post("/offers/:id", saveOffer);

export default studentRoutes;
