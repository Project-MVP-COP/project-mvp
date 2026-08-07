import LoginPage from "@/features/auth/routes/LoginPage";
import RegisterPage from "@/features/auth/routes/RegisterPage";
import { loginAction, registerAction } from "@/features/auth/routes/action";
import { AiInsightsPage } from "@/features/ai-insights/routes/AiInsightsPage";
import { loader as aiInsightsLoader } from "@/features/ai-insights/routes/loader";
import { ruleEngineQueries } from "@/features/rule-engine-builder/api/queries";
import { SamplePage } from "@/features/sample/routes/SamplePage";
import { action as sampleAction } from "@/features/sample/routes/action";
import { loader as sampleLoader } from "@/features/sample/routes/loader";
import { WashingPage } from "@/features/washing/routes/WashingPage";
import { action as washingAction } from "@/features/washing/routes/action";
import { loader as washingLoader } from "@/features/washing/routes/loader";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { NotFoundPage } from "@/shared/ui/NotFoundPage";
import { createBrowserRouter, redirect, Navigate } from "react-router";
import { ComingSoonPage } from "./ComingSoonPage";
import { Layout } from "./Layout";
import { RuleEngineBuilderPage } from "./RuleEngineBuilderPage";
import { queryClient } from "./queryClient";
import { useAppStore } from "@/app/store/useAppStore";

/**
 * 보안 라우팅 가드 로더
 * 미인증 접속 발생 시 즉시 /login 으로 안전하게 튕겨냅니다.
 */
const rootLoader = () => async () => {
  const { isAuthenticated } = useAppStore.getState();
  if (!isAuthenticated) {
    return redirect("/login");
  }
  return null;
};

const ruleEngineLoader = () => async () => {
  await washingLoader(queryClient)();
  queryClient.prefetchQuery(ruleEngineQueries.rules());
  queryClient.prefetchQuery(ruleEngineQueries.patterns());
  return null;
};

export const router = createBrowserRouter([
  // 1. 공통 헤더 쉘 레이아웃에서 탈출한 단독 풀스크린 라우트
  {
    path: "/login",
    element: <LoginPage />,
    action: loginAction(),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    action: registerAction(),
    errorElement: <ErrorBoundary />,
  },
  
  // 2. 인증 가드가 탑재된 공통 레이아웃 보호 영역 라우트
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    loader: rootLoader(),
    children: [
      {
        index: true,
        element: <Navigate to="/washing" replace />,
      },
      {
        path: "sample",
        element: <SamplePage />,
        loader: sampleLoader(queryClient),
        action: sampleAction(queryClient),
      },
      {
        path: "washing",
        element: <WashingPage />,
        loader: washingLoader(queryClient),
        action: washingAction(queryClient),
      },
      {
        path: "rules",
        element: <RuleEngineBuilderPage />,
        loader: ruleEngineLoader(),
        action: washingAction(queryClient),
      },
      {
        path: "insights",
        element: <AiInsightsPage />,
        loader: aiInsightsLoader(queryClient),
      },
      {
        path: "pivot",
        element: (
          <ComingSoonPage
            title="피벗 분석 준비 중"
            description="다차원 피벗 분석 화면은 현재 준비 중입니다."
          />
        ),
      },
      {
        path: "sim",
        element: (
          <ComingSoonPage
            title="미래 가치 시뮬레이터 준비 중"
            description="미래 가치 시뮬레이터 화면은 현재 준비 중입니다."
          />
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);


