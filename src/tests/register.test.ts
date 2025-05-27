import request from "supertest";
import app from "../app";
import User from "../models/user.model";
import mongoose from "mongoose";

const UserModel = User(mongoose);

describe("POST /api/user/register", () => {
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/user/register")
      .field("name", "Test User")
      .field("email", "test@example.com")
      .field("phone", "1234567890")
      .field("password", "password123")
      .attach("image", "__tests__/fixtures/avatar.png");

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toHaveProperty("accessToken");
    expect(response.body.data.user).toHaveProperty("refreshToken");

    const user = await UserModel.findOne({ email: "test@example.com" });
    expect(user).not.toBeNull();
  });

  it("should not register if email is invalid", async () => {
    const response = await request(app)
      .post("/api/user/register")
      .field("name", "Invalid Email User")
      .field("email", "invalid-email")
      .field("phone", "1234567890")
      .field("password", "password123");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
