import { describe, expect, it } from "vitest";
import { extractMimeType } from "./utils";

const testCases = [
  {
    contentType: "",
    expected: "",
  },
  {
    contentType: "text/html",
    expected: "text/html",
  },
  {
    contentType: "text/html; charset=utf-8",
    expected: "text/html",
  },
  {
    contentType: "text/html; charset=utf-8; foo=bar",
    expected: "text/html",
  },
  {
    contentType: "text/html; charset=utf-8; foo=bar; bar=baz",
    expected: "text/html",
  },
];

describe("extractMimeType", () => {
  it.each(testCases)(
    "should extract the mime type from the content type",
    ({ contentType, expected }) => {
      const mimeType = extractMimeType(
        new Headers({ "content-type": contentType }),
      );
      expect(mimeType).toBe(expected);
    },
  );
});
