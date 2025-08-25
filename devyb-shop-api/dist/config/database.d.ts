declare class Database {
    private static instance;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getConnectionStatus(): string;
}
export default Database;
//# sourceMappingURL=database.d.ts.map