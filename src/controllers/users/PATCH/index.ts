import { Request, Response } from "express";
import db from "../../../lib/sequelize";
import { getSecureUrl, uploadToCloudinary } from "../../../lib";

const User = db.User;

export const changeAvatar = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const file = req.file;
  try {
    const user = await User.findByPk(user_id);
    if (!file)
      return res
        .status(400)
        .json({ error: true, message: "No se mando una imagen" });
    const public_id = await uploadToCloudinary(
      file,
      `${user_id}/avatar`,
      64,
      64
    );
    if (!public_id)
      return res
        .status(400)
        .json({ error: true, message: "Error al subir la imagen" });
    const url = getSecureUrl(`avatar/${public_id}`, user_id);
    await user.update({ avatar_url: url });
    return res.status(200).json({ error: false, message: "Todo oK", url });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error al cambiar avatar" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { category_id, category_value } = req.body;
  try {
    return res.status(200).json({ category_id, category_value });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error al buscar los productos" });
  }
};

export const recoveryPassword = async (req: Request, res: Response) => {
  const { category_id, category_value } = req.body;
  try {
    return res.status(200).json({ category_id, category_value });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error al buscar los productos" });
  }
};

export const changeName = async (req: Request, res: Response) => {
  const { category_id, category_value } = req.body;
  try {
    return res.status(200).json({ category_id, category_value });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error al buscar los productos" });
  }
};
