import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CustomersTable } from './CustomersTable';
import { MOCK_CUSTOMERS } from './mockData';

function renderTable(searchValue = '', onSearchChange = vi.fn()) {
  return render(
    <CustomersTable searchValue={searchValue} onSearchChange={onSearchChange} />
  );
}

describe('CustomersTable', () => {
  it('renders 8 rows by default (first page)', () => {
    renderTable();
    const tbody = screen.getByTestId('customers-table-body');
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(8);
  });

  it('renders "Showing data 1 to 8 of 20 entries" on first page', () => {
    renderTable();
    expect(screen.getByTestId('showing-info')).toHaveTextContent(
      'Showing data 1 to 8 of 20 entries'
    );
  });

  it('filtering by searchValue "Jane" shows only Jane Cooper row', () => {
    renderTable('Jane');
    const tbody = screen.getByTestId('customers-table-body');
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('Jane Cooper');
  });

  it('filtering by searchValue "yahoo" (case-insensitive) shows Floyd Miles and Jacob Jones', () => {
    renderTable('yahoo');
    const tbody = screen.getByTestId('customers-table-body');
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(2);
    const text = rows.map((r) => r.textContent).join(' ');
    expect(text).toContain('Floyd Miles');
    expect(text).toContain('Jacob Jones');
  });

  it('filtering by empty string shows all rows (8 per page)', () => {
    renderTable('');
    const tbody = screen.getByTestId('customers-table-body');
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(8);
    expect(screen.getByTestId('showing-info')).toHaveTextContent(
      `of ${MOCK_CUSTOMERS.length} entries`
    );
  });

  it('status badge shows "Active" with correct test id for active customer', () => {
    renderTable();
    // Jane Cooper is row-0 and is active (first in newest sort)
    const badge = screen.getByTestId('customer-status-0');
    expect(badge).toHaveTextContent('Active');
  });

  it('status badge shows "Inactive" with correct test id for inactive customer', () => {
    renderTable();
    // Floyd Miles is row-1 and is inactive
    const badge = screen.getByTestId('customer-status-1');
    expect(badge).toHaveTextContent('Inactive');
  });

  it('clicking page 2 shows rows 9-16', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(screen.getByTestId('page-btn-2'));
    const tbody = screen.getByTestId('customers-table-body');
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(8);
  });

  it('"Showing data 9 to 16 of 20 entries" on page 2', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(screen.getByTestId('page-btn-2'));
    expect(screen.getByTestId('showing-info')).toHaveTextContent(
      'Showing data 9 to 16 of 20 entries'
    );
  });

  it('page 1 button is present', () => {
    renderTable();
    expect(screen.getByTestId('page-btn-1')).toBeInTheDocument();
  });

  it('prev button is disabled on page 1', () => {
    renderTable();
    const prevBtn = screen.getByTestId('page-prev');
    expect(prevBtn).toBeDisabled();
  });

  it('when passed onSearchChange, typing in table search calls onSearchChange', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    renderTable('', onSearchChange);
    const input = screen.getByTestId('table-search');
    await user.type(input, 'J');
    expect(onSearchChange).toHaveBeenCalledWith('J');
  });
});
