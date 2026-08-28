import express from "express";
import db from "../db/database";
import {
  createGeneration,
  getGenerationById,
  getAllGenerations,
} from "../services/generationService";

const router = express.Router();

router.post("/generations", async (req, res) => {
  try {
    const { prompt, style = null } = req.body;

    const generation = await createGeneration(
      db,
      prompt,
      style
    );

    return res.status(201).json(generation);
  } catch (error) {
    return res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
});

router.get("/generations/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res
      .status(400)
      .json({ error: "Invalid generation ID" });
  }

  const generation = getGenerationById(db, id);

  if (!generation) {
    return res
      .status(404)
      .json({ error: "Generation not found" });
  }

  return res.status(200).json(generation);
});

router.get("/generations", (req, res) => {
  const generations = getAllGenerations(db);

  return res.status(200).json(generations);
});

export default router;