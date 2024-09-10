import express, { Request, Response } from "express";
import {
  createUser,
  getAvatar,
  getPreferenceInProductView,
  getUserId,
  preferenceInProductView,
  userLogin,
} from "../controllers";
import { authenticateToken } from "../middleware";
import { changeAvatar } from "../controllers/users/PATCH";
import { upload } from "../lib/multer";

const router = express.Router();

router.get("/user/preference", authenticateToken, getPreferenceInProductView);
router.get("/user", async (req: Request, res: Response) => {
  const query = req.query;
  if (query.get === "id") {
    return getUserId(req, res);
  }
  return res.status(400).json({ error: true, message: "NO se encontró nada" });
});
router.get("/user/avatar", authenticateToken, getAvatar);
router.patch(
  "/user/avatar",
  upload.single("file"),
  authenticateToken,
  changeAvatar
);
router.post("/user", createUser);
router.post("/user/login", userLogin);
router.put("/user/preference", authenticateToken, preferenceInProductView);
export { router };
