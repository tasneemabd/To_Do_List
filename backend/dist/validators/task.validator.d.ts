import { z } from 'zod';
export declare const createTaskSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
        status: z.ZodDefault<z.ZodEnum<["todo", "inprogress", "done"]>>;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        orderIndex: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status: "todo" | "inprogress" | "done";
        title: string;
        priority: "low" | "medium" | "high";
        tags: string[];
        orderIndex: number;
        description?: string | undefined;
        dueDate?: string | null | undefined;
    }, {
        title: string;
        status?: "todo" | "inprogress" | "done" | undefined;
        description?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
        dueDate?: string | null | undefined;
        tags?: string[] | undefined;
        orderIndex?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status: "todo" | "inprogress" | "done";
        title: string;
        priority: "low" | "medium" | "high";
        tags: string[];
        orderIndex: number;
        description?: string | undefined;
        dueDate?: string | null | undefined;
    };
}, {
    body: {
        title: string;
        status?: "todo" | "inprogress" | "done" | undefined;
        description?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
        dueDate?: string | null | undefined;
        tags?: string[] | undefined;
        orderIndex?: number | undefined;
    };
}>;
export declare const updateTaskSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        status: z.ZodOptional<z.ZodEnum<["todo", "inprogress", "done"]>>;
        dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        orderIndex: z.ZodOptional<z.ZodNumber>;
        isCompleted: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        status?: "todo" | "inprogress" | "done" | undefined;
        description?: string | null | undefined;
        title?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
        dueDate?: string | null | undefined;
        tags?: string[] | undefined;
        orderIndex?: number | undefined;
        isCompleted?: boolean | undefined;
    }, {
        status?: "todo" | "inprogress" | "done" | undefined;
        description?: string | null | undefined;
        title?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
        dueDate?: string | null | undefined;
        tags?: string[] | undefined;
        orderIndex?: number | undefined;
        isCompleted?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        status?: "todo" | "inprogress" | "done" | undefined;
        description?: string | null | undefined;
        title?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
        dueDate?: string | null | undefined;
        tags?: string[] | undefined;
        orderIndex?: number | undefined;
        isCompleted?: boolean | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        status?: "todo" | "inprogress" | "done" | undefined;
        description?: string | null | undefined;
        title?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
        dueDate?: string | null | undefined;
        tags?: string[] | undefined;
        orderIndex?: number | undefined;
        isCompleted?: boolean | undefined;
    };
}>;
export declare const getTasksSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
        limit: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
        status: z.ZodOptional<z.ZodEnum<["todo", "inprogress", "done"]>>;
        priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        search: z.ZodOptional<z.ZodString>;
        tag: z.ZodOptional<z.ZodString>;
        sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "dueDate", "priority", "orderIndex"]>>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sortBy: "createdAt" | "updatedAt" | "priority" | "dueDate" | "orderIndex";
        sortOrder: "asc" | "desc";
        status?: "todo" | "inprogress" | "done" | undefined;
        search?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
        tag?: string | undefined;
    }, {
        status?: "todo" | "inprogress" | "done" | undefined;
        search?: string | undefined;
        limit?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
        page?: string | undefined;
        tag?: string | undefined;
        sortBy?: "createdAt" | "updatedAt" | "priority" | "dueDate" | "orderIndex" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        page: number;
        sortBy: "createdAt" | "updatedAt" | "priority" | "dueDate" | "orderIndex";
        sortOrder: "asc" | "desc";
        status?: "todo" | "inprogress" | "done" | undefined;
        search?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
        tag?: string | undefined;
    };
}, {
    query: {
        status?: "todo" | "inprogress" | "done" | undefined;
        search?: string | undefined;
        limit?: string | undefined;
        priority?: "low" | "medium" | "high" | undefined;
        page?: string | undefined;
        tag?: string | undefined;
        sortBy?: "createdAt" | "updatedAt" | "priority" | "dueDate" | "orderIndex" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    };
}>;
export declare const taskIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const updateOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        tasks: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            orderIndex: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            orderIndex: number;
        }, {
            id: string;
            orderIndex: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        tasks: {
            id: string;
            orderIndex: number;
        }[];
    }, {
        tasks: {
            id: string;
            orderIndex: number;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        tasks: {
            id: string;
            orderIndex: number;
        }[];
    };
}, {
    body: {
        tasks: {
            id: string;
            orderIndex: number;
        }[];
    };
}>;
//# sourceMappingURL=task.validator.d.ts.map