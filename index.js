const express = require("express");
const axios = require("axios");
const Fuse = require("fuse.js");

const app = express();
const port = 3000 || process.env.PORT;
const baseUrl = "https://raw.githubusercontent.com/zomvr2/free-exercise-db/main";

app.get("/", (req, res) => {
  res.send("All working fine!");
});

// For specific exercise by id, Ex: /exercise/1
app.get("/exercise/:id", async (req, res) => {
  const url = `${baseUrl}/dist/exercises.json`;
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

// For searching exercises, Ex: /search?name=bench&page=1
app.get("/search", async (req, res) => {
  const url = `${baseUrl}/dist/exercises.json`;
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

// Add this route to your express app
app.get("/random", async (req, res) => {
  const url = `${baseUrl}/dist/exercises.json`;

  try {
    const response = await axios.get(url);
    const exercises = response.data;

    // Generate 5 random indices
    const indices = Array.from({ length: 5 }, () => Math.floor(Math.random() * exercises.length));

    // Select exercises with these indices
    const randomExercises = indices.map(index => exercises[index]);

    res.json(randomExercises);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});