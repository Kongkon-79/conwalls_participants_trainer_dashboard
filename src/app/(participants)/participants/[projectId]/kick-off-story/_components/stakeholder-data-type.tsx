

export interface StakeholderApiResponse {
  status: boolean;
  message: string;
  data: StakeholderData;
}

export interface StakeholderData {
  _id: string;
  insightEngineId: string;
  name: string;
  roleType: string;
  painPoint: string;
  benefits: string;
  triggerEvaluation: string;
  objectionsConcerns: string;
  objectionHandling: string;
  callToAction: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}