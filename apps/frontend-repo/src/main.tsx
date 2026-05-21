import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AppProvider } from "./app/AppProvider";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Failed to find the root element");

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
}

// router를 동적 import로 지연: MSW 준비 완료 후 createBrowserRouter가 실행되어야
// loader 내부의 prefetchQuery HTTP 요청을 MSW가 정상적으로 가로챕니다.
// 정적 import 시 createBrowserRouter → loader → prefetchQuery가 MSW 초기화보다 먼저
// 실행되어 초기 쿼리가 에러 상태로 캐시에 남는 문제가 발생합니다.
enableMocking().then(async () => {
  const { router } = await import("./app/router");
  createRoot(rootElement).render(
    <StrictMode>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </StrictMode>,
  );
});
