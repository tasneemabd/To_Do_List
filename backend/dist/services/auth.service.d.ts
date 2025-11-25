interface RegisterInput {
    email: string;
    username: string;
    password: string;
    name?: string;
}
interface LoginInput {
    email: string;
    password: string;
}
/**
 * Register a new user
 */
export declare const registerUser: (input: RegisterInput) => Promise<{
    user: {
        id: string;
        email: string;
        username: string;
        name: string | undefined;
        role: string;
        createdAt: Date;
    };
    token: string;
}>;
/**
 * Login user
 */
export declare const loginUser: (input: LoginInput) => Promise<{
    user: {
        id: string;
        email: string;
        username: string;
        name: string | undefined;
        role: string;
        createdAt: Date;
    };
    token: string;
}>;
export {};
//# sourceMappingURL=auth.service.d.ts.map