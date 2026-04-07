export declare class MobilePatientListDto {
    page?: number;
    pageSize?: number;
    search?: string;
}
export declare class MobileDemandListDto {
    page?: number;
    pageSize?: number;
    status?: string;
}
export declare class MobilePatientDto {
    id: string;
    name: string;
    phone: string | null;
    gender: string | null;
    tier: string;
    status: string;
    lastVisitAt: string | null;
    assignedUserName: string | null;
}
export declare class MobileDemandDto {
    id: string;
    patientId: string;
    patientName: string;
    type: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
}
export declare class MobileTouchpointDto {
    id: string;
    patientId: string;
    patientName: string;
    type: string;
    title: string;
    content: string | null;
    sentiment: string | null;
    createdAt: string;
}
export declare class MobileFollowupDto {
    id: string;
    patientId: string;
    patientName: string;
    type: string;
    status: string;
    planTime: string;
    content: string | null;
}
