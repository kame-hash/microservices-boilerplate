// src/core/service.ts
import { Service } from '@core/framework';
import { EntityManager, getRepository, Repository } from 'typeorm';
import { inject, injectable } from 'tsyringe';
import { UserService } from './userService';
import { AuthService } from './authService';
import { Logger } from './logger';
import { RedisClient } from './redisClient';
import { Event } from './event';

@injectable()
class CoreService extends Service {
  private readonly userService: UserService;
  private readonly authService: AuthService;
  private readonly logger: Logger;
  private readonly redisClient: RedisClient;

  constructor(
    @inject('UserService') userService: UserService,
    @inject('AuthService') authService: AuthService,
    @inject('Logger') logger: Logger,
    @inject('RedisClient') redisClient: RedisClient
  ) {
    super();
    this.userService = userService;
    this.authService = authService;
    this.logger = logger;
    this.redisClient = redisClient;
  }

  async handleCoreBusinessLogic(userId: string, data: any): Promise<any> {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      const token = await this.authService.generateToken(user);
      await this.redisClient.publish(Event.USER_UPDATED, { userId, token });
      // persist data to database
      const entityManager = getRepository(EntityManager);
      const repository: Repository<any> = getRepository('Entity');
      await repository.save(data);
      return { success: true, message: 'Data saved successfully' };
    } catch (error) {
      this.logger.error(`Error handling core business logic: ${error.message}`);
      throw error;
    }
  }

  async handleRedisMessage(message: any): Promise<any> {
    try {
      const { userId, token } = message;
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      // handle message logic here
      await this.userService.updateUser(user, token);
      return { success: true, message: 'User updated successfully' };
    } catch (error) {
      this.logger.error(`Error handling redis message: ${error.message}`);
      throw error;
    }
  }
}