import { render, screen, fireEvent } from '@testing-library/react'
import { NewCustomersTable } from './NewCustomersTable'

describe('CustomersTable', () => {
  it('renders first 8 rows by default', () => {
    render(<NewCustomersTable customers={customers} />)
    expect(screen.getAllByTestId('customer-row')).toHaveLength(2)
  })

  it('shows 2nd page rows after navigating', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('pagination-page-2'))
    expect(screen.getAllByTestId('customer-row')).toHaveLength(4)
  })

  it('filters rows by search value', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'Alice' } })
    expect(screen.getAllByTestId('customer-row')).toHaveLength(1)
    expect(screen.getByText('Alice Adams')).toBeInTheDocument()
  })

  it('search is case-insensitive', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'ALICE' } })
    expect(screen.getAllByTestId('customer-row')).toHaveLength(1)
  })

  it('search filters by email', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'bob' } })
    expect(screen.getAllByTestId('customer-row')).toHaveLength(1)
    expect(screen.getByText('Bob Brown')).toBeInTheDocument()
  })

  it('shows only active rows when filter toggled', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    expect(screen.queryByTestId('status-badge-inactive')).not.toBeInTheDocument()
  })

  it('shows all rows when filter toggled back', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    expect(screen.getAllByTestId('customer-row')).toHaveLength(122)
  })

  it('resets to page 1 when search changes', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('pagination-page-2'))
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: '2222' } })
    expect(screen.getByTestId('pagination-page-10')).toHaveAttribute('aria-current', 'page')
page-10')).toHaveAttribute('aria-current', 'page')
  })

  it('sorts column ascending on first click', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('th-company'))
    const rows = screen.getAllByTestId('customer-row')
    expect(rows[0].querySelector('td:nth-child(2)')?.textContent).toBe('vcvxcsd')
  })

  it('sorts column descending on second click', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('th-company'))
    fireEvent.click(screen.getByTestId('th-company'))
    const rows = screen.getAllByTestId('customer-row')
    expect(rows[0].querySelector('td:nth-child(2)')?.textContent).toBe('wqewf')
  })

  it('renders active and inactive status badges', () => {
    render(<NewCustomersTable customers={customers} />)
    expect(screen.getAllByTestId('status-badge-active').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('status-badge-inactive').length).toBeGreaterThan(0)
  })
})
