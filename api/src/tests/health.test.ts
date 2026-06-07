import { describe, test, expect } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";

describe("GET [/health]", () => {
  test("should return 200 OK", async () => {
    const response = await request(server.server).get("/api/health");

    expect(response.status).toEqual(200);
  });
});
