import AuthorizateUser from '../AuthorizationService';
import { tripoApi } from '@/app/core/api';

jest.mock('@/app/core/api', () => ({
  tripoApi: {
    post: jest.fn(),
  },
}));

describe('AuthorizationService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve autenticar o usuário e retornar os dados corretamente', async () => {
    const mockPayload = { email: 'test@test.com', password: '123' };
    const mockResponseData = { token: 'fake-jwt-token', user: { id: '1', name: 'Rhyan' } };
    
    (tripoApi.post as jest.Mock).mockResolvedValueOnce({ data: mockResponseData });

    const result = await AuthorizateUser(mockPayload);

    expect(tripoApi.post).toHaveBeenCalledWith('User/auth', mockPayload);
    expect(result).toEqual(mockResponseData);
  });
});