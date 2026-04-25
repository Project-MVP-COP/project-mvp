import type { QueryClient } from "@tanstack/react-query";
import { sampleKeys } from "@/features/sample/api/queries";
import { createSample, updateSample, patchSample, deleteSample } from "@/features/sample/api/mutations";
import { api } from "@/shared/api/axios";
import { parseSampleCommand } from "@/features/sample/model/core";

export const action = (queryClient: QueryClient) => async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const command = parseSampleCommand(formData);

  try {
    switch (command.type) {
      case "create":
        await createSample(command.payload);
        break;
      case "update":
        await updateSample(command.id, command.payload);
        break;
      case "patch":
        await patchSample(command.id, command.payload);
        break;
      case "delete":
        await deleteSample(command.id);
        break;
      case "error_test":
        await api.get("/api/sample/error");
        break;
      default:
        // Do nothing or handle unknown intents
        break;
    }
  } catch (error) {
    console.error("Action error:", error);
    throw error;
  }

  await queryClient.invalidateQueries({ queryKey: sampleKeys.all });
  return null;
};
