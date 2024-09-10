import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../../../lib/sequelize";

const User = db.User;

interface DecodedToken {
  user_id: string;
}

export const getUserId = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    if (typeof token === "string") {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "", {
        algorithms: ["HS256"],
      }) as DecodedToken;

      return res.status(200).json({ user_id: decodedToken.user_id });
    }

    return res.status(401).json({ error: "Token not provided" });
  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    return res.status(401).json({ error });
  }
};

export const getAvatar = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    if (body.user_id) {
      const avatar = await User.findByPk(req.body.user_id);

      return res.status(200).json(avatar.avatar_url);
    }

    return res.status(401).json({ error: "Falta token" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error al pedir la url del avatar" });
  }
};

export const getPreferenceInProductView = async (
  req: Request,
  res: Response
) => {
  const body = req.body;
  try {
    if (body.user_id) {
      const user = await User.findByPk(req.body.user_id);

      return res.status(200).json({
        preference_in_product_view:
          user.config.preference_in_product_view || false,
      });
    }

    return res.status(401).json({ error: "Falta token" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Error al pedir la url getPreferenceInProductView" });
  }
};
