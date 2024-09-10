import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../../../lib/sequelize";
import { uploadToCloudinary } from "../../../lib";

const Category = db.Category;
const User = db.User;

export const addCategoryValue = async (req: Request, res: Response) => {
  const category_id = req.params.id;
  const { value, user_id } = req.body;
  try {
    if (!user_id)
      return res
        .status(401)
        .json({ error: true, message: "Usuario no autorizado" });
    if (!category_id)
      return res
        .status(400)
        .json({ error: true, message: "No se proporciono un id de categoría" });
    const files = req.files as Express.Multer.File[];
    if (!files) return res.status(400).json({ error: "Fatal image" });
    const user = await User.findByPk(user_id);
    const userCategories = await user.getCategories();
    const validateExistCategory = userCategories.find(
      (category: { category_id: string }) =>
        category.category_id === category_id
    );
    if (!validateExistCategory)
      return res
        .status(400)
        .json({ error: true, message: "La categoría no existe en el usuario" });
    const selectedCategory = await Category.findByPk(category_id);
    const validateRepeatValue = selectedCategory.values.find(
      (e: { value: string }) => e.value === value
    );
    if (validateRepeatValue)
      return res.status(400).json({
        error: true,
        message: `Èl valor ( ${value} , ya esta cargado )`,
      });

    const icon_url = await uploadToCloudinary(
      files[0],
      `${user_id}/categories`,
      64,
      64
    );
    if (!icon_url)
      return res
        .status(400)
        .json({ error: true, message: "No se puedo subir el icono" });
    const newValue = {
      id: uuidv4(),
      value,
      icon_url: `categories/${icon_url}`,
    };

    const updateCategory = selectedCategory.update({
      values: [...selectedCategory.values, newValue],
    });

    return res
      .status(200)
      .json({ msj: "Hola", updateCategory, files: files[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: "Error in addValue" });
  }
};

export const modifyTitleCollectionCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const category_id = req.params.id;
    const { user_id, title } = req.body;
    if (!user_id)
      return res
        .status(401)
        .json({ error: true, message: "Usuario no autorizado" });
    if (!category_id)
      return res
        .status(400)
        .json({ error: true, message: "No se proporciono un id de categoría" });
    const categorySelected = await Category.findByPk(category_id);
    if (!categorySelected)
      return res
        .status(400)
        .json({ error: true, message: "No se encontró la categoría" });
    const updateCategory = await categorySelected.update({
      title,
    });
    return res.status(200).json(updateCategory);
  } catch (error) {
    return res.status(500).json({ error: true, message: error });
  }
};
