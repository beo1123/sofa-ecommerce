import {
  normalizeError,
  parseOptionalNumber,
  parsePagination,
  parsePositiveInt,
  parseStringParam,
} from "@/server/utils/api";

describe("API validation & error utilities", () => {
  it("parses pagination safely when invalid values are passed", () => {
    const params = new URLSearchParams("page=abc&perPage=-10");
    expect(parsePagination(params, 12)).toEqual({
      page: 1,
      perPage: 1,
      skip: 0,
      take: 1,
    });

    const zeroPage = new URLSearchParams("page=0&perPage=500");
    expect(parsePagination(zeroPage, 12)).toEqual({
      page: 1,
      perPage: 100,
      skip: 0,
      take: 100,
    });
  });

  it("parses optional numbers and string params safely", () => {
    expect(parseOptionalNumber("15000000")).toBe(15000000);
    expect(parseOptionalNumber("-500")).toBeUndefined();
    expect(parseOptionalNumber("abc")).toBeUndefined();
    expect(parseOptionalNumber(undefined)).toBeUndefined();

    expect(parseStringParam(["  sofa-goc  ", "sofa-bang"])).toBe("sofa-goc");
    expect(parseStringParam("   ")).toBeUndefined();
    expect(parsePositiveInt("3", 1)).toBe(3);
  });

  it("hides stack trace in production mode on 500 errors", () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", { value: "production", configurable: true });

    const err = new Error("Sensitive database connection string error");
    const normalized = normalizeError(err);

    expect(normalized.status).toBe(500);
    expect(normalized.payload.error.message).toBe("Internal server error");
    expect(normalized.payload.error.details).toBeUndefined();

    Object.defineProperty(process.env, "NODE_ENV", { value: originalEnv, configurable: true });
  });
});
