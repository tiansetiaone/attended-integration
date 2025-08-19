import express from "express";
import cors from "cors";
import helmet from "helmet";
import registrationRoutes from "./routes/registrationRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/registrations", registrationRoutes);

export default app;
