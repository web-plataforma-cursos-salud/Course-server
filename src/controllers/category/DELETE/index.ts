import { Request, Response } from "express";
import db from "../../../lib/sequelize";
import { deleteImageToCloudinary } from "../../../lib/cloudinary";

const Category = db.Category;
const User = db.User;

export const deleteCategoryCollection = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    const category_id = req.params.id;

    if (!category_id)
      return res
        .status(400)
        .json({ error: true, message: "no se proporciono un category id" });
    if (!user_id)
      return res
        .status(401)
        .json({ error: true, message: "El usuario no esta autentificado" });
    const categorySelected = await Category.findByPk(category_id);

    const userProducts = await User.findByPk(user_id)
      .then((user: { getProducts: () => any }) => user.getProducts())
      .then((products: any[]) =>
        products.filter(
          (product: { category_id: string; category_value: string }) =>
            product.category_id === category_id
        )
      );
    if (userProducts) {
      userProducts.forEach(async (product: any) => {
        await product.update({ category_value: null, category_id: null });
      });
    }
    categorySelected.values.forEach(async (value: { icon_url: any }) => {
      await deleteImageToCloudinary(`${user_id}/${value.icon_url}`);
    });

    const destroyCategory = await categorySelected.destroy();

    return res.status(200).json({ message: destroyCategory });
  } catch (error) {
    console.log("Error in deleteCategory ->", error);
    return res.status(500).json({ error: true, message: error });
  }
};

export const deleteCategoryValue = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    const category_id = req.params.id;
    const category_value = req.query.value_id;
    if (!category_id)
      return res
        .status(400)
        .json({ error: true, message: "no se proporciono un category id" });
    if (!category_value)
      return res.status(400).json({
        error: true,
        message: "no se proporciono un category value id",
      });
    if (!user_id)
      return res
        .status(401)
        .json({ error: true, message: "El usuario no esta autentificado" });
    const categorySelected = await Category.findByPk(category_id);
    const deleteValue = categorySelected?.values.find(
      (value: { id: string }) => value.id === category_value
    );
    const newValues = categorySelected?.values.filter(
      (value: { id: string }) => value.id !== category_value
    );
    const userProducts = await User.findByPk(user_id)
      .then((user: { getProducts: () => any }) => user.getProducts())
      .then((products: any[]) =>
        products.filter(
          (product: { category_id: string; category_value: string }) =>
            product.category_id === category_id &&
            product.category_value === category_value
        )
      );
    if (userProducts) {
      userProducts.forEach(async (product: any) => {
        await product.update({ category_value: null });
      });
    }
    await deleteImageToCloudinary(`${user_id}/${deleteValue.icon_url}`);
    const newValuesInCategory = await categorySelected.update({
      values: newValues,
    });
    return res.status(200).json({ message: newValuesInCategory });
  } catch (error) {
    console.log("Error in deleteCategory ->", error);
    return res.status(500).json({ error: true, message: error });
  }
};
