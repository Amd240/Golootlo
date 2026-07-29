process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";

jest.mock("../models/Product");
jest.mock("../models/Review");

const request = require("supertest");
const Product = require("../models/Product");
const app = require("../server");

// Builds a mongoose-style chainable query mock: Product.find(...).populate(...).sort(...)
// resolves to `result` at the end of the chain.
const chainableResolve = (result) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockResolvedValue(result),
  then: (resolve) => resolve(result), // lets `await` on the chain itself work too
});

describe("GET /api/products", () => {
  afterEach(() => jest.clearAllMocks());

  test("returns a plain array when no ?page is given (backward compatible)", async () => {
    const fakeProducts = [{ _id: "1", name: "Shoe" }, { _id: "2", name: "Shirt" }];
    Product.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(fakeProducts),
    });

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  test("returns a paginated shape when ?page is given", async () => {
    const fakeProducts = [{ _id: "1", name: "Shoe" }];
    Product.find.mockReturnValue(chainableResolve(fakeProducts));
    Product.countDocuments.mockResolvedValue(1);

    const res = await request(app).get("/api/products?page=1&limit=10");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({ page: 1, totalPages: 1, totalCount: 1 })
    );
    expect(res.body.products).toHaveLength(1);
  });
});

describe("GET /api/products/:id", () => {
  afterEach(() => jest.clearAllMocks());

  test("returns 404 for a product that doesn't exist", async () => {
    Product.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    const res = await request(app).get("/api/products/does-not-exist");

    expect(res.status).toBe(404);
  });

  test("returns the product when found", async () => {
    Product.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: "1", name: "Shoe", price: 100 }),
    });

    const res = await request(app).get("/api/products/1");

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Shoe");
  });
});

describe("GET /api/products/:id/related", () => {
  afterEach(() => jest.clearAllMocks());

  test("returns 404 if the base product doesn't exist", async () => {
    Product.findById.mockResolvedValue(null);

    const res = await request(app).get("/api/products/missing/related");

    expect(res.status).toBe(404);
  });

  test("excludes the product itself and returns same-category items", async () => {
    Product.findById.mockResolvedValue({ _id: "1", category: "cat-1" });
    Product.find.mockReturnValue(chainableResolve([{ _id: "2", name: "Related item" }]));

    const res = await request(app).get("/api/products/1/related");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(Product.find).toHaveBeenCalledWith(
      expect.objectContaining({ category: "cat-1" })
    );
  });
});
