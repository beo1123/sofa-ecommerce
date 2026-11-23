import { cmToMetersInput, formatDimensionsMeters, metersInputToCm, parseLegacyDimensionToCm } from "@/lib/dimensions";

describe("dimensions m <-> cm helpers", () => {
  it("converts integer cm from DB into clean meter strings", () => {
    expect(cmToMetersInput(260)).toBe("2.6");
    expect(cmToMetersInput(200)).toBe("2");
    expect(cmToMetersInput(85)).toBe("0.85");
    expect(cmToMetersInput(null)).toBe("");
  });

  it("converts meter input (dot or comma decimal) to integer cm for DB storage", () => {
    expect(metersInputToCm("2.6")).toBe(260);
    expect(metersInputToCm("2,4")).toBe(240);
    expect(metersInputToCm("0.85")).toBe(85);
    expect(metersInputToCm("1.8")).toBe(180);
    expect(metersInputToCm("")).toBeNull();
    expect(metersInputToCm("-1")).toBeNull();
  });

  it("formats 2D and 3D dimensions in meters", () => {
    expect(formatDimensionsMeters(260, 90, 85)).toBe("2.6 × 0.9 × 0.85 m");
    expect(formatDimensionsMeters(180, 85, null)).toBe("1.8 × 0.85 m");
    expect(formatDimensionsMeters(null, null, null)).toBeNull();
  });

  it("parses legacy metadata dimensions in meters or cm", () => {
    expect(parseLegacyDimensionToCm("2.4")).toBe(240);
    expect(parseLegacyDimensionToCm("0.9 m")).toBe(90);
    expect(parseLegacyDimensionToCm("180 cm")).toBe(180);
    expect(parseLegacyDimensionToCm("")).toBeNull();
  });
});
