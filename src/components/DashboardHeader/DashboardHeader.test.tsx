import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardHeader } from './DashboardHeader';

describe('DashboardHeader', () => {
  it('renders greeting with provided name', () => {
    render(
      <DashboardHeader name="Evano" searchValue="" onSearchChange={() => {}} />
    );
    expect(screen.getByTestId('header-greeting').textContent).toContain('Evano');
  });

  it('renders search input with provided searchValue', () => {
    render(
      <DashboardHeader name="Evano" searchValue="hello" onSearchChange={() => {}} />
    );
    expect((screen.getByTestId('header-search') as HTMLInputElement).value).toBe('hello');
  });

  it('calls onSearchChange when user types in search', async () => {
    const onSearchChange = vi.fn();
    render(
      <DashboardHeader name="Evano" searchValue="" onSearchChange={onSearchChange} />
    );
    await userEvent.type(screen.getByTestId('header-search'), 'Jane');
    expect(onSearchChange).toHaveBeenCalled();
  });

  it('search input has correct data-testid', () => {
    render(
      <DashboardHeader name="Evano" searchValue="" onSearchChange={() => {}} />
    );
    expect(screen.getByTestId('header-search')).toBeInTheDocument();
  });
});
