import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalVariableAddButton } from './global-variable-add-button';

const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
};
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

describe('GlobalVariableAddButton', () => {
  test('opens confirmation dialog on click', () => {
    render(<GlobalVariableAddButton />);

    fireEvent.click(screen.getByText('New variable'));

    expect(screen.getByText(/Are you sure you want to create a new variable?/i)).toBeInTheDocument();
  });

  test('creates new variable on confirmation', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: 'var123' }),
    });

    render(<GlobalVariableAddButton />);

    fireEvent.click(screen.getByText('New variable'));
    fireEvent.click(screen.getByText('Add globalVariable'));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/globalVariables',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'New Variable' }),
      })
    ));

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/globalVariables/var123/settings');
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  // Add more test cases
});