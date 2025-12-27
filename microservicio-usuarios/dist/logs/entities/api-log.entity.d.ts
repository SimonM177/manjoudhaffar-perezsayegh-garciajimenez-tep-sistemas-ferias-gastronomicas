export declare class ApiLog {
    id: number;
    route: string;
    method: string;
    userId: string | null;
    timestamp: Date;
    statusCode: number;
    message: string | null;
}
