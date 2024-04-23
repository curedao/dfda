import { render, screen, waitFor } from '@testing-library/react'; 
import { UserVariableCharts } from './user-variable-charts';
import { UserVariable } from '@/types/models/UserVariable';

// Mock fetch
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
  it('fetches data and renders charts', async () => {
    render(<UserVariableCharts variableId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Test Variable')).toBeInTheDocument();
      // Assert chart elements are rendered  
    });
  });

  it('shows loading spinner', () => {
    render(<UserVariableCharts variableId={1} />);
      
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles fetch errors', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject('API is down'));
      
    render(<UserVariableCharts variableId={1} />);
      
    await waitFor(() => {
      expect(screen.getByText('Error fetching user variables')).toBeInTheDocument();
    });
  });  
});