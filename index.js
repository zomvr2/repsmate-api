/**
 * @fileoverview This file contains an Express.js server that provides endpoints for retrieving exercise data.
 * The server listens on port 3000 and communicates with a remote JSON file to fetch exercise data.
 * It includes endpoints for retrieving a single exercise by ID, searching exercises by name, retrieving random exercises,
 * and getting exercise recommendations based on equipment and primary muscle.
 * The server handles errors and returns appropriate status codes and error messages.
 */

const express = require("express");
const axios = require("axios");
const Fuse = require("fuse.js");

const app = express();
const port = 3000 || process.env.PORT;
const baseUrl = "https://raw.githubusercontent.com/zomvr2/free-exercise-db/main";
const url = `${baseUrl}/dist/exercises.json`;

/**
 * Default route that returns a simple message to indicate that the server is working fine.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/", (req, res) => {
  res.send("All working fine!");
});

/**
 * Endpoint for retrieving a single exercise by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @example GET /exercise/123
 * Sample URL: http://localhost:3000/exercise/Reverse_Grip_Triceps_Pushdown
 */
app.get("/exercise/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const response = await axios.get(url);
    const exercises = response.data;

    const exercise = exercises.find((exercise) => exercise.id === id);

    if (!exercise) {
      res.status(404).send("Exercise not found");
      return;
    }

    res.send(exercise);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

/**
 * Endpoint for searching exercises by name.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @example GET /search?name=pushup&page=1
 * Sample URL: http://localhost:3000/search?name=pushup&page=1
 */
app.get("/search", async (req, res) => {
  const name = req.query.name;
  const page = req.query.page || 1;

  try {
    const response = await axios.get(url);
    const exercises = response.data;

    const fuse = new Fuse(exercises, {
      keys: ["name"],
    });

    const result = fuse.search(name);
    const start = (page - 1) * 10;
    const end = start + 10;
    const data = result.slice(start, end);

    res.json({
      results: result.length,
      page: parseInt(page),
      total_pages: Math.ceil(result.length / 10),
      data,
    });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

/**
 * Endpoint for retrieving random exercises.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @example GET /random
 * Sample URL: http://localhost:3000/random
 */
app.get("/random", async (req, res) => {
  try {
    const response = await axios.get(url);
    const exercises = response.data;

    const indices = Array.from({ length: 5 }, () => Math.floor(Math.random() * exercises.length));

    const randomExercises = indices.map(index => exercises[index]);

    res.json(randomExercises);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

/**
 * Endpoint for getting exercise recommendations based on equipment and primary muscle.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @example GET /recommendations?equipment=Barbell&primaryMuscle=Triceps
 * Sample URL: http://localhost:3000/recommendations?equipment=kettlebells&primaryMuscle=shoulders
 */
app.get("/recommendations", async (req, res) => {
  const equipment = req.query.equipment;
  const primaryMuscle = req.query.primaryMuscle;

  try {
    const response = await axios.get(url);
    const exercises = response.data;

    const recommendations = exercises.filter(exercise => {
      return (
        exercise.equipment === equipment &&
        exercise.primaryMuscles[0] === primaryMuscle
      );
    });

    res.json(recommendations.slice(0, 5));
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

/**
 * Start the server and listen on the specified port.
 */
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});