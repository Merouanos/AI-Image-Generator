import Database from "better-sqlite3";
import fs from "node:fs";

console.log("Database module loaded");
const db = new Database("data/app.db");
const schema = fs.readFileSync("src/db/schema.sql", "utf-8");
db.exec(schema);
console.log("Schema executed");