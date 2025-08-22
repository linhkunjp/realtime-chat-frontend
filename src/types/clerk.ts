export interface ClerkError extends Error {
    errors: {
        code: string;
        meta?: {
            paramName?: string;
        };
    }[];
}