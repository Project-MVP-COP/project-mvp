import { Form, useNavigation } from "react-router";
import type { Sample } from "../model/types";

interface SampleListProps {
  samples: Sample[];
}

export function SampleList({ samples }: SampleListProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";

  return (
    <section id="center" style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>Sample CRUD with React Query & FSD</h1>

      <div style={{ marginBottom: "2rem", padding: "1.5rem", border: "1px solid #eaeaea", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        <h2 style={{ marginTop: 0 }}>Create New Sample</h2>
        <Form method="post" style={{ display: "flex", gap: "1rem" }}>
          <input type="hidden" name="intent" value="create" />
          <input
            type="text"
            name="message"
            placeholder="Enter sample message..."
            required
            style={{ flex: 1, padding: "0.5rem" }}
          />
          <button type="submit" disabled={isSubmitting} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </Form>
      </div>

      <div>
        <h2 style={{ marginBottom: "1rem" }}>Samples List</h2>
        {samples.length === 0 ? (
          <p>No samples available.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {samples.map((sample) => (
              <li key={sample.id} style={{ marginBottom: "1rem", padding: "1.5rem", border: "1px solid #ddd", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
                  <span><strong>ID:</strong> {sample.id}</span>
                  <span><strong>Status:</strong> {sample.status}</span>
                  <span><strong>Urgent:</strong> {sample.urgent ? "Yes" : "No"}</span>
                  <span><strong>Updated At:</strong> {sample.updatedAt}</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                  <Form method="post" style={{ display: "flex", gap: "0.5rem" }}>
                    <input type="hidden" name="intent" value="update" />
                    <input type="hidden" name="id" value={sample.id} />
                    <input type="hidden" name="status" value={sample.status} />
                    <input type="hidden" name="urgent" value={String(sample.urgent)} />
                    <input type="text" name="message" defaultValue={sample.message} required style={{ padding: "0.25rem" }} />
                    <button type="submit" disabled={isSubmitting} style={{ cursor: "pointer" }}>Update Msg</button>
                  </Form>

                  <Form method="post" style={{ display: "flex", gap: "0.5rem" }}>
                    <input type="hidden" name="intent" value="patch" />
                    <input type="hidden" name="id" value={sample.id} />
                    <select name="status" defaultValue={sample.status} style={{ padding: "0.25rem" }}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="ERROR">ERROR</option>
                    </select>
                    <button type="submit" disabled={isSubmitting} style={{ cursor: "pointer" }}>Patch Status</button>
                  </Form>

                  <Form method="post" style={{ marginLeft: "auto" }}>
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={sample.id} />
                    <button type="submit" disabled={isSubmitting} style={{ color: "white", backgroundColor: "#d32f2f", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}>
                      Delete
                    </button>
                  </Form>

                  {/* Test Error Boundary Button */}
                  <Form method="post" style={{ display: "flex" }}>
                    <input type="hidden" name="intent" value="error_test" />
                    <button type="submit" disabled={isSubmitting} style={{ color: "white", backgroundColor: "#ff9800", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer", marginLeft: "1rem" }}>
                      Force Error
                    </button>
                  </Form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
