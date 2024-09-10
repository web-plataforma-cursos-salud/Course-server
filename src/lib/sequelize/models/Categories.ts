import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from "sequelize";
import { Uuid } from "../../../types";

type CategoriesItem = {
  id: string;
  value: string;
  icon_url: string;
};

export default (sequelize: Sequelize) => {
  class Category extends Model<
    InferAttributes<Category, { omit: "user_id" }>,
    InferCreationAttributes<Category, { omit: "user_id" }>
  > {
    declare category_id: Uuid;
    declare title: string;
    declare values: CategoriesItem[];

    declare user_id?: NonAttribute<Uuid>;
  }

  Category.init(
    {
      category_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: { type: DataTypes.STRING, defaultValue: "" },
      values: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        defaultValue: [],
        validate: {
          isArrayOfObjects(value: CategoriesItem[]) {
            if (!Array.isArray(value)) {
              throw new Error("Values must be an array");
            }
            for (const item of value) {
              if (
                typeof item !== "object" ||
                item === null ||
                Array.isArray(item)
              ) {
                throw new Error("Each item in values must be an object");
              }
              if (!item.icon_url || typeof item.icon_url !== "string") {
                throw new Error(
                  "Each item in values must have an 'icon_url' property of type string"
                );
              }
              if (!item.value || typeof item.value !== "string") {
                throw new Error(
                  "Each item in values must have a 'value' property of type string"
                );
              }
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      timestamps: false,
    }
  );
  return Category;
};
