import { AuthorizateUser, checkUserSession, logout } from '../AuthorizationService';

const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
};

jest.mock('@/app/core/api', () => ({
  getApiClient: jest.fn(() => Promise.resolve(mockApiClient)),
}));

describe('AuthorizationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthorizateUser', () => {
    it('deve autenticar o usuário e retornar os dados corretamente', async () => {
      const mockPayload = { email: 'test@test.com', password: '123' };
      const mockResponseData = { token: 'fake-jwt-token', user: { id: '1', name: 'Rhyan' } };
      
      mockApiClient.post.mockResolvedValueOnce({ data: mockResponseData });

      const result = await AuthorizateUser(mockPayload);

      expect(mockApiClient.post).toHaveBeenCalledWith('User/auth', mockPayload);
      expect(result).toEqual(mockResponseData);
    });
  });

  describe('checkUserSession', () => {
    it('deve retornar os dados da sessão do usuário corretamente', async () => {
      const mockResponseData = { id: '1', name: 'Rhyan', email: 'test@test.com' };
      
      mockApiClient.get.mockResolvedValueOnce({ data: mockResponseData });

      const result = await checkUserSession();

      expect(mockApiClient.get).toHaveBeenCalledWith('User/me');
      expect(result).toEqual(mockResponseData);
    });
  });

  describe('logout', () => {
    it('deve realizar o logout com sucesso', async () => {
      const mockResponseData = { success: true };
      
      mockApiClient.post.mockResolvedValueOnce({ data: mockResponseData });

      const result = await logout();

      expect(mockApiClient.post).toHaveBeenCalledWith('User/logout');
      expect(result).toEqual(mockResponseData);
    });
  });
});