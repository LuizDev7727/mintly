import request from "supertest";
import { describe, expect, test } from "vitest";
import { server } from "@/app.ts";

describe("GET [/health]", () => {
  test("should return 200 OK", async () => {
    const response = await request(server.server).get("/api/health");

    expect(response.status).toEqual(200);
  });
});
