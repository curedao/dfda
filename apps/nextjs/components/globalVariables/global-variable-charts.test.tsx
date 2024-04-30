import { render, screen, waitFor } from '@testing-library/react';
import { GlobalVariableCharts } from './global-variable-charts';

describe('GlobalVariableCharts', () => {
  test('renders loading spinner while fetching data', () => {
    render(<GlobalVariableCharts variableId={123} />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders charts with fetched data', async () => {
    const mockGlobalVariable = {
      name: 'Test Variable',
      description: 'This is a test',
      charts: {
        // Mock chart data  
      },
    };
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([mockGlobalVariable]),
    });

    render(<GlobalVariableCharts variableId={123} />);

    await waitFor(() => expect(screen.getByText('Test Variable')).toBeInTheDocument());
    
    // Assert that chart components are rendered with expected props
    expect(screen.getAllByRole('img', { name: /highcharts/i })).toHaveLength(3);
  });

  test('renders error message on fetch failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    render(<GlobalVariableCharts variableId={123} />);

    await waitFor(() => expect(screen.getByText(/no data found/i)).toBeInTheDocument());
  });
});