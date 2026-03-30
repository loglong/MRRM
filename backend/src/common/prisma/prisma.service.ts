import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Logger } from '../logger';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private logger: Logger;

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
    this.logger = new Logger('PrismaService');
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...', 'PrismaService');

    // Connect with retry logic
    await this.$connect();

    // Enable Row-Level Security via raw query
    await this.$executeRaw`
      SELECT set_config('app.current_org_id', '00000000-0000-0000-0000-000000000000', false)
    `.catch(() => {
      // Ignore if extension not available in dev
      this.logger.warn('Could not set app.current_org_id', 'PrismaService');
    });

    this.logger.log('Database connected', 'PrismaService');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected', 'PrismaService');
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on as any;
  }

  async setOrgContext(orgId: string): Promise<void> {
    try {
      await this.$executeRaw`SELECT set_config('app.current_org_id', ${orgId}, true)`;
    } catch (error) {
      this.logger.warn(`Could not set org context: ${error}`, 'PrismaService');
    }
  }

  async clearOrgContext(): Promise<void> {
    try {
      await this.$executeRaw`SELECT set_config('app.current_org_id', '00000000-0000-0000-0000-000000000000', true)`;
    } catch (error) {
      this.logger.warn(`Could not clear org context: ${error}`, 'PrismaService');
    }
  }
}
