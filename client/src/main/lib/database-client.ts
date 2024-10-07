import path from 'path';
import { app } from 'electron';
import { PrismaClient } from '@prisma/client';
import Store from 'electron-store';
/**
 * DatabaseClient class implementing the Singleton pattern.
 */
class DatabaseClient {
  private static instance: DatabaseClient | null = null;
  private client: PrismaClient | null = null;
  private store = new Store();
  private constructor() { }

  /**
   * Gets the singleton instance of DatabaseClient.
   * @returns {DatabaseClient} The singleton instance.
   */
  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  /**
   * Connects to a database or returns an existing connection.
   * @param {string} url - The URL of the database to connect to.
   * @returns {PrismaClient} The PrismaClient instance for the specified database.
   */
  public connect(url: string): PrismaClient {
    const currentDbUrl = this.store.get('databaseUrl') as string;

    if (currentDbUrl !== url || this.client === null) {
      // Disconnect existing client if it exists
      if (this.client) {
        this.client.$disconnect();
      }

      // Update the stored database URL
      this.store.set('databaseUrl', url);

      // Initialize the new client
      this.client = new PrismaClient({
        datasources: {
          db: {
            url: url,
          },
        },
      });
    }

    return this.client;
  }

  /**
   * Gets the current PrismaClient instance.
   * @type {PrismaClient}
   * @throws {Error} If no client has been initialized.
   */
  public get prisma(): PrismaClient {
    if (!this.client) {
      throw new Error('Database client has not been initialized. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Gets the base path for database files.
   * @type {string}
   */
  public get basePath(): string {
    return path.join(app.getPath('userData'), 'databases');
  }
}

// Export the singleton instance
export default DatabaseClient.getInstance();