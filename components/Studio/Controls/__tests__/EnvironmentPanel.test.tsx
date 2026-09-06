import { render, screen } from '@testing-library/react';
import { EnvironmentPanel } from '../EnvironmentPanel';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, priority, ...props }: any) => <img {...props} />
}));

describe('EnvironmentPanel Component', () => {
  it('deve renderizar o título principal e a biografia corretamente', () => {
    render(<EnvironmentPanel />);

    const title = screen.getByRole('heading', { name: /Neuro Mesh Studio/i });
    expect(title).toBeInTheDocument();

    const bioText = screen.getByText(/Bem-vindo ao Studio/i);
    expect(bioText).toBeInTheDocument();
  });
});