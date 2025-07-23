import cors from "cors";
import express from "express";
import dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: `${process.env.API_BASE_URL}`,
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the REST API!");
});

app.get(/user\/:id/, (req, res) => {
    res.send("Users endpoint is under construction.");
});

app.get(/products/, (req, res) => {
    res.send("Products endpoint is under construction.");
});

app.get(/products\/:id/, (req, res) => {
    const { id } = req.params;
    res.send(`Product with ID ${id} is under construction.`);
});

app.post("/product/", (req, res) => {
    const product = req.body;
    res.status(201).send(`Product created: ${JSON.stringify(product)}`);
});


app.get(/comments/, (req, res) => {
    res.send("Products endpoint is under construction.");
});

app.get(/comments\/:id/, (req, res) => {
    const { id } = req.params;
    res.send(`Product with ID ${id} is under construction.`);
});

app.post("/comment/", (req, res) => {
    const product = req.body;
    res.status(201).send(`Comments created: ${JSON.stringify(product)}`);
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`REST API server ready at: http://localhost:${PORT}`)
);

export default app;
