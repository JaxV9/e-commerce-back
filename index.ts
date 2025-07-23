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
}
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`REST API server ready at: http://localhost:${PORT}`)
    );

export default app
