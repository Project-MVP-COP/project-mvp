import type { QueryClient } from "@tanstack/react-query";
import { fetchTransactionById } from "@/features/washing/api/fetchers";
import {
  applyBulkWash,
  deleteTransaction,
  importMockTransactions,
  updateTransaction,
} from "@/features/washing/api/mutations";
import { washingKeys } from "@/features/washing/api/queries";
import { parseWashingCommand } from "@/features/washing/model/core";
import type { ActionResult } from "@/features/washing/model/types";

export type { ActionResult };

export const action =
  (queryClient: QueryClient) =>
  async ({ request }: { request: Request }): Promise<ActionResult> => {
    const formData = await request.formData();
    const command = parseWashingCommand(formData);

    try {
      switch (command.type) {
        case "bulk_wash":
          await applyBulkWash(command.payload);
          await queryClient.invalidateQueries({ queryKey: washingKeys.all });
          return { intent: "bulk_wash", count: command.payload.ids.length };
        case "update_category": {
          const tx = await fetchTransactionById(command.id);
          await updateTransaction(command.id, {
            ...tx,
            categoryId: command.categoryId,
            categoryName: command.categoryName,
            memo: command.memo,
          });
          await queryClient.invalidateQueries({ queryKey: washingKeys.all });
          return { intent: "update_category" };
        }
        case "import_mock":
          await importMockTransactions();
          await queryClient.invalidateQueries({ queryKey: washingKeys.all });
          return { intent: "import_mock" };
        case "delete_transaction":
          await deleteTransaction(command.id);
          await queryClient.invalidateQueries({ queryKey: washingKeys.all });
          return { intent: "delete_transaction" };
        default:
          await queryClient.invalidateQueries({ queryKey: washingKeys.all });
          return { intent: command.type, error: true };
      }
    } catch (error) {
      console.error("Washing action error:", error);
      return { intent: command.type, error: true };
    }
  };
