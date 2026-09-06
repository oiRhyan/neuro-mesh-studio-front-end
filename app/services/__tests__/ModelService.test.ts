import { createModel } from '../ModelService';
import { tripoApi } from '@/app/core/api';

jest.mock('@/app/core/api', () => ({
  tripoApi: {
    post: jest.fn(),
  },
}));

describe('ModelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve enviar um FormData com os dados corretos ao criar o modelo', async () => {
    const fakeFile = new File([''], 'image.png', { type: 'image/png' });
    const mockPayload = {
      type: 'image_to_model',
      model_version: 'v3.0-20250812',
      file: fakeFile,
    };

    (tripoApi.post as jest.Mock).mockResolvedValueOnce({ data: 'task-123' });

    const result = await createModel(mockPayload);

    expect(tripoApi.post).toHaveBeenCalledWith('Tripo', expect.any(FormData));
    expect(result).toBe('task-123');
  });
});