import { createModel } from '../ModelService';
import { getApiClient } from '@/app/core/api';

const mockApiClient = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@/app/core/api', () => ({
  getApiClient: jest.fn(() => Promise.resolve(mockApiClient)),
}));

describe('ModelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve enviar um FormData com os dados corretos ao criar o modelo', async () => {
    const file = new File(['model'], 'model.obj', { type: 'model/obj' });
    const mockPayload = {
      type: 'base',
      model_version: 'v1',
      file: file,
    };

    mockApiClient.post.mockResolvedValueOnce({ data: 'task-id-123' });

    const result = await createModel(mockPayload);

    expect(mockApiClient.post).toHaveBeenCalledWith('Tripo', expect.any(FormData), expect.any(Object));
    expect(result).toBe('task-id-123');
  });
});