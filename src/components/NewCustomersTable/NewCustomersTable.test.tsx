import { render, screen, fireEvent } from '@testing-library/react'
import { NewCustomersTable } from './NewCustomersTable'
import type { CustomersData } from './NewCustomersTable'

const customers: CustomersData[] = [
  { customer: 'Alice Adams',  company: 'vcvxcsd', phone: '(111) 111-0001', email: 'alice@vcvxcsd.com', country: 'USA',       status: 'active'   },
  { customer: 'Bob Brown',    company: 'vd',      phone: '(222) 222-0002', email: 'bob@vd.com',        country: 'UK',        status: 'inactive' },
  { customer: 'Carol Clark',  company: 've',      phone: '(333) 333-0003', email: 'carol@ve.com',      country: 'Canada',    status: 'active'   },
  { customer: 'David Davis',  company: 'vf',      phone: '(444) 444-0004', email: 'david@vf.com',      country: 'Germany',   status: 'inactive' },
  { customer: 'Eva Evans',    company: 'vg',      phone: '(555) 555-0005', email: 'eva@vg.com',        country: 'France',    status: 'active'   },
  { customer: 'Frank Foster', company: 'vh',      phone: '(666) 666-0006', email: 'frank@vh.com',      country: 'Italy',     status: 'active'   },
  { customer: 'Grace Green',  company: 'vi',      phone: '(777) 777-0007', email: 'grace@vi.com',      country: 'Spain',     status: 'inactive' },
  { customer: 'Henry Harris', company: 'vj',      phone: '(888) 888-0008', email: 'henry@vj.com',      country: 'Japan',     status: 'active'   },
  { customer: 'Iris Irving',  company: 'vk',      phone: '(999) 999-0009', email: 'iris@vk.com',       country: 'Australia', status: 'active'   },
  { customer: 'Jack Johnson', company: 'vl',      phone: '(100) 100-0010', email: 'jack@vl.com',       country: 'Brazil',    status: 'inactive' },
  { customer: 'Kelly King',   company: 'vm',      phone: '(101) 101-0011', email: 'kelly@vm.com',      country: 'Mexico',    status: 'active'   },
  { customer: 'Liam Lee',     company: 'vn',      phone: '(102) 102-0012', email: 'liam@vn.com',       country: 'India',     status: 'active'   },
  { customer: 'Mia Moore',    company: 'vo',      phone: '(103) 103-0013', email: 'mia@vo.com',        country: 'China',     status: 'inactive' },
  { customer: 'Noah Nelson',  company: 'wp',      phone: '(104) 104-0014', email: 'noah@wp.com',       country: 'Nigeria',   status: 'active'   },
  { customer: 'Olivia Owen',  company: 'wqewf',   phone: '(105) 105-0015', email: 'olivia@wqewf.com',  country: 'Turkey',    status: 'inactive' },
]

describe('CustomersTable', () => {
  it('renders first 8 rows by default', () => {
    render(<NewCustomersTable customers={customers} />)
    expect(screen.getAllByTestId('customer-row')).toHaveLength(8)
  })

  it('shows 2nd page rows after navigating', () => {
    render(<NewCustomersTable customers={customers} />)
    fireEvent.click(screen.getByTestId('pagination-page-2'))
    expect(screen.getAllByTestId('customer-row')).toHaveLength(7)
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
