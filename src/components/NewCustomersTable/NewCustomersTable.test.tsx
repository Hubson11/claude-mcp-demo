import { render, screen, fireEvent } from '@testing-library/react'
import { NewCustomersTable } from './NewCustomersTable'
import type { CustomersData } from './NewCustomersTable'

const customers: CustomersData[] = [
  { customer: 'Alice Adams', company: 'vd',      phone: '555-0001', email: 'alice@example.com', country: 'USA',       status: 'active'   },
  { customer: 'Bob Brown',   company: 've',      phone: '555-0002', email: 'bob@example.com',   country: 'UK',        status: 'inactive' },
  { customer: 'Carol Chen',  company: 'vcvxcsd', phone: '555-0003', email: 'carol@example.com', country: 'Canada',    status: 'active'   },
  { customer: 'Dave Davis',  company: 'vf',      phone: '555-0004', email: 'dave@example.com',  country: 'Australia', status: 'inactive' },
  { customer: 'Eve Evans',   company: 'vg',      phone: '555-0005', email: 'eve@example.com',   country: 'Germany',   status: 'active'   },
  { customer: 'Frank Fox',   company: 'wqewf',   phone: '555-0006', email: 'frank@example.com', country: 'France',    status: 'active'   },
  { customer: 'Grace Green', company: 'vh',      phone: '555-0007', email: 'grace@example.com', country: 'Italy',     status: 'active'   },
  { customer: 'Henry Hill',  company: 'vi',      phone: '555-0008', email: 'henry@example.com', country: 'Spain',     status: 'active'   },
  { customer: 'Irene Ivy',   company: 'wn',      phone: '555-0009', email: 'irene@example.com', country: 'Mexico',    status: 'active'   },
  { customer: 'Jack Jones',  company: 'wp',      phone: '555-0010', email: 'jack@example.com',  country: 'Brazil',    status: 'inactive' },
  { customer: 'Kate Kim',    company: 'wqe',     phone: '555-0011', email: 'kate@example.com',  country: 'Japan',     status: 'active'   },
  { customer: 'Liam Lee',    company: 'vcvxe',   phone: '555-0012', email: 'liam@example.com',  country: 'China',     status: 'active'   },
]

describe('CustomersTable', () => {
  it('renders first 8 rows by default', () => {
    render(<NewCustomersTable customers={customers} />)
    expect(screen.getAllByTestId('customer-row')).toHaveLength(8)
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
    expect(screen.getAllByTestId('customer-row')).toHaveLength(8)
  })

  it('resets to page 1 when search changes', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('pagination-page-2'))
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: '2222' } })
    expect(screen.getByTestId('pagination-page-1')).toHaveAttribute('aria-current', 'page')
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
