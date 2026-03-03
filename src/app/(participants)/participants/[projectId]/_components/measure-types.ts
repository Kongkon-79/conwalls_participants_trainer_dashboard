export interface Measure {
    _id: string;
    stakeholderId: string;
    insightEngineId: string;
    category: string;
    type: string;
    name: string;
    startWeeks: number;
    timing: 'pre' | 'post';
    createdAt?: string;
    updatedAt?: string;
}

export interface MeasuresResponse {
    status: boolean;
    message: string;
    data: Measure[];
}
