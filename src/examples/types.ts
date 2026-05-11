import type { ComponentType } from "react";

export type Stage = "기초" | "초급" | "중급" | "고급" | "심화";

export type StudyExample = {
  id: string;
  title: string;
  summary: string;
  curriculumPath: string;
  stage: Stage;
  Component: ComponentType;
};
