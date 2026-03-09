interface TokenRefreshResponse {
    access_token: string;
}

interface AuthContextType {
    sessionValid: boolean;
    validateSession: (overrideToken?: string) => Promise<string>;
    logout: () => Promise<void>;
    handleUnauthorizedSession: () => never;
}

export { TokenRefreshResponse, AuthContextType }