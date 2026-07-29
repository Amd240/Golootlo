process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";

jest.mock("../models/User");

const request = require("supertest");
const User = require("../models/User");
const app = require("../server");

describe("POST /api/auth/register", () => {
  afterEach(() => jest.clearAllMocks());

  test("rejects missing fields with 400", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "not-enough@example.com" });
    expect(res.status).toBe(400);
  });

  test("rejects an invalid email with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ali", email: "not-an-email", password: "password123" });
    expect(res.status).toBe(400);
  });

  test("rejects a short password with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ali", email: "ali@example.com", password: "123" });
    expect(res.status).toBe(400);
  });

  test("rejects registering an email that already exists", async () => {
    User.findOne.mockResolvedValue({ _id: "existing-id" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ali", email: "ali@example.com", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  test("creates a new user and returns a token", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "new-id",
      name: "Ali",
      email: "ali@example.com",
      phone: "",
      getSignedToken: () => "signed.jwt.token",
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ali", email: "ali@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBe("signed.jwt.token");
    expect(res.body.user.email).toBe("ali@example.com");
  });
});

describe("POST /api/auth/login", () => {
  afterEach(() => jest.clearAllMocks());

  test("rejects login with wrong credentials", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "wrongpass" });

    expect(res.status).toBe(401);
  });

  test("logs in successfully with correct credentials", async () => {
    User.findOne.mockResolvedValue({
      _id: "user-id",
      name: "Ali",
      email: "ali@example.com",
      phone: "",
      matchPassword: jest.fn().mockResolvedValue(true),
      getSignedToken: () => "signed.jwt.token",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ali@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe("signed.jwt.token");
  });
});
