import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;

  let authServiceMock: {
    register: jest.Mock;
    login: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authServiceMock = {
      register: jest.fn(),
      login: jest.fn(),
    };

    authController = new AuthController(
      authServiceMock as unknown as AuthService,
    );
  });

  describe('register', () => {
    it('registers user through service', async () => {
      const dto = {
        firstname: 'Anna',
        lastname: 'Smith',
        email: 'anna@test.com',
        password: 'Password123',
      };

      const authResponse = {
        token: 'register-token',
      };

      authServiceMock.register.mockResolvedValue(authResponse);

      const result = await authController.register(dto);

      expect(authServiceMock.register).toHaveBeenCalledWith(dto);

      expect(result).toEqual(authResponse);
    });
  });

  describe('login', () => {
    it('logs in user through service', async () => {
      const dto = {
        email: 'anna@test.com',
        password: 'Password123',
      };

      const authResponse = {
        token: 'login-token',
      };

      authServiceMock.login.mockResolvedValue(authResponse);

      const result = await authController.login(dto);

      expect(authServiceMock.login).toHaveBeenCalledWith(dto);

      expect(result).toEqual(authResponse);
    });
  });
});
