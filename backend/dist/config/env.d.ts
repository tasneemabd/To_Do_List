declare const _default: {
    env: "development" | "production" | "test";
    port: number;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        expire: string;
    };
    cors: {
        origin: string[];
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
};
export default _default;
//# sourceMappingURL=env.d.ts.map