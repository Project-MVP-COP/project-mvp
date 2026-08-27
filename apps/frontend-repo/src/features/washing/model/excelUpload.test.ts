import { describe, expect, it } from "vitest";
import {
  EXCEL_UPLOAD_ACCEPT,
  MAX_EXCEL_FILE_SIZE,
  getExcelUploadErrorMessage,
} from "./excelUpload";

describe("excel upload model", () => {
  it("keeps the frontend file limit aligned to 10MB", () => {
    expect(MAX_EXCEL_FILE_SIZE).toBe(10 * 1024 * 1024);
  });

  it("accepts Excel files by extension as well as MIME type", () => {
    expect(Object.values(EXCEL_UPLOAD_ACCEPT).flat()).toEqual([".xls", ".xlsx"]);
  });

  it("shows the backend problem detail", () => {
    expect(
      getExcelUploadErrorMessage({
        type: "urn:cop:kbds:agilemvp:error:COM009",
        title: "UPLOAD_SIZE_EXCEEDED",
        status: 413,
        detail: "업로드 파일은 최대 10MB까지 가능합니다.",
        instance: "/api/excel/upload",
      }),
    ).toBe("업로드 파일은 최대 10MB까지 가능합니다.");
  });

  it("shows an actionable message when the request times out", () => {
    expect(getExcelUploadErrorMessage({ code: "ECONNABORTED" })).toContain(
      "처리 시간이 초과",
    );
  });

  it("falls back to format guidance for unknown errors", () => {
    expect(getExcelUploadErrorMessage(new Error("unknown"))).toContain("지원 양식");
  });
});
