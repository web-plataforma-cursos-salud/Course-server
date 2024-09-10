import { Request, Response } from "express";
import db from "../../../lib/sequelize";

const User = db.User;

export const preferenceInProductView = async (req: Request, res: Response) => {
  const { user_id } = req.body;
  const { preferenceInProductView } = req.query;
  try {
    const user = await User.findByPk(user_id);

    await user.update({
      config: {
        ...user.config,
        preference_in_product_view: preferenceInProductView,
      },
    });
    return res.status(200).json({ error: false, message: "Todo ok " });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Error al buscar los productos" });
  }
};
