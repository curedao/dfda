import { render, screen, waitFor } from '@testing-library/react';
import { UserVariableCharts } from './page';
import { UserVariable } from '@/types/models/UserVariable';

// Mock the fetch request
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockUserVariable),
  })
) as jest.Mock;

const mockUserVariable: UserVariable = {
  id: 1,
  name: 'Test Variable',
  charts: {
    lineChartWithSmoothing: {
      highchartConfig: {} // Mock config
    },
    // Mock other chart types...
  }
  // Mock other fields...
};

describe('UserVariableCharts', () => {
  it('renders charts successfully', async () => {
    render(<UserVariableCharts variableId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Variable')).toBeInTheDocument();
      // Assert other chart elements are rendered
    });
  });

  it('handles loading state', () => {
    render(<UserVariableCharts variableId={1} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument(); 
  });

  it('handles error state', async () => {
    // Mock fetch error
    global.fetch.mockImplementationOnce(() => Promise.reject('API is down'));

    render(<UserVariableCharts variableId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error fetching data')).toBeInTheDocument();
    });
  });
});