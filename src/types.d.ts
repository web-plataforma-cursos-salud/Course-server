export type Uuid = string & { __uuidBrand: never };
export type ISO8601Date = string & { __iso8601DateBrand: never };
export type ImagePath = string & { __imagePathBrand: never };
export type Gender = "MALE" | "FEMALE" | "UNSPECIFIED";
export type Brand = "NIKE" | "PUMA" | "ADDIDAS" | "OTRA";
export type Styles = "URBAN" | "SPORTS" | "UNSPECIFIED";
export type CategoryType =
  | "t-shirts"
  | "pants"
  | "sneakers"
  | "sweatshirts"
  | "accessories"
  | "toys"
  | "jackets"
  | "cap"
  | "boots"
  | "handbags"
  | "bags"
  | "bed sheets"
  | "socks"
  | "underwear"
  | "leggings"
  | "jeans"
  | "sandals"
  | "other";

export type CollectionType = {
  id: Uuid;
  name: string;
  images: ImagePath[];
};

export type VariantsDetails = {
  color: string;
  gender: Gender;
  brand: Brand;
  style: Styles;
};

export interface VariantsImage {
  id: Uuid;
  created_at: ISO8601Date;
  primary_image: ImagePath;
  miniature_image: ImagePath;
  variations: CollectionType[];
  description: string;
  details: VariantsDetails;
  category: CategoryType;
  user_id: Uuid;
}

declare module "../config/sequelize.config" {
  const sequelizeConfig: any;
  export default sequelizeConfig;
}
