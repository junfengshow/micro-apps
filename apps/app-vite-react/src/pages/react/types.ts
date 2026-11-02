export interface InterviewDetails {
  kind: "原理分析" | "代码推演" | "场景设计" | "故障排查";
  difficulty: "进阶" | "高级" | "专家";
  prompt: string;
  questionCode?: string;
  followUps: string[];
  checks: string[];
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  group: string;
  summary: string;
  points: string[];
  code: string;
  takeaway: string;
  source: string;
  interview?: InterviewDetails;
  Demo?: React.ReactElement
}

export interface InterviewEntry extends KnowledgeEntry {
  interview: InterviewDetails;
}

export interface KnowledgeCategory {
  id: string;
  label: string;
  caption: string;
  number: string;
  description: string;
  entries: KnowledgeEntry[];
}
