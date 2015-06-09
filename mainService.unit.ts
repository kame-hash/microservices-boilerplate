// src/mainService/tests/mainService.unit.ts
import { MainService } from '../../mainService';
import { UserService } from '../../userService';
import { AuthService } from '../../authService';
import { RedisClient } from '../../../infra/redisClient';
import { PostgreSQLClient } from '../../../infra/postgreSQLClient';
import { JwtTokenGenerator } from '../../../utils/jwtTokenGenerator';
import { EventBus } from '../../../utils/eventBus';

describe('MainService Unit Tests', () => {
  let mainService: MainService;
  let userService: UserService;
  let authService: AuthService;
  let redisClient: RedisClient;
  let postgreSQLClient: PostgreSQLClient;
  let jwtTokenGenerator: JwtTokenGenerator;
  let eventBus: EventBus;

  beforeEach(async () => {
    // set up test dependencies
    redisClient = new RedisClient();
    postgreSQLClient = new PostgreSQLClient();
    jwtTokenGenerator = new JwtTokenGenerator();
    eventBus = new EventBus(redisClient);
    userService = new UserService(postgreSQLClient);
    authService = new AuthService(jwtTokenGenerator, postgreSQLClient);
    mainService = new MainService(userService, authService, eventBus);
  });

  it('should create a new user', async () => {
    const userInput = { email: 'test@example.com', password: 'password123' };
    const result = await mainService.createUser(userInput);
    expect(result.success).toBe(true);
    expect(result.user.email).toBe(userInput.email);
  });

  it('should throw an error for duplicate user', async () => {
    const userInput = { email: 'test@example.com', password: 'password123' };
    await mainService.createUser(userInput);
    try {
      await mainService.createUser(userInput);
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('User with this email already exists');
    }
  });

  it('should authenticate a user', async () => {
    const userInput = { email: 'test@example.com', password: 'password123' };
    await mainService.createUser(userInput);
    const authenticateInput = { email: userInput.email, password: userInput.password };
    const result = await mainService.authenticateUser(authenticateInput);
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });

  afterEach(async () => {
    // clean up test dependencies
    await postgreSQLClient.deleteAllUsers();
    await redisClient.flushAll();
  });
});