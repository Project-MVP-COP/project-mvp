import type {
  BulkWashRequest,
  WashingFilters,
  WashingOverview,
  WashingTransaction,
} from "@/features/washing/model/types";

export type WashingCommand =
  | { type: "bulk_wash"; payload: BulkWashRequest }
  | {
      type: "update_category";
      id: number;
      categoryId: number | null;
      categoryName: string | null;
      tag: string | null;
    }
  | { type: "delete_transaction"; id: number }
  | { type: "unknown" };

export const DEFAULT_WASHING_FILTERS: WashingFilters = {
  merchantKeyword: "",
  category: "all",
  status: "all",
};

export const parseWashingCommand = (formData: FormData): WashingCommand => {
  const intent = formData.get("intent");

  switch (intent) {
    case "bulk_wash":
      {
        const category = parseCategoryValue(formData.get("category"));
        return {
        type: "bulk_wash",
        payload: {
          ids: extractNumberList(formData, "ids"),
          categoryId: category.categoryId ?? 0,
          categoryName: category.categoryName ?? "",
        },
      };
      }
    case "update_category": {
      const category = parseCategoryValue(formData.get("category"));
      return {
        type: "update_category",
        id: extractNumber(formData, "id"),
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        tag: normalizeCategory(formData.get("tag")),
      };
    }
    case "delete_transaction":
      return { type: "delete_transaction", id: extractNumber(formData, "id") };
    default:
      return { type: "unknown" };
  }
};

export const getUnclassifiedTransactions = (
  transactions: WashingTransaction[],
): WashingTransaction[] =>
  transactions.filter((transaction) => !transaction.isClassified);

export const filterTransactions = (
  transactions: WashingTransaction[],
  filters: WashingFilters,
): WashingTransaction[] =>
  transactions.filter((transaction) => {
    const matchesMerchant =
      filters.merchantKeyword.trim() === "" ||
      transaction.merchantName
        .toLocaleLowerCase()
        .includes(filters.merchantKeyword.trim().toLocaleLowerCase()) ||
      transaction.description
        .toLocaleLowerCase()
        .includes(filters.merchantKeyword.trim().toLocaleLowerCase());

    const matchesCategory =
      filters.category === "all" ||
      (filters.category === "unclassified"
        ? transaction.category === null
        : transaction.category === filters.category);

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "classified" && transaction.isClassified) ||
      (filters.status === "unclassified" && !transaction.isClassified);

    return matchesMerchant && matchesCategory && matchesStatus;
  });

export const getWashingMetrics = (overview: WashingOverview) => {
  const totalCount = overview.transactions.length;
  const unclassifiedCount = getUnclassifiedTransactions(
    overview.transactions,
  ).length;
  const classifiedCount = totalCount - unclassifiedCount;
  const totalAmount = overview.transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  return {
    totalCount,
    unclassifiedCount,
    classifiedCount,
    classificationRate:
      totalCount === 0 ? 0 : Math.round((classifiedCount / totalCount) * 100),
    totalAmount,
  };
};

export const formatAmount = (amount: number) =>
  new Intl.NumberFormat("ko-KR").format(amount);

export const normalizeCategory = (value: FormDataEntryValue | null) => {
  const normalized = String(value || "").trim();
  return normalized === "" ? null : normalized;
};

const parseCategoryValue = (value: FormDataEntryValue | null) => {
  const raw = String(value || "");
  if (raw === "") {
    return { categoryId: null, categoryName: null };
  }

  const colonIdx = raw.indexOf(":");
  if (colonIdx === -1) {
    return { categoryId: null, categoryName: raw };
  }

  const parsedId = Number(raw.substring(0, colonIdx));
  return {
    categoryId: parsedId === 0 ? null : parsedId,
    categoryName: raw.substring(colonIdx + 1) || null,
  };
};


const extractNumber = (formData: FormData, key: string) =>
  Number(formData.get(key));

const extractNumberList = (formData: FormData, key: string) =>
  String(formData.get(key) || "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
