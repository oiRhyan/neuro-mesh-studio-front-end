import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { AuthorizateUser } from '@/app/services/AuthorizationService';
import { jwtDecode } from 'jwt-decode';
import { useAuthorization } from '../useAuthorizationUser';

jest.mock('js-cookie');
jest.mock('sonner');
jest.mock('jwt-decode');
jest.mock('@/app/services/AuthorizationService');

describe('useAuthorization Hook', () => {
  let queryClient: QueryClient;
  const mockRouter = { push: jest.fn() } as any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('deve realizar login com sucesso, salvar cookies e redirecionar para /home', async () => {
    const mockPayload = { email: 'test@test.com', password: '123' };
    const mockAuthResponse = { token: 'fake-jwt-token', user: { id: '1', name: 'Rhyan' } };
    
    (AuthorizateUser as jest.Mock).mockResolvedValueOnce(mockAuthResponse);
    (jwtDecode as jest.Mock).mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

    const { result } = renderHook(() => useAuthorization(mockRouter), { wrapper });

    await act(async () => {
      await result.current.login(mockPayload);
    });

    expect(Cookies.set).toHaveBeenCalledWith(
      'user', 
      JSON.stringify(mockAuthResponse.user), 
      expect.any(Object)
    );
    
    expect(mockRouter.push).toHaveBeenCalledWith('/home');
  });
});