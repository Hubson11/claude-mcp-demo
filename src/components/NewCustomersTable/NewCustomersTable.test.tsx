import { render, screen, fireEvent } from '@testing-library/react'
import { NewCustomersTable } from './NewCustomersTable'
import type { CustomersData } from './NewCustomersTable'

const customers: CustomersData[] = [
  { customer: 'Alice Adams',  company: 'Alpha',   phone: '(111) 111-0001', email: 'alice@alpha.com',  country: 'USA',       status: 'active' },
  { customer: 'Bob Brown',    company: 'Beta',    phone: '(222) 222-0002', email: 'bob@beta.com',    country: 'UK',        status: 'inactive' },
  { customer: 'Carol Clark',  company: 'Gamma',   phone: '(333) 333-0003', email: 'carol@gamma.com', country: 'Canada',    status: 'active' },
  { customer: 'David Davis',  company: 'Delta',   phone: '(444) 444-0004', email: 'david@delta.com', country: 'Germany',   status: 'inactive' },
  { customer: 'Eva Evans',    company: 'Epsilon', phone: '(555) 555-0005', email: 'eva@eps.com',     country: 'France',    status: 'active' },
  { customer: 'Frank Foster', company: 'Zeta',    phone: '(666) 666-0006', email: 'frank@zeta.com',  country: 'Italy',     status: 'active' },
  { customer: 'Grace Green',  company: 'Eta',     phone: '(777) 777-0007', email: 'grace@eta.com',   country: 'Spain',     status: 'inactive' },
  { customer: 'Henry Harris', company: 'Theta',   phone: '(888) 888-0008', email: 'henry@theta.com', country: 'Japan',     status: 'active' },
  { customer: 'Iris Irving',  company: 'Iota',    phone: '(999) 999-0009', email: 'iris@iota.com',   country: 'Australia', status: 'active' },
  { customer: 'Jack Johnson', company: 'Kappa',   phone: '(100) 100-0010', email: 'jack@kappa.com',  country: 'Brazil',    status: 'inactive' },
]

describe('CustomersTable', () => {
  it('renders first 8 rows by default', () => {
    render(<NewCustomersTable customers={customers} />)
    expect(screen.getAllByTestId('customer-row')).toHaveLength(8)
  })

  it('shows 2nd page rows after navigating', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('pagination-page-2'))
    expect(screen.getAllByTestId('customer-row')).toHaveLength(2)
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
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: '@beta' } })
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
    expect(screen.getAllByTestId('customer-row')).toHaveLength(8)
  })

  it('resets to page 1 when search changes', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('pagination-page-2'))
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: '1231' } })
    expect(screen.getByTestId('pagination-page-1')).toHaveAttribute('aria-current', 'page')
  })

  it('sorts column ascending on first click', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('th-company'))
    const rows = screen.getAllByTestId('customer-row')
    expect(rows[0].querySelector('td:nth-child(2)')?.textContent).toBe('Alpha')
  })

  it('sorts column descending on second click', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('th-company'))
    fireEvent.click(screen.getByTestId('th-company'))
    const rows = screen.getAllByTestId('customer-row')
    expect(rows[0].querySelector('td:nth-child(2)')?.textContent).toBe('Zeta')
  })

  it('renders active and inactive status badges', () => {
    render(<NewCustomersTable customers={customers} />)
    expect(screen.getAllByTestId('status-badge-active').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('status-badge-inactive').length).toBeGreaterThan(0)
  })
})
