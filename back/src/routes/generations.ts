import express from "express";
import db from "../db/database";
import {createGeneration} from "../services/generationService";


const router = express.Router();

router.post("/generations", (req, res) => {
    try {
        const { prompt, style } = req.body;

        const generation = createGeneration(db, prompt, style);

        res.status(201).json(generation);
    } catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

export default router;