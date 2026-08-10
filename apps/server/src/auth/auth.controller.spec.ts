import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;

  let authServiceMock: {
    register: jest.Mock;
    verifyEmail: jest.Mock;
    resendVerification: jest.Mock;
    login: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authServiceMock = {
      register: jest.fn(),
      verifyEmail: jest.fn(),
      resendVerification: jest.fn(),
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

      const registerResponse = {
        message: 'Verification code sent',
      };

      authServiceMock.register.mockResolvedValue(registerResponse);

      const result = await authController.register(dto);

      expect(authServiceMock.register).toHaveBeenCalledWith(dto);

      expect(result).toEqual(registerResponse);
    });
  });

  describe('verifyEmail', () => {
    it('verifies email through service', async () => {
      const dto = {
        email: 'anna@test.com',
        code: '123456',
      };

      const authResponse = {
        token: 'verify-token',
      };

      authServiceMock.verifyEmail.mockResolvedValue(authResponse);

      const result = await authController.verifyEmail(dto);

      expect(authServiceMock.verifyEmail).toHaveBeenCalledWith(dto);

      expect(result).toEqual(authResponse);
    });
  });

  describe('resendVerification', () => {
    it('resends verification through service', async () => {
      const dto = {
        email: 'anna@test.com',
      };

      const registerResponse = {
        message: 'Verification code sent',
      };

      authServiceMock.resendVerification.mockResolvedValue(registerResponse);

      const result = await authController.resendVerification(dto);

      expect(authServiceMock.resendVerification).toHaveBeenCalledWith(dto);

      expect(result).toEqual(registerResponse);
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
