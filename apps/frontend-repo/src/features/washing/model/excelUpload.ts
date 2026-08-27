import { MIME_TYPES } from "@mantine/dropzone";
import { ProblemDetailSchema } from "@/shared/model/problemDetail";

export const MAX_EXCEL_FILE_SIZE = 10 * 1024 * 1024;

export const EXCEL_UPLOAD_ACCEPT = {
  [MIME_TYPES.xls]: [".xls"],
  [MIME_TYPES.xlsx]: [".xlsx"],
};

export const getExcelUploadErrorMessage = (error: unknown): string => {
  const problemDetail = ProblemDetailSchema.safeParse(error);
  if (problemDetail.success) return problemDetail.data.detail;

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT")
  ) {
    return "엑셀 처리 시간이 초과되었습니다. 파일 크기를 줄여 다시 시도해주세요.";
  }

  return "엑셀 파싱에 실패했습니다. 지원 양식과 파일 내용을 확인해주세요.";
};
