import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { hashPassword } from "../../../utils";
import db from "../../../lib/sequelize";

const User = db.User;
const Category = db.Category;

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      gender,
      username,
      birthday_date,
    } = req.body;
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !gender ||
      !username ||
      !birthday_date
    ) {
      return res
        .status(400)
        .json({ error: "Missing fields required to create the user" });
    }
    const validateEmail = await User.findAll({
      where: {
        email,
      },
    });
    const validateUserName = await User.findAll({
      where: {
        username,
      },
    });
    if (!!validateUserName.length || !!validateEmail.length)
      return res
        .status(400)
        .json({ message: "Username or email is already registered" });
    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "The password must be a minimum of 8 in length" });
    const password_hash = await hashPassword(password);
    const avatar_url = `https://res.cloudinary.com/ldn-img/image/upload/v1711132173/default-avatar/${gender.toLowerCase()}.webp`;
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      gender,
      username,
      birthday_date,
      avatar_url,
      recent_activity: [],
    });

    await Category.create({
      title: "Default",
      values: [
        {
          id: "default",
          value: "Sin categoría",
          icon_url: "categories/default",
        },
      ],
      user_id: newUser.user_id,
    });

    return res.status(201).send({ message: "User create" });
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email_or_user, password } = req.body;
    let emailOrUser: "email" | "username" | "" = "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isUsername = /^[a-zA-Z0-9_]+$/;
    if (emailRegex.test(email_or_user)) {
      emailOrUser = "email";
    }
    if (isUsername.test(email_or_user)) {
      emailOrUser = "username";
    }

    if (emailOrUser.length) {
      const userSearch = (await User.findOne({
        where: {
          [emailOrUser]: email_or_user,
        },
        attributes: ["password_hash", "user_id"],
        raw: true,
      })) as { password_hash?: string; user_id?: string };
      if (userSearch) {
        const isPasswordValid = await bcrypt.compare(
          password,
          userSearch?.password_hash || ""
        );
        if (isPasswordValid && process.env.JWT_SECRET) {
          const token = jwt.sign(
            { user_id: userSearch.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
          );
          await User.update(
            { session_token: token },
            { where: { user_id: userSearch.user_id } }
          );
          const session_token = await User.findByPk(userSearch.user_id, {
            attributes: ["session_token"],
          });

          return res.status(200).json({ data: session_token });
        } else {
          return res.status(400).json({ message: "Invalid password" });
        }
      } else {
        return res.status(400).json({ message: "invalid user or email" });
      }
    } else {
      return res.status(400).json({ message: "invalid user or email" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
