import request from "supertest";
import app from "../app";

describe("POST /api/test", () => {
  it("Should return 200 and success message!", async () => {
    const response = await request(app).post("/api/test");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Request success!");
  });
});
