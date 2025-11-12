export interface Report {
    _id: string;
    title: string;
    type: 'glucose' | 'medication' | 'meals' | 'comprehensive';
    dateRange: string;
    status: 'ready' | 'generating' | 'failed';
    size: string;
    createdAt: string;
}
