interface BackendResponse<T> {
    content: T;
    timestamp: string;
}

interface RequestContextType {
    makeRequest: <T>(url: string, options?: RequestInit, requireAuth?: boolean) => Promise<T>;
}

export { BackendResponse, RequestContextType }