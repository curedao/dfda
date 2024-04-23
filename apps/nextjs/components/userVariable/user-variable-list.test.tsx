import { render, screen, waitFor } from '@testing-library/react';
import { UserVariableList } from './user-variable-list'; 
import { UserVariable } from '@/types/models/UserVariable';

// Mock fetch request
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockUserVariables),
  })
) as jest.Mock;

const mockUserVariables: UserVariable[] = [
  {
    id: 1,
    name: 'Variable 1',
    // Mock other fields...
  },
  {
    id: 2, 
    name: 'Variable 2',
    // Mock other fields...  
  },
];

describe('UserVariableList', () => {
  it('fetches and renders user variables', async () => {
    render(<UserVariableList user={{ id: '1' }} searchParams={{}} />);
      
    await waitFor(() => {
      expect(screen.getByText('Variable 1')).toBeInTheDocument();
      expect(screen.getByText('Variable 2')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    render(<UserVariableList user={{ id: '1' }} searchParams={{}} />);
      
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles empty variables', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    );
      
    render(<UserVariableList user={{ id: '1' }} searchParams={{}} />);
      
    await waitFor(() => {
      expect(screen.getByText('Get Started!')).toBeInTheDocument();
    });
  });

  it('handles fetch errors', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject('API is down'));
      
    render(<UserVariableList user={{ id: '1' }} searchParams={{}} />);
      
    await waitFor(() => {
      expect(screen.getByText('Error fetching user variables')).toBeInTheDocument();  
    });
  });
});