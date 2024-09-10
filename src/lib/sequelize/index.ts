import { Sequelize } from "sequelize";
import userModel from "./models/Users";
import categoryModel from "./models/Categories";
import { config as connectionPSQL } from "./config";

const env = "development";
const config = connectionPSQL[env];
if (
  !config.username ||
  !config.password ||
  !config.database ||
  !config.host ||
  !config.port
) {
  throw new Error("Missing required connection configuration properties.");
}
const db: Record<string, any> = {};

let sequelize: Sequelize;

sequelize = new Sequelize(
  config.database || "",
  config.username || "",
  config.password || "",
  { host: config.host, dialect: "postgres", logging: false }
);

const User = userModel(sequelize);
const Category = categoryModel(sequelize);

db[User.name] = User;
db[Category.name] = Category;

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//Size.sync({ force: true });
//Variation.sync({ force: true });
// Movements.sync({ force: true });
//FinancialAccounts.sync({ force: true });
// PaymentMethods.sync({});
//User.sync({ alter: true });
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
