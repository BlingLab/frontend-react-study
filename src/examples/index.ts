import { AdvancedHooksExample } from "./AdvancedHooksExample";
import { ContextReducerExample } from "./ContextReducerExample";
import { ErrorBoundaryExample } from "./ErrorBoundaryExample";
import { LazyLoadingExample } from "./LazyLoadingExample";
import { CustomHooksExample } from "./CustomHooksExample";
import { DeferredValueExample } from "./DeferredValueExample";
import { EffectsFetchingExample } from "./EffectsFetchingExample";
import { EventsFormsExample } from "./EventsFormsExample";
import { IntermediatePatternsExample } from "./IntermediatePatternsExample";
import { JsxComponentsExample } from "./JsxComponentsExample";
import { OptimisticExample } from "./OptimisticExample";
import { PerformanceExample } from "./PerformanceExample";
import { PortalModalExample } from "./PortalModalExample";
import { PropsStateExample } from "./PropsStateExample";
import { TransitionExample } from "./TransitionExample";
import { TypeScriptPatternsExample } from "./TypeScriptPatternsExample";
import type { StudyExample } from "./types";

export const examples: StudyExample[] = [
  // ── 1단계. 기초 ───────────────────────────────────────────
  {
    id: "jsx-components",
    title: "JSX Components",
    summary: "props, list, empty state로 카드 목록을 만듭니다.",
    curriculumPath: "01-학습문서/01-기초/05-props-이해하기.md",
    stage: "기초",
    Component: JsxComponentsExample,
  },
  // ── 2단계. 초급 ───────────────────────────────────────────
  {
    id: "props-state",
    title: "Props State",
    summary: "props와 useState로 독립적인 카운터를 만듭니다.",
    curriculumPath: "01-학습문서/02-초급/01-state를-고르는법.md",
    stage: "초급",
    Component: PropsStateExample,
  },
  {
    id: "events-forms",
    title: "Events Forms",
    summary: "form submit으로 배열 state를 업데이트합니다.",
    curriculumPath: "01-학습문서/02-초급/02-event와-form.md",
    stage: "초급",
    Component: EventsFormsExample,
  },
  // ── 3단계. 중급 ───────────────────────────────────────────
  {
    id: "effects-fetching",
    title: "Effects Fetching",
    summary: "Effect로 외부 데이터를 불러오고 상태를 나눕니다.",
    curriculumPath: "01-학습문서/03-중급/02-fetching-상태-나누기.md",
    stage: "중급",
    Component: EffectsFetchingExample,
  },
  {
    id: "custom-hooks",
    title: "Custom Hooks",
    summary: "상태 로직을 custom Hook으로 추출하고 재사용합니다.",
    curriculumPath: "01-학습문서/03-중급/03-custom-hook-만들기.md",
    stage: "중급",
    Component: CustomHooksExample,
  },
  {
    id: "intermediate-patterns",
    title: "Intermediate Patterns",
    summary: "계산값, ref, 필터 UI를 중급 패턴으로 정리합니다.",
    curriculumPath: "01-학습문서/03-중급/06-derived-state와-계산값.md",
    stage: "중급",
    Component: IntermediatePatternsExample,
  },
  {
    id: "portal-modal",
    title: "Portal Modal",
    summary: "createPortal로 컴포넌트 트리 바깥에 모달을 렌더링합니다.",
    curriculumPath: "01-학습문서/03-중급/12-portal과-modal.md",
    stage: "중급",
    Component: PortalModalExample,
  },
  {
    id: "deferred-value",
    title: "Deferred Value",
    summary: "useDeferredValue로 입력 반응성을 유지하며 느린 목록을 처리합니다.",
    curriculumPath: "01-학습문서/03-중급/14-useDeferredValue와-느린-UI-다루기.md",
    stage: "중급",
    Component: DeferredValueExample,
  },
  {
    id: "lazy-loading",
    title: "Lazy Loading",
    summary: "React.lazy와 Suspense로 컴포넌트 코드를 지연 로딩합니다.",
    curriculumPath: "01-학습문서/03-중급/13-lazy-loading과-코드분할.md",
    stage: "중급",
    Component: LazyLoadingExample,
  },
  // ── 4단계. 고급 ───────────────────────────────────────────
  {
    id: "error-boundary",
    title: "Error Boundary",
    summary: "렌더링 오류를 격리하고 복구하는 Error Boundary 패턴을 다룹니다.",
    curriculumPath: "01-학습문서/04-고급/06-error-boundary로-렌더링-오류-다루기.md",
    stage: "고급",
    Component: ErrorBoundaryExample,
  },
  {
    id: "context-reducer",
    title: "Context Reducer",
    summary: "reducer와 context로 상태 변경 규칙을 정리합니다.",
    curriculumPath: "01-학습문서/04-고급/01-reducer로-변경규칙-모으기.md",
    stage: "고급",
    Component: ContextReducerExample,
  },
  {
    id: "transition",
    title: "Transition",
    summary: "useTransition으로 급하지 않은 업데이트를 표시합니다.",
    curriculumPath: "01-학습문서/04-고급/04-transition과-pending-UI.md",
    stage: "고급",
    Component: TransitionExample,
  },
  {
    id: "optimistic",
    title: "Optimistic UI",
    summary: "useOptimistic으로 서버 응답 전에 화면을 먼저 바꿉니다.",
    curriculumPath: "01-학습문서/04-고급/07-optimistic-UI-설계하기.md",
    stage: "고급",
    Component: OptimisticExample,
  },
  // ── 5단계. 심화 ───────────────────────────────────────────
  {
    id: "typescript-patterns",
    title: "TypeScript Patterns",
    summary: "discriminated union, generic 컴포넌트, Context 타입 안전 Hook 패턴을 다룹니다.",
    curriculumPath: "01-학습문서/05-심화/09-타입스크립트와-리액트-패턴.md",
    stage: "심화",
    Component: TypeScriptPatternsExample,
  },
  {
    id: "performance",
    title: "Performance",
    summary: "큰 목록 필터링과 memoization의 기준을 연습합니다.",
    curriculumPath: "01-학습문서/05-심화/02-memoization-판단하기.md",
    stage: "심화",
    Component: PerformanceExample,
  },
  {
    id: "advanced-hooks",
    title: "Advanced Hooks",
    summary: "useLocalStorage, useDebounce로 재사용 가능한 로직을 설계합니다.",
    curriculumPath: "01-학습문서/05-심화/08-custom-hook-심화.md",
    stage: "심화",
    Component: AdvancedHooksExample,
  },
];
