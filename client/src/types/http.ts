interface BackendResponse<T> {
    content: T;
    timestamp: string;
}

export { BackendResponse }