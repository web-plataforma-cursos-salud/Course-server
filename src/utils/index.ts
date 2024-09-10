import fsPromises, { constants, access, unlink } from "node:fs/promises";
import path from "node:path";
import fs from "node:fs";
import sharp from "sharp";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

interface ImageDestinationOptions {
  categoryFolder?: string;
  productFolder: string;
  files: Express.Multer.File[];
  mainImage?: string;
  withMiniature?: boolean;
}

const root = process.cwd();

const transformarString = (inputString: string): string => {
  const cleanString = inputString.replace(/[^a-zA-Z0-9\s]/g, "");
  const transformedString = cleanString.replace(/\s+/g, "_");

  return transformedString.toLowerCase();
};

export const handlerImageDestination = ({
  categoryFolder = "sin_name",
  productFolder,
  files,
  mainImage = "",
  withMiniature = true,
}: ImageDestinationOptions) => {
  const nickFolder = transformarString(categoryFolder);
  const collectionName = transformarString(productFolder);
  const direction: string[] = [];
  let primaryImage = "";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.originalname.split(".").pop() || "";
    const newFileName = `${Date.now() + "--" + Math.random() + "-" + i}.${ext}`;
    const collectionFolderPath = path.join(
      root,
      "public",
      "uploads",
      nickFolder
    );
    const originalImagePath = path.join(
      collectionFolderPath,
      collectionName,
      `original-${newFileName}`
    );

    fs.mkdirSync(collectionFolderPath, { recursive: true });
    fs.mkdirSync(path.join(collectionFolderPath, collectionName), {
      recursive: true,
    });

    fs.writeFileSync(originalImagePath, file.buffer);

    if (file.originalname === mainImage) {
      const miniatureFolder = path.join(root, "public", "optimize", nickFolder);
      const miniatureImagePath = path.join(
        miniatureFolder,
        collectionName,
        `miniature-${newFileName}`
      );
      fs.mkdirSync(path.join(miniatureFolder), {
        recursive: true,
      });
      fs.mkdirSync(path.join(miniatureFolder, collectionName), {
        recursive: true,
      });

      sharp(file.buffer)
        .rotate()
        .resize({
          width: 384,
          height: 384,
          fit: "fill",
        })
        .toFile(miniatureImagePath);
      primaryImage = `uploads/${nickFolder}/${collectionName}/original-${newFileName}`;
      withMiniature &&
        direction.unshift(
          `optimize/${nickFolder}/${collectionName}/miniature-${newFileName}`
        );
    }

    direction.push(
      `uploads/${nickFolder}/${collectionName}/original-${newFileName}`
    );
  }

  return { direction, primaryImage };
};

export const removeImage = async (imagePath: string) => {
  const pathComplete = path.join(root, "public", imagePath);
  try {
    await access(pathComplete, constants.F_OK);
    await unlink(pathComplete);
    return { OK: true, message: "Imagen eliminada correctamente!" };
  } catch (error) {
    if (error === "ENOENT") {
      return { OK: false, message: "El archivo no existe" };
    } else {
      return { OK: false, message: "Error al eliminar la imagen" };
    }
  }
};

export const deleteEmptyFolders = async (route: string, levels = 1) => {
  try {
    const pathParts = route.split("/");
    const commonPath = pathParts.slice(0, -levels).join("/") + "/";
    const folderPath = path.join(root, "public", commonPath);
    const files = await fsPromises.readdir(folderPath);
    if (!files || files.length === 0) {
      await fsPromises.rmdir(folderPath);
    }
  } catch (err) {
    console.error("Error al eliminar la carpeta:", err);
  }
};
const saltRoundsString = process.env.SALT_ROUNDS;
if (!saltRoundsString) {
  throw new Error(
    "The salt rounds were not found in the environment variables"
  );
}
const saltRounds = parseInt(saltRoundsString, 10);

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const getFileNameWithoutExtension = (
  fileNameWithExtension: string
): string => {
  const lastIndex = fileNameWithExtension.lastIndexOf(".");
  if (lastIndex !== -1) {
    return fileNameWithExtension.substring(0, lastIndex);
  }
  return `${fileNameWithExtension}-${Math.random() * 10}`;
};

export const cleanObject = (
  obj: Record<string, any>,
  keysToCheck: string[]
) => {
  const propertiesToEdit: Record<string, any> = {};
  keysToCheck.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
        delete obj[key];
      } else {
        propertiesToEdit[key] = obj[key];
      }
    }
  });

  return propertiesToEdit;
};

export const isNumber = (str: string) => {
  const regex = /^-?\d+(\.\d+)?$/;

  return regex.test(str);
};

export const formatDate = () => {
  const now: Date = new Date();
  const pad = (num: number): string => num.toString().padStart(2, "0");

  const year: number = now.getFullYear();
  const month: string = pad(now.getMonth() + 1);
  const day: string = pad(now.getDate());

  const hours: string = pad(now.getHours());
  const minutes: string = pad(now.getMinutes());
  const seconds: string = pad(now.getSeconds());
  const milliseconds: string = now
    .getMilliseconds()
    .toString()
    .padStart(3, "0");

  const timezoneOffset: number = -now.getTimezoneOffset();
  const sign: string = timezoneOffset >= 0 ? "+" : "-";
  const offsetHours: string = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const offsetMinutes: string = pad(Math.abs(timezoneOffset) % 60);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}${offsetMinutes}`;
};
