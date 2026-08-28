import express from "express";
import path from "node:path";
import "./db/database";
import router from "./routes/generations";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(
  "/images",
  express.static(path.resolve("data/Images"))
);

app.use("/api", router);

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});