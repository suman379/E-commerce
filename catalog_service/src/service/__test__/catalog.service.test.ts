import { ProductFactory } from "../../utils/fixtures";
import { ICatalogRepository } from "../../interface/catalog.respository.interface";
import { Product } from "../../models/product.model";
import { MockCatalogRepository } from "../../repository/mockCatalog.repository";
import { CatalogService } from "../catalog.service";
import { faker } from "@faker-js/faker";

const mockProduct = (rest: any) => {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    stock: faker.number.int({ max: 100, min: 10 }),
    ...rest,
  };
};

describe("CatalogService", () => {
  let repository: ICatalogRepository;
  beforeEach(() => {
    repository = new MockCatalogRepository();
  });
  afterEach(() => {
    repository = {} as MockCatalogRepository;
  });

  describe("createProduct", () => {
    test("Should Create Product", async () => {
      const service = new CatalogService(repository);
      const requestBody = mockProduct({ price: +faker.commerce.price() });
      const result = await service.createProduct(requestBody);

      expect(result).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        stock: expect.any(Number),
      });
    });

    test("Should Throw Error with Unable to create product", async () => {
      const service = new CatalogService(repository);
      const requestBody = mockProduct({ price: +faker.commerce.price() });

      jest.spyOn(repository, "create").mockImplementationOnce(() => {
        return Promise.resolve({} as Product);
      });
      await expect(service.createProduct(requestBody)).rejects.toThrow("Unable to create product");
    });

    test("Should Throw Error with product already exist", async () => {
      const service = new CatalogService(repository);
      const requestBody = mockProduct({ price: +faker.commerce.price() });

      jest.spyOn(repository, "create").mockImplementationOnce(() => {
        return Promise.reject(new Error("Product already exist"));
      });
      await expect(service.createProduct(requestBody)).rejects.toThrow("Product already exist");
    });
  });

  describe("updateProduct", () => {
    test("Should Update Product", async () => {
      const service = new CatalogService(repository);
      const requestBody = mockProduct({
        price: +faker.commerce.price(),
        id: faker.number.int({ min: 10, max: 1000 }),
      });
      const result = await service.updateProduct(requestBody);

      expect(result).toMatchObject(requestBody);
    });

    test("Should Throw Error with Product does not exists", async () => {
      const service = new CatalogService(repository);
      const requestBody = mockProduct({ price: +faker.commerce.price() });

      jest.spyOn(repository, "update").mockImplementationOnce(() => {
        return Promise.reject(new Error("Product does not exist"));
      });
      await expect(service.updateProduct({})).rejects.toThrow("Product does not exist");
    });
  });

  describe("getProducts", () => {
    test("Should get product by offset and limit", async () => {
      const service = new CatalogService(repository);
      const randomLimit = faker.number.int({ max: 50, min: 10 });
      const products = ProductFactory.buildList(randomLimit);
      jest.spyOn(repository, "find").mockImplementationOnce(() => Promise.resolve(products));
      const result = await service.getProducts(randomLimit, 0);

      expect(result.length).toEqual(randomLimit);
      expect(result).toMatchObject(products);
    });

    test("Should Throw Error with Products does not exists", async () => {
      const service = new CatalogService(repository);

      jest.spyOn(repository, "find").mockImplementationOnce(() => {
        return Promise.reject(new Error("Products does not exist"));
      });
      await expect(service.getProducts(0, 0)).rejects.toThrow("Products does not exist");
    });
  });

  describe("getProduct", () => {
    test("Should get product by id", async () => {
      const service = new CatalogService(repository);

      const product = ProductFactory.build();
      jest.spyOn(repository, "findOne").mockImplementationOnce(() => Promise.resolve(product));
      const result = await service.getProduct(product.id!);
      expect(result).toMatchObject(product);
    });

    test("Should Throw Error with Product does not exists", async () => {
      const service = new CatalogService(repository);

      jest.spyOn(repository, "findOne").mockImplementationOnce(() => {
        return Promise.reject(new Error("Product does not exist"));
      });
      await expect(service.getProduct(1)).rejects.toThrow("Product does not exist");
    });
  });

  describe("deleteProduct", () => {
    test("Should delete product by id", async () => {
      const service = new CatalogService(repository);

      const product = ProductFactory.build();
      jest
        .spyOn(repository, "delete")
        .mockImplementationOnce(() => Promise.resolve({ id: product.id }));
      const result = await service.deleteProduct(product.id!);
      expect(result).toMatchObject({
        id: product.id,
      });
    });
    test("Should Throw Error with Product does not exists", async () => {
      const service = new CatalogService(repository);

      jest.spyOn(repository, "delete").mockImplementationOnce(() => {
        return Promise.reject(new Error("Product does not exist"));
      });
      await expect(service.deleteProduct(1)).rejects.toThrow("Product does not exist");
    });
  });
});
