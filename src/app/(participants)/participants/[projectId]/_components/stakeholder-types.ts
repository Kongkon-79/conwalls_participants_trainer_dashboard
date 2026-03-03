export interface Stakeholder {
    _id: string;
    insightEngineId: string;
    name: string;
    roleType: string;
    painPoint?: string;
    benefits?: string;
    triggerEvaluation?: "" | "LOW_POINTS" | "HIGH_POINTS";
    objectionsConcerns?: string;
    objectionHandling?: string;
    createdAt: string;
    updatedAt: string;
    measures?: unknown[]; // Array of measures from the backend if populated, else unused here
}

export interface StakeholdersResponse {
    status: boolean;
    message: string;
    data: Stakeholder[];
}
