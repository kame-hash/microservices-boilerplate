// src/utils/helpers.ts
import { v4 as uuidv4 } from 'uuid';
import { RedisClient } from 'redis';
import { Pool } from 'pg';
import { Logger } from '../logger';
import { Config } from '../config';
import { HttpException } from '../exceptions';

export const generateUUID = (): string => {
  return uuidv4();
};

export const redisPublish = async (redisClient: RedisClient, channel: string, message: string): Promise<void> => {
  try {
    await redisClient.publish(channel, message);
  } catch (error) {
    Logger.error(`Error publishing to Redis channel ${channel}: ${error.message}`);
    throw new HttpException(500, 'Failed to publish to Redis channel');
  }
};

export const postgresQuery = async (pool: Pool, query: string, params: any[] = []): Promise<any> => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    Logger.error(`Error executing PostgreSQL query: ${error.message}`);
    throw new HttpException(500, 'Failed to execute PostgreSQL query');
  }
};

export const validateEnvVar = (varName: string, varValue: string | undefined): string => {
  if (!varValue) {
    throw new HttpException(500, `Environment variable ${varName} is not set`);
  }
  return varValue;
};

export const getConfig = (config: Config, key: string): any => {
  const value = config[key];
  if (!value) {
    throw new HttpException(500, `Config key ${key} is not set`);
  }
  return value;
};

export const getRedisClient = (config: Config): RedisClient => {
  const redisUrl = getConfig(config, 'redisUrl');
  const redisClient = new RedisClient(redisUrl);
  return redisClient;
};

export const getPostgresPool = (config: Config): Pool => {
  const postgresUrl = getConfig(config, 'postgresUrl');
  const postgresPool = new Pool({
    connectionString: postgresUrl,
  });
  return postgresPool;
};