import request from "supertest";
import express from "express";
import { faker } from "@faker-js/faker";
import catalogRoutes, { catalogService } from "../catalog.routes";
import { ProductFactory } from "../../utils/fixtures";

const app = express();
app.use(express.json());
app.use(catalogRoutes);

const mockRequest = () => {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    stock: faker.number.int({ max: 100, min: 10 }),
    price: +faker.commerce.price(),
  };
};

describe("Catalog Routes", () => {
  describe("POST /products", () => {
    test("Should create Product Successfully", async () => {
      const requestBody = mockRequest();
      const product = ProductFactory.build();

      jest.spyOn(catalogService, "createProduct").mockImplementationOnce(() => {
        return Promise.resolve(product);
      });

      const response = await request(app)
        .post("/products")
        .send(requestBody)
        .set("Accept", "application/json");

      expect(response.status).toBe(201);
      expect(response.body).toEqual(product);
    });

    test("Should response with validation error 400", async () => {
      const requestBody = mockRequest();

      const response = await request(app)
        .post("/products")
        .send({ ...requestBody, name: "" })
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual("name should not be empty");
    });

    test("Should response with an internal error code 500", async () => {
      const requestBody = mockRequest();

      jest.spyOn(catalogService, "createProduct").mockImplementationOnce(() => {
        return Promise.reject(new Error("error Occured on create product"));
      });

      const response = await request(app)
        .post("/products")
        .send(requestBody)
        .set("Accept", "application/json");

      expect(response.status).toBe(500);
      expect(response.body).toEqual("error Occured on create product");
    });
  });

  describe("PATCH /products/:id", () => {
    test("Should update Product Successfully", async () => {
      const product = ProductFactory.build();
      const requestBody = {
        name: product.name,
        price: product.price,
        stock: product.stock,
      };

      jest.spyOn(catalogService, "updateProduct").mockImplementationOnce(() => {
        return Promise.resolve(product);
      });

      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send(requestBody)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(product);
    });

    test("Should response with validation error 400", async () => {
      const product = ProductFactory.build();
      const requestBody = {
        name: product.name,
        price: -1,
        stock: product.stock,
      };

      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send(requestBody)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual("price must not be less than 1");
    });

    test("Should response with an internal error code 500", async () => {
      const product = ProductFactory.build();
      const requestBody = {
        name: product.name,
        price: product.price,
        stock: product.stock,
      };

      jest.spyOn(catalogService, "updateProduct").mockImplementationOnce(() => {
        return Promise.reject(new Error("error Occured on update product"));
      });

      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send(requestBody)
        .set("Accept", "application/json");

      expect(response.status).toBe(500);
      expect(response.body).toEqual("error Occured on update product");
    });
  });

  describe("Get /products?limit=0&offset=0", () => {
    test("Should return a range of products based on limit and offset", async () => {
      const randomLimit = faker.number.int({ max: 50, min: 10 });
      const products = ProductFactory.buildList(randomLimit);

      jest.spyOn(catalogService, "getProducts").mockImplementationOnce(() => {
        return Promise.resolve(products);
      });

      const response = await request(app)
        .get(`/products?limit=${randomLimit}&offset=0`)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
    });
  });

  describe("Get /products/:id", () => {
    test("Should return a product by id", async () => {
      const product = ProductFactory.build();

      jest.spyOn(catalogService, "getProduct").mockImplementationOnce(() => {
        return Promise.resolve(product);
      });

      const response = await request(app)
        .get(`/products/${product.id}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(product);
    });
  });

  describe("Delete /products/:id", () => {
    test("Should delete a product by id", async () => {
      const product = ProductFactory.build();

      jest.spyOn(catalogService, "deleteProduct").mockImplementationOnce(() => {
        return Promise.resolve({ id: product.id });
      });

      const response = await request(app)
        .delete(`/products/${product.id}`)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: product.id });
    });
  });
});
