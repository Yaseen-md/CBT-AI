import { Pool, PoolClient, QueryResult } from 'pg';
declare const pool: Pool;
/**
 * Execute a SQL query
 */
export declare const query: (text: string, params?: any[]) => Promise<QueryResult>;
/**
 * Get a client from the pool for transactions
 */
export declare const getClient: () => Promise<PoolClient>;
/**
 * Test database connection
 */
export declare const testConnection: () => Promise<boolean>;
/**
 * Close database pool (for graceful shutdown)
 */
export declare const closePool: () => Promise<void>;
export default pool;
//# sourceMappingURL=db.d.ts.map