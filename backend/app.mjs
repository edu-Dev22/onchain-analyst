import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import walletsRoutes from "./routes/walletsRoutes.mjs";

const app = express();
const PORT = 3000;
const dirname = path.dirname(fileURLToPath(import.meta.url));

// 🔹 Habilitar parsing de JSON
app.use(express.json());

// 🔹 Rutas API
app.use("/api", walletsRoutes);

// 🔹 Servir frontend
app.use(express.static(path.join(dirname, "../frontend")));

// 🔹 Servir slider
app.use("/priceslider", express.static(path.join(dirname, "../priceslider")));

// 🔹 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});