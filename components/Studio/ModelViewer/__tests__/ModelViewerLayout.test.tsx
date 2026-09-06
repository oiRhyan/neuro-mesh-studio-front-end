import { render, screen, fireEvent } from '@testing-library/react';
import { ModelViewerLayout } from '../ModelViewerLayout';

jest.mock('../../Controls/EnvironmentPanel', () => ({
  EnvironmentPanel: () => <div data-testid="environment-panel" />
}));

jest.mock('../../Controls/GenerationPanel', () => ({
  GenerationPanel: ({ onGenerate, loading }: any) => (
    <button 
      data-testid="generation-panel" 
      disabled={loading} 
      onClick={() => onGenerate(new File([''], 'test.png', { type: 'image/png' }))}
    >
      Generate
    </button>
  )
}));

jest.mock('../../ModelList', () => ({
  ModelList: ({ onSelectModel }: any) => (
    <button 
      data-testid="model-list" 
      onClick={() => onSelectModel('http://test-url.glb', 'model-123')}
    >
      Select Model
    </button>
  )
}));

jest.mock('../LoadingModel/LoadingModel', () => ({
  LoadingModel: () => <div data-testid="loading-model" />
}));

jest.mock('../ModelToolbar', () => ({
  ModelToolbar: ({ onModelSaved }: any) => (
    <button 
      data-testid="model-toolbar" 
      onClick={() => onModelSaved('new-model-id')}
    >
      Save Model
    </button>
  )
}));

jest.mock('../ViewerCanvas', () => ({
  ViewerCanvas: () => <div data-testid="viewer-canvas" />
}));

describe('ModelViewerLayout Component', () => {
  const defaultProps = {
    onGenerate: jest.fn(),
    loading: false,
    progress: 0,
    step: 'idle' as const,
    onSelectModel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar todos os subcomponentes corretamente', () => {
    render(<ModelViewerLayout {...defaultProps} />);

    expect(screen.getByTestId('viewer-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('model-list')).toBeInTheDocument();
    expect(screen.getByTestId('generation-panel')).toBeInTheDocument();
    expect(screen.getByTestId('loading-model')).toBeInTheDocument();
    expect(screen.getByTestId('environment-panel')).toBeInTheDocument();
    expect(screen.getByTestId('model-toolbar')).toBeInTheDocument();
  });

  it('deve atualizar o estado e chamar onGenerate ao gerar um modelo', () => {
    render(<ModelViewerLayout {...defaultProps} />);

    const generationButton = screen.getByTestId('generation-panel');
    fireEvent.click(generationButton);

    expect(defaultProps.onSelectModel).toHaveBeenCalledWith('', '');
    expect(defaultProps.onGenerate).toHaveBeenCalledTimes(1);
  });

  it('deve atualizar o modelo selecionado ao escolher um modelo da lista', () => {
    render(<ModelViewerLayout {...defaultProps} />);

    const modelListButton = screen.getByTestId('model-list');
    fireEvent.click(modelListButton);

    expect(defaultProps.onSelectModel).toHaveBeenCalledWith('http://test-url.glb', 'model-123');
  });

  it('deve atualizar o ID do modelo e chamar onSelectModel ao salvar o modelo na toolbar', () => {
    const modelUrl = 'http://current-url.glb';
    render(<ModelViewerLayout {...defaultProps} modelUrl={modelUrl} />);

    const toolbarButton = screen.getByTestId('model-toolbar');
    fireEvent.click(toolbarButton);

    expect(defaultProps.onSelectModel).toHaveBeenCalledWith(modelUrl, 'new-model-id');
  });
});