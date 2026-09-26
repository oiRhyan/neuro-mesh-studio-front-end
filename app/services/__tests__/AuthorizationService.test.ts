import { AuthorizateUser, checkUserSession, logout } from '../AuthorizationService';
import { tripoApi } from '@/app/core/api';

// Mock da api com os métodos necessários
jest.mock('@/app/core/api', () => ({
  tripoApi: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('AuthorizationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthorizateUser', () => {
    it('deve autenticar o usuário e retornar os dados corretamente', async () => {
      const mockPayload = { email: 'test@test.com', password: '123' };
      const mockResponseData = { token: 'fake-jwt-token', user: { id: '1', name: 'Rhyan' } };
      
      (tripoApi.post as jest.Mock).mockResolvedValueOnce({ data: mockResponseData });

      const result = await AuthorizateUser(mockPayload);

      expect(tripoApi.post).toHaveBeenCalledWith('User/auth', mockPayload);
      expect(result).toEqual(mockResponseData);
    });
  });

  describe('checkUserSession', () => {
    it('deve retornar os dados da sessão do usuário corretamente', async () => {
      const mockResponseData = { id: '1', name: 'Rhyan', email: 'test@test.com' };
      
      (tripoApi.get as jest.Mock).mockResolvedValueOnce({ data: mockResponseData });

      const result = await checkUserSession();

      expect(tripoApi.get).toHaveBeenCalledWith('User/me');
      expect(result).toEqual(mockResponseData);
    });
  });

  describe('logout', () => {
    it('deve realizar o logout com sucesso', async () => {
      const mockResponseData = { success: true };
      
      (tripoApi.post as jest.Mock).mockResolvedValueOnce({ data: mockResponseData });

      const result = await logout();

      expect(tripoApi.post).toHaveBeenCalledWith('User/logout');
      expect(result).toEqual(mockResponseData);
    });
  });
});