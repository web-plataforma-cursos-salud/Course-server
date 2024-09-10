import { app } from "./src/app";
import dotenv from "dotenv";
import db from "./src/lib/sequelize";

dotenv.config();

const PORT = process.env.PORT || 3210;
const main = async () => {
  try {
    await db.sequelize.sync({ force: false });

    app.listen(PORT, () => {
      console.log(`Servidor en ejecución en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Error", error);
  }
};
main();
