import express, { NextFunction, Request, Response } from "express";

const router = express.Router();

router.post("/product", async (req: Request, res: Response, next: NextFunction) => {
  res.status(201).send("Success");
});

export default router;
