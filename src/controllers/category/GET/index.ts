import { Request, Response } from "express";
import db from "../../../lib/sequelize";
import { getSecureUrl } from "../../../lib";

const User = db.User;

export const getAllCategories = async (req: Request, res: Response) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(401).json({ error: "No authority" });
  }

  try {
    const user = await User.findByPk(user_id);
    if (!user || !user.getCategories) {
      return res
        .status(400)
        .json({ error: true, message: "El usuario no tiene categorías" });
    }

    const categories = await user.getCategories({
      order: [["category_id", "ASC"]],
    });
    const formatterCategories = categories.map(
      (category: {
        values: { icon_url: string; value: string; id: string }[];
        title: any;
        category_id: any;
      }) => {
        const values = category.values.map(
          (value: { icon_url: string; value: string; id: string }) => {
            return {
              icon_url: getSecureUrl(value.icon_url, user_id),
              value: value.value,
              id: value.id,
            };
          }
        );
        return {
          title: category.title,
          values,
          category_id: category.category_id,
        };
      }
    );

    return res.status(200).json(formatterCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: true });
  }
};

export const getByIdCategory = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!user_id) {
    return res.status(401).json({ error: "No authority" });
  }

  if (!id) {
    return res
      .status(400)
      .json({ error: "No se proporcionó un id para buscar una categoría" });
  }

  try {
    const user = await User.findByPk(user_id);
    if (!user || !user.getCategories) {
      return res
        .status(400)
        .json({ error: true, message: "El usuario no tiene categorías" });
    }

    const categories = await user.getCategories({
      order: [["category_id", "ASC"]],
    });
    const selectedCategory = categories.find(
      (category: { category_id: string }) => category.category_id === id
    );

    return res.status(200).json(selectedCategory);
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: true });
  }
};

export const getByIdCategoryValue = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!user_id) {
    return res.status(401).json({ error: "No authority" });
  }

  if (!id) {
    return res
      .status(400)
      .json({ error: "No se proporcionó un id para buscar una categoría" });
  }

  try {
    const user = await User.findByPk(user_id);
    if (!user || !user.getCategories) {
      return res
        .status(400)
        .json({ error: true, message: "El usuario no tiene categorías" });
    }

    const categories = await user.getCategories({
      order: [["category_id", "ASC"]],
    });
    const selectedValue = categories.reduce(
      (foundValue: any, category: { values: any[] }) => {
        return (
          foundValue ||
          category.values.find((value: { id: string }) => value.id === id)
        );
      },
      null
    );

    return res.status(200).json(selectedValue);
  } catch (error) {
    console.error("Error fetching category value by ID:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: true });
  }
};

export const getByIdValueImageURL = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!user_id) {
    return res.status(401).json({ error: "No authority" });
  }

  if (!id) {
    return res
      .status(400)
      .json({ error: "No se proporcionó un id para buscar una categoría" });
  }

  try {
    const user = await User.findByPk(user_id);
    if (!user || !user.getCategories) {
      return res
        .status(400)
        .json({ error: true, message: "El usuario no tiene categorías" });
    }

    const categories = await user.getCategories({
      order: [["category_id", "ASC"]],
    });
    const selectedValue = categories.reduce(
      (foundValue: any, category: { values: any[] }) => {
        return (
          foundValue ||
          category.values.find((value: { id: string }) => value.id === id)
        );
      },
      null
    );

    if (!selectedValue) {
      return res.status(404).json({ error: "Value not found" });
    }

    const url = getSecureUrl(selectedValue.icon_url, user_id);

    return res.status(200).json(url);
  } catch (error) {
    console.error("Error fetching value image URL by ID:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: true });
  }
};
