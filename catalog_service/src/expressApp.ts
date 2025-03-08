import express, { NextFunction, Request, Response } from "express";
import catalogRouter from "./api/catalog.route";

const app = express();
app.use(express.json());

app.use("/", catalogRouter);

export default app;
