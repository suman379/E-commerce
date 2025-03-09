import express, { NextFunction, Request, Response } from "express";
import { CatalogService } from "../service/catalog.service";
import { CatalogRepository } from "../repository/catalog.repository";
import { RequestValidator } from "../utils/requestValidator";
import { CreateProductRequest, UpdateProductRequest } from "../dto/product.dto";

const router = express.Router();

export const catalogService = new CatalogService(new CatalogRepository());

router.post("/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { errors, input } = await RequestValidator(CreateProductRequest, req.body);
    if (errors) {
      res.status(400).json(errors);
    } else {
      const data = await catalogService.createProduct(input);
      res.status(201).send(data);
    }
  } catch (error) {
    const err = error as Error;
    res.status(500).json(err.message);
  }
});

router.patch("/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { errors, input } = await RequestValidator(UpdateProductRequest, req.body);

    const id = parseInt(req.params.id) || 0;

    if (errors) {
      res.status(400).json(errors);
    } else {
      const data = await catalogService.updateProduct({ id, ...input });
      res.status(200).send(data);
    }
  } catch (error) {
    const err = error as Error;
    res.status(500).json(err.message);
  }
});

router.get("/products", async (req: Request, res: Response, next: NextFunction) => {
  const limit = Number(req.query["limit"]) || 10;
  const offset = Number(req.query["offset"]) || 0;
  try {
    const data = await catalogService.getProducts(limit, offset);
    res.status(200).send(data);
  } catch (error) {
    const err = error as Error;
    res.status(500).json(err.message);
  }
});

router.get("/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id) || 0;
  try {
    const data = await catalogService.getProduct(id);
    res.status(200).send(data);
  } catch (error) {
    const err = error as Error;
    res.status(500).json(err.message);
  }
});

router.delete("/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id) || 0;
  try {
    const data = await catalogService.deleteProduct(id);
    res.status(200).send(data);
  } catch (error) {
    const err = error as Error;
    res.status(500).json(err.message);
  }
});
export default router;
