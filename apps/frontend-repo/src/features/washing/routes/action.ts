import type { QueryClient } from "@tanstack/react-query";
import {
  applyBulkWash,
  importMockTransactions,
  updateTransactionCategory,
} from "@/features/washing/api/mutations";
import { washingKeys } from "@/features/washing/api/queries";
import { parseWashingCommand } from "@/features/washing/model/core";

export const action =
  (queryClient: QueryClient) =>
  async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const command = parseWashingCommand(formData);

    try {
      switch (command.type) {
        case "bulk_wash":
          await applyBulkWash(command.payload);
          break;
        case "update_category":
          await updateTransactionCategory(command.id, {
            category: command.category,
          });
          break;
        case "import_mock":
          await importMockTransactions();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Washing action error:", error);
      throw error;
    }

    await queryClient.invalidateQueries({ queryKey: washingKeys.all });
    return null;
  };
