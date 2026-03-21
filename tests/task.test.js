const request = require("supertest");
const app = require("../index");
const pool = require("../db");

describe("Task API", () => {
  let token;

  beforeAll(async () => {
    const email = `test${Date.now()}@test.com`;

    // register
    await request(app)
      .post("/auth/register")
      .send({
        email,
        password: "123456",
      });

    // login
    const res = await request(app)
      .post("/auth/login")
      .send({
        email,
        password: "123456",
      });

    token = res.body.token;
  });

  test("should fail without token", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "test task" });

    expect(res.statusCode).toBe(401);
  });

  test("should fail validation", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "a" });

    expect(res.statusCode).toBe(400);
  });

  test("should create task", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "valid task" });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("valid task");
  });
});
