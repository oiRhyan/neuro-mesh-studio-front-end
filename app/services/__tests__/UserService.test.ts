import { RegisterUser, UpdateUser, getUserById } from '../UserService';
import { tripoApi } from '@/app/core/api';

jest.mock('@/app/core/api', () => ({
  tripoApi: {
    post: jest.fn(),
    patch: jest.fn(),
    get: jest.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RegisterUser', () => {
    it('deve enviar o FormData correto contendo arquivos File', async () => {
      const profileFile = new File(['profile'], 'profile.png', { type: 'image/png' });
      const bannerFile = new File(['banner'], 'banner.png', { type: 'image/png' });

      const mockPayload = {
        Name: 'Test User',
        Email: 'test@example.com',
        Password: 'password123',
        Biography: 'Hello world',
        ImageProfile: profileFile,
        ImageBanner: bannerFile,
      };

      const mockResponse = { data: { success: true } };
      (tripoApi.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await RegisterUser(mockPayload);

      expect(tripoApi.post).toHaveBeenCalledWith('User', expect.any(FormData));
      expect(result).toEqual(mockResponse.data);

      const formData = (tripoApi.post as jest.Mock).mock.calls[0][1] as FormData;
      expect(formData.get('Name')).toBe('Test User');
      expect(formData.get('Email')).toBe('test@example.com');
      expect(formData.get('Password')).toBe('password123');
      expect(formData.get('Biography')).toBe('Hello world');
      expect(formData.get('ImageProfile')).toBe(profileFile);
      expect(formData.get('ImageBanner')).toBe(bannerFile);
    });

    it('deve usar string vazia caso os arquivos File sejam ausentes no registro', async () => {
      const mockPayload = {
        Name: 'Test User',
        Email: 'test@example.com',
        Password: 'password123',
        Biography: 'Hello world',
        ImageProfile: undefined,
        ImageBanner: undefined,
      };

      (tripoApi.post as jest.Mock).mockResolvedValueOnce({ data: {} });

      await RegisterUser(mockPayload as any);

      const formData = (tripoApi.post as jest.Mock).mock.calls[0][1] as FormData;
      expect(formData.get('ImageProfile')).toBe('');
      expect(formData.get('ImageBanner')).toBe('');
    });
  });

  describe('UpdateUser', () => {
    it('deve enviar o FormData correto contendo arquivos File na atualização', async () => {
      const userId = 'user-123';
      const profileFile = new File(['new-profile'], 'new-profile.png', { type: 'image/png' });
      const bannerFile = new File(['new-banner'], 'new-banner.png', { type: 'image/png' });

      const mockPayload = {
        Name: 'Updated Name',
        Biography: 'Updated Bio',
        ImageProfile: profileFile,
        ImageBanner: bannerFile,
      };

      const mockResponse = { data: { success: true } };
      (tripoApi.patch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await UpdateUser(userId, mockPayload);

      expect(tripoApi.patch).toHaveBeenCalledWith(`User/update/${userId}`, expect.any(FormData));
      expect(result).toEqual(mockResponse.data);

      const formData = (tripoApi.patch as jest.Mock).mock.calls[0][1] as FormData;
      expect(formData.get('Name')).toBe('Updated Name');
      expect(formData.get('Biography')).toBe('Updated Bio');
      expect(formData.get('ImageProfile')).toBe(profileFile);
      expect(formData.get('ImageBanner')).toBe(bannerFile);
    });
  });

  describe('getUserById', () => {
    it('deve buscar o usuario por ID com sucesso', async () => {
      const userId = 'user-123';
      const mockResponse = { data: { id: userId, name: 'Test User' } };
      (tripoApi.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getUserById(userId);

      expect(tripoApi.get).toHaveBeenCalledWith(`User/${userId}`);
      expect(result).toEqual(mockResponse.data);
    });
  });
});