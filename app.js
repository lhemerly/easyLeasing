const express = require("express");
const mongoose = require("mongoose");
const contractRoutes = require("./routes/contracts");

const app = express();

mongoose
  .connect("mongodb://0.0.0.0/ifrs16", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

app.use(express.json());
app.use(contractRoutes);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;