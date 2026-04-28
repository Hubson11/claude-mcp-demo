import { render, screen, fireEvent } from '@testing-library/react'
import { NewCustomersTable } from './NewCustomersTable'
import type { CustomersData } from './NewCustomersTable'

// Companies are arranged so 'vcvxcsd' is alphabetically first and 'wqewf' is last
const customers: CustomersData[] = [
  { customer: 'Alice Adams', company: 'vh-llc',    phone: '100-0001', email: 'alice@example.com', country: 'USA',     status: 'active'   },
  { customer: 'Bob Brown',   company: 'vj-co',     phone: '100-0002', email: 'bob@example.com',   country: 'UK',      status: 'inactive' },
  { customer: 'C User',      company: 've-corp',   phone: '100-2222', email: 'c@example.com',     country: 'Canada',  status: 'active'   },
  { customer: 'D User',      company: 'vi-group',  phone: '100-0004', email: 'd@example.com',     country: 'Germany', status: 'inactive' },
  { customer: 'E User',      company: 'vf-inc',    phone: '100-0005', email: 'e@example.com',     country: 'France',  status: 'active'   },
  { customer: 'F User',      company: 'vk-intl',   phone: '100-0006', email: 'f@example.com',     country: 'Spain',   status: 'active'   },
  { customer: 'G User',      company: 'vg-ltd',    phone: '100-0007', email: 'g@example.com',     country: 'Italy',   status: 'active'   },
  { customer: 'H User',      company: 'vl-sa',     phone: '100-0008', email: 'h@example.com',     country: 'Japan',   status: 'active'   },
  { customer: 'I User',      company: 'vm-team',   phone: '100-0009', email: 'i@example.com',     country: 'India',   status: 'active'   },
  { customer: 'J User',      company: 'vn-works',  phone: '100-0010', email: 'j@example.com',     country: 'Brazil',  status: 'active'   },
  { customer: 'K User',      company: 'vcvxcsd',   phone: '100-0011', email: 'k@example.com',     country: 'Poland',  status: 'active'   },
  { customer: 'L User',      company: 'wqewf',     phone: '100-0012', email: 'l@example.com',     country: 'Mexico',  status: 'active'   },
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
