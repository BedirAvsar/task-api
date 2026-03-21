const request = require("supertest");
const app = require("../index");

describe("Auth", () => {
  test("login works", async () => {

    const email = `test${Date.now()}@test.com`;

    await request(app)
      .post("/auth/register")
      .send({
        email,
        password: "123456",
      });

    const res = await request(app)
      .post("/auth/login")
      .send({
        email,
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
