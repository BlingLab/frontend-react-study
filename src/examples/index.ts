import { ContextReducerExample } from "./ContextReducerExample";
import { CustomHooksExample } from "./CustomHooksExample";
import { EffectsFetchingExample } from "./EffectsFetchingExample";
import { EventsFormsExample } from "./EventsFormsExample";
import { IntermediatePatternsExample } from "./IntermediatePatternsExample";
import { JsxComponentsExample } from "./JsxComponentsExample";
import { PerformanceExample } from "./PerformanceExample";
import { PropsStateExample } from "./PropsStateExample";
import type { StudyExample } from "./types";

export const examples: StudyExample[] = [
  {
    id: "jsx-components",
    title: "JSX Components",
    summary: "props, list, empty state로 카드 목록을 만듭니다.",
    curriculumPath: "01-학습문서/01-기초/05-props-이해하기.md",
    Component: JsxComponentsExample,
  },
  {
    id: "props-state",
    title: "Props State",
    summary: "props와 useState로 독립적인 카운터를 만듭니다.",
    curriculumPath: "01-학습문서/02-초급/01-state를-고르는법.md",
    Component: PropsStateExample,
  },
  {
    id: "events-forms",
    title: "Events Forms",
    summary: "form submit으로 배열 state를 업데이트합니다.",
    curriculumPath: "01-학습문서/02-초급/02-event와-form.md",
    Component: EventsFormsExample,
  },
  {
    id: "effects-fetching",
    title: "Effects Fetching",
    summary: "Effect로 외부 데이터를 불러오고 상태를 나눕니다.",
    curriculumPath: "01-학습문서/03-중급/02-fetching-상태-나누기.md",
    Component: EffectsFetchingExample,
  },
  {
    id: "custom-hooks",
    title: "Custom Hooks",
    summary: "반복되는 토글 상태 로직을 custom Hook으로 분리합니다.",
    curriculumPath: "01-학습문서/03-중급/03-custom-hook-만들기.md",
    Component: CustomHooksExample,
  },
  {
    id: "intermediate-patterns",
    title: "Intermediate Patterns",
    summary: "계산값, ref, 필터 UI를 중급 패턴으로 정리합니다.",
    curriculumPath: "01-학습문서/03-중급/06-derived-state와-계산값.md",
    Component: IntermediatePatternsExample,
  },
  {
    id: "context-reducer",
    title: "Context Reducer",
    summary: "reducer와 context로 상태 변경 규칙을 정리합니다.",
    curriculumPath: "01-학습문서/04-고급/01-reducer로-변경규칙-모으기.md",
    Component: ContextReducerExample,
  },
  {
    id: "performance",
    title: "Performance",
    summary: "큰 목록 필터링과 memoization의 기준을 연습합니다.",
    curriculumPath: "01-학습문서/05-심화/02-memoization-판단하기.md",
    Component: PerformanceExample,
  },
];
