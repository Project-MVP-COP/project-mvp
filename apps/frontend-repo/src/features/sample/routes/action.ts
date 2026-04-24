import type { QueryClient } from "@tanstack/react-query";
import { sampleKeys } from "../api/queries";
import { createSample, updateSample, patchSample, deleteSample } from "../api/mutations";
import { api } from "../../../shared/api/axios";

export const action = (queryClient: QueryClient) => async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "create") {
      const message = formData.get("message") as string;
      await createSample({ message });
    } else if (intent === "update") {
      const id = Number(formData.get("id"));
      const message = formData.get("message") as string;
      const status = formData.get("status") as string;
      const urgent = formData.get("urgent") === "true";
      await updateSample(id, { message, status, urgent });
    } else if (intent === "patch") {
      const id = Number(formData.get("id"));
      const status = formData.get("status") as string;
      await patchSample(id, { status });
    } else if (intent === "delete") {
      const id = Number(formData.get("id"));
      await deleteSample(id);
    } else if (intent === "error_test") {
      await api.get("/api/sample/error");
    }
  } catch (error) {
    console.error("Action error:", error);
    throw error;
  }

  await queryClient.invalidateQueries({ queryKey: sampleKeys.all });
  return null;
};
