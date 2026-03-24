import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
class DatabaseService {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });
    }
    return DatabaseService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect();
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      await DatabaseService.getInstance().$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const prisma = DatabaseService.getInstance();
export default DatabaseService;
