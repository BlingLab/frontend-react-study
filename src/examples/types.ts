import type { ComponentType } from "react";

export type StudyExample = {
  id: string;
  title: string;
  summary: string;
  curriculumPath: string;
  Component: ComponentType;
};
