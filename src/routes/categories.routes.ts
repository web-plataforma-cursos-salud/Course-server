import express from "express";
import {
  addCategoryValue,
  createCategories,
  deleteCategoryCollection,
  getAllCategories,
  getByIdCategory,
  getByIdCategoryValue,
  getByIdValueImageURL,
  deleteCategoryValue,
  modifyTitleCollectionCategory,
} from "../controllers";
import { authenticateToken } from "../middleware";
import { upload } from "../lib/multer";

const router = express.Router();

router.get("/categories/:id", authenticateToken, async (req, res) => {
  const { type } = req.query;
  if (type === "collection") {
    return getByIdCategory(req, res);
  }
  if (type === "value") {
    return getByIdCategoryValue(req, res);
  }
  if (type === "icon") {
    return getByIdValueImageURL(req, res);
  }

  return res.status(500).json({ error: true, message: "Falta query" });
});
router.get("/categories", authenticateToken, getAllCategories);

router.post(
  "/categories",
  upload.array("files"),
  authenticateToken,
  createCategories
);

router.patch(
  "/categories/:id",
  upload.array("files"),
  authenticateToken,
  async (req, res) => {
    const query = req.query.type;
    if (query === "add") {
      return addCategoryValue(req, res);
    }
    if (query === "title") {
      return modifyTitleCollectionCategory(req, res);
    }
    return res
      .status(400)
      .json({ error: true, message: "No se proporciono una query" });
  }
);

router.delete("/categories/:id", authenticateToken, async (req, res) => {
  const type = req.query.type;
  if (type === "collection") {
    return deleteCategoryCollection(req, res);
  }
  if (type === "value") {
    return deleteCategoryValue(req, res);
  }
  return res
    .status(400)
    .json({ error: true, message: "No se especifico una typo de eliminación" });
});

export { router };
