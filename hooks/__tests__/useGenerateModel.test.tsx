import { renderHook, act } from '@testing-library/react';
import { useGenerateModel } from '../useGenerateModel';
import * as ModelService from '@/app/services/ModelService';

jest.mock('@/app/services/ModelService');

describe('useGenerateModel Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('deve percorrer todo o fluxo de geração e rigging com sucesso (biped)', async () => {
    (ModelService.createModel as jest.Mock).mockResolvedValue({ data: { task_id: 'task-123' } });
    (ModelService.checkRiggModel as jest.Mock).mockResolvedValue({ data: { task_id: 'check-123' } });
    (ModelService.executeRiggModel as jest.Mock).mockResolvedValue({ data: { task_id: 'rig-123' } });

    (ModelService.getModelStatus as jest.Mock)
      .mockResolvedValueOnce({ data: { status: 'success', progress: 100, output: { model_url: 'base-url' } } })
      .mockResolvedValueOnce({ data: { status: 'success', output: { rig_type: 'biped' } } })
      .mockResolvedValueOnce({ data: { status: 'success', output: { model_url: 'final-rigged-url.glb' } } });

    const { result } = renderHook(() => useGenerateModel());
    const fakeImage = new File([''], 'test-image.png', { type: 'image/png' });

    let promise: Promise<void>;
    act(() => {
      promise = result.current.generate(fakeImage);
    });

    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await jest.advanceTimersByTimeAsync(5000);
      });
    }

    await act(async () => {
      await promise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.step).toBe('idle');
    expect(result.current.modelUrl).toContain('final-rigged-url.glb');
  }, 10000);

  it('deve retornar o modelo estático se o tipo de rig não for suportado', async () => {
    (ModelService.createModel as jest.Mock).mockResolvedValue({ data: { task_id: 'task-123' } });
    (ModelService.checkRiggModel as jest.Mock).mockResolvedValue({ data: { task_id: 'check-123' } });

    (ModelService.getModelStatus as jest.Mock)
      .mockResolvedValueOnce({ data: { status: 'success', output: { model_url: 'static-car-url.glb' } } })
      .mockResolvedValueOnce({ data: { status: 'success', output: { rig_type: 'vehicle' } } });

    const { result } = renderHook(() => useGenerateModel());
    const fakeImage = new File([''], 'car.png', { type: 'image/png' });

    let promise: Promise<void>;
    act(() => {
      promise = result.current.generate(fakeImage);
    });

    for (let i = 0; i < 2; i++) {
      await act(async () => {
        await jest.advanceTimersByTimeAsync(5000);
      });
    }

    await act(async () => {
      await promise;
    });

    expect(ModelService.executeRiggModel).not.toHaveBeenCalled();
    expect(result.current.modelUrl).toContain('static-car-url.glb');
  }, 10000);
});