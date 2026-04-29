import { render, screen, fireEvent } from '@testing-library/react'
import { NewCustomersTable } from './NewCustomersTable'
import { mockCustomers } from '../../assets/mock/customers'

describe('CustomersTable', () => {
  it('renders first 8 rows by default', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    expect(screen.getAllByTestId('customer-row')).toHaveLength(8)
  })

  it('shows 2nd page rows after navigating', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    fireEvent.click(screen.getByTestId('pagination-page-2'))
    expect(screen.getAllByTestId('customer-row')).toHaveLength(8)
  })

  it('filters rows by search value', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'jane' } })
    expect(screen.getAllByTestId('customer-row')).toHaveLength(1)
    expect(screen.getByText('Jane Cooper')).toBeInTheDocument()
  })

  it('search is case-insensitive', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'JANE' } })
    expect(screen.getAllByTestId('customer-row')).toHaveLength(1)
  })

  it('search filters by email', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'floyd@' } })
    expect(screen.getAllByTestId('customer-row')).toHaveLength(1)
    expect(screen.getByText('Floyd Miles')).toBeInTheDocument()
  })

  it('shows only active rows when filter toggled', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    expect(screen.queryByTestId('status-badge-inactive')).not.toBeInTheDocument()
  })

  it('shows all rows when filter toggled back', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    expect(screen.getAllByTestId('customer-row')).toHaveLength(8)
  })

  it('resets to page 1 when search changes', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    fireEvent.click(screen.getByTestId('pagination-page-2'))
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: '2222' } })
    expect(screen.getByTestId('pagination-page-1')).toHaveAttribute('aria-current', 'page')
  })

  it('sorts column ascending on first click', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    fireEvent.click(screen.getByTestId('th-company'))
    const rows = screen.getAllByTestId('customer-row')
    expect(rows[0].querySelector('td:nth-child(2)')?.textContent).toBe('Adobe')
  })

  it('sorts column descending on second click', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    fireEvent.click(screen.getByTestId('th-company'))
    fireEvent.click(screen.getByTestId('th-company'))
    const rows = screen.getAllByTestId('customer-row')
    expect(rows[0].querySelector('td:nth-child(2)')?.textContent).toBe('Zoom')
  })

  it('renders active and inactive status badges', () => {
    render(<NewCustomersTable customers={mockCustomers} />)
    expect(screen.getAllByTestId('status-badge-active').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('status-badge-inactive').length).toBeGreaterThan(0)
  })
})
