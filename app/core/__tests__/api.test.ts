import axios from 'axios';
import Cookies from 'js-cookie';

jest.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  };

  return {
    create: jest.fn(() => mockAxiosInstance),
  };
});

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  remove: jest.fn(),
}));

describe('tripoApi', () => {
  let tripoApi: any;
  let requestInterceptor: any;
  let responseSuccessInterceptor: any;
  let responseErrorInterceptor: any;

  beforeAll(() => {
    jest.isolateModules(() => {
      const apiModule = require('../api');

      tripoApi = apiModule.tripoApi;
    });

    const axiosInstance = (axios.create as jest.Mock).mock.results[0].value;

    requestInterceptor =
      axiosInstance.interceptors.request.use.mock.calls[0][0];

    responseSuccessInterceptor =
      axiosInstance.interceptors.response.use.mock.calls[0][0];

    responseErrorInterceptor =
      axiosInstance.interceptors.response.use.mock.calls[0][1];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Interceptor de requisição', () => {
    it('deve adicionar o token de autorização quando o token existir', () => {
      (Cookies.get as jest.Mock).mockReturnValue('fake-token-123');

      const config: any = {
        headers: {},
      };

      const result = requestInterceptor(config);

      expect(Cookies.get).toHaveBeenCalledWith('access-token');

      expect(result.headers.Authorization).toBe(
        'Bearer fake-token-123'
      );
    });

    it('não deve adicionar o token quando o cookie não existir', () => {
      (Cookies.get as jest.Mock).mockReturnValue(undefined);

      const config: any = {
        headers: {},
      };

      const result = requestInterceptor(config);

      expect(Cookies.get).toHaveBeenCalledWith('access-token');

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('deve retornar a mesma configuração da requisição', () => {
      (Cookies.get as jest.Mock).mockReturnValue(undefined);

      const config: any = {
        headers: {},
        method: 'GET',
        url: '/models',
      };

      const result = requestInterceptor(config);

      expect(result).toBe(config);
    });
  });

  describe('Interceptor de resposta', () => {
    it('deve retornar a resposta quando a requisição for bem-sucedida', () => {
      const response = {
        data: {
          id: 1,
          name: 'Modelo 3D',
        },
        status: 200,
      };

      const result = responseSuccessInterceptor(response);

      expect(result).toBe(response);
    });

    it('deve rejeitar o erro quando o status for diferente de 401', async () => {
      const error = {
        response: {
          status: 500,
        },
      };

      await expect(
        responseErrorInterceptor(error)
      ).rejects.toBe(error);

      expect(Cookies.remove).not.toHaveBeenCalled();
    });

    it('deve remover o cookie quando receber status 401', async () => {
      const error = {
        response: {
          status: 401,
        },
      };

      await expect(
        responseErrorInterceptor(error)
      ).rejects.toBe(error);

      expect(Cookies.remove).toHaveBeenCalledWith(
        'access-token',
        {
          path: '/',
        }
      );
    });

    it('deve rejeitar o erro 401 após tratar o token', async () => {
      const error = {
        response: {
          status: 401,
        },
      };

      await expect(
        responseErrorInterceptor(error)
      ).rejects.toEqual(error);
    });

    it('não deve remover o cookie quando o erro não possuir response', async () => {
      const error = {
        message: 'Network Error',
      };

      await expect(
        responseErrorInterceptor(error)
      ).rejects.toEqual(error);

      expect(Cookies.remove).not.toHaveBeenCalled();
    });
  });
});