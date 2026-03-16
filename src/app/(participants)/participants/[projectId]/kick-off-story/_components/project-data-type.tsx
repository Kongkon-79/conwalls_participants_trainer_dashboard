

export interface ProjectsApiResponse {
  status: boolean;
  message: string;
  data: InsightEngineData;
}

export interface InsightEngineData {
  _id: string;
  participantName: string;
  organization: string;
  projectTitle: string;
  kickOffDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  systemForms: SystemForms;
}

export interface SystemForms {
  vision: string;
  pastGoodOldDays: string;
  obstacleProblem: string;
  riskOfInaction: string;
  solutionIdea: string;
}