import { render, screen, fireEvent } from '@testing-library/react'
import { CustomersTable } from './CustomersTable'
import type { CustomersData } from './CustomersTable'

describe('CustomersTable', () => {
  it('renders first 8 rows by default', () => {
    render(<CustomersTable customers={customers} />)
    expect(screen.getAllByTestId('customer-row')).toHaveLength(8)
  })

  it('shows 2nd page rows after navigating', () => {
    render(<CustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('pagination-page-2'))
    expect(screen.getAllByTestId('customer-row')).toHaveLength(2)
  })

  it('filters rows by search value', () => {
    render(<CustomersTable customers={customers} />)
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'Alice' } })
    expect(screen.getAllByTestId('customer-row')).toHaveLength(1)
    expect(screen.getByText('Alice Adams')).toBeInTheDocument()
  })

  it('search is case-insensitive', () => {
    render(<CustomersTable customers={customers} />)
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'alice' } })
    expect(screen.getAllByTestId('customer-row')).toHaveLength(1)
  })

  it('search filters by email', () => {
    render(<CustomersTable customers={customers} />)
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'bob@beta' } })
    expect(screen.getAllByTestId('customer-row')).toHaveLength(1)
    expect(screen.getByText('Bob Brown')).toBeInTheDocument()
  })

  it('shows only active rows when filter toggled', () => {
    render(<CustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    expect(screen.queryByTestId('status-badge-inactive')).not.toBeInTheDocument()
  })

  it('shows all rows when filter toggled back', () => {
    render(<CustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    expect(screen.getAllByTestId('customer-row')).toHaveLength(8)
  })

  it('resets to page 1 when search changes', () => {
    render(<CustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('pagination-page-2'))
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'a' } })
    expect(screen.getByTestId('pagination-page-1')).toHaveAttribute('aria-current', 'page')
  })

  it('sorts column ascending on first click', () => {
    render(<CustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('th-company'))
    const rows = screen.getAllByTestId('customer-row')
    expect(rows[0].querySelector('td:nth-child(2)')?.textContent).toBe('Alpha')
  })

  it('sorts column descending on second click', () => {
    render(<CustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('th-company'))
    fireEvent.click(screen.getByTestId('th-company'))
    const rows = screen.getAllByTestId('customer-row')
    expect(rows[0].querySelector('td:nth-child(2)')?.textContent).toBe('Zeta')
  })

  it('renders active and inactive status badges', () => {
    render(<CustomersTable customers={customers} />)
    expect(screen.getAllByTestId('status-badge-active').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('status-badge-inactive').length).toBeGreaterThan(0)
  })
})
