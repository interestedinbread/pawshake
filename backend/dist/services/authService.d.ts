export declare const register: (email: string, password: string) => Promise<any>;
export declare const login: (email: string, password: string) => Promise<{
    user: {
        id: any;
        email: any;
        created_at: any;
    };
    token: string;
}>;
//# sourceMappingURL=authService.d.ts.map