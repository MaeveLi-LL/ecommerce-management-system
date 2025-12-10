import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    validateUser: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('应该返回验证后的用户', async () => {
      const username = 'testuser';
      const password = 'password123';
      const mockUser = {
        id: 1,
        username,
        email: 'test@example.com',
      };

      mockUsersService.validateUser.mockResolvedValue(mockUser);

      const result = await service.validateUser(username, password);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.validateUser).toHaveBeenCalledWith(
        username,
        password,
      );
    });
  });

  describe('login', () => {
    it('应该返回JWT token和用户信息', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };
      const mockToken = 'mock-jwt-token';

      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(mockUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
      });
    });
  });

  describe('register', () => {
    it('应该创建用户并返回token', async () => {
      const username = 'newuser';
      const email = 'newuser@example.com';
      const password = 'password123';
      const mockUser = {
        id: 1,
        username,
        email,
      };
      const mockToken = 'mock-jwt-token';

      mockUsersService.createUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.register(username, email, password);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
        },
      });
      expect(mockUsersService.createUser).toHaveBeenCalledWith(
        username,
        email,
        password,
      );
    });
  });
});

