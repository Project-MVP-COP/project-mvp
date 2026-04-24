import { useQuery } from "@tanstack/react-query";
import { sampleQueries } from "../api/queries";
import { SampleList } from "../ui/SampleList";

export function SamplePage() {
  const { data: samples, isLoading, isError } = useQuery(sampleQueries.list());

  if (isLoading) return <div style={{ padding: "2rem" }}>Loading samples...</div>;
  if (isError) return <div style={{ padding: "2rem", color: "red" }}>Error loading samples</div>;

  return <SampleList samples={samples ?? []} />;
}
