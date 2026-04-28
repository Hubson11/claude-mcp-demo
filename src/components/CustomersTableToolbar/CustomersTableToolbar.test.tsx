import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { CustomersTableToolbar } from './CustomersTableToolbar'

describe('CustomersTableToolbar', () => {
  const base = {
    search: '', sort: 'newest' as const, filter: 'all' as const,
    onSearchChange: vi.fn(), onSortChange: vi.fn(), onFilterChange: vi.fn(),
  }

  it('renders title', () => {
    render(<CustomersTableToolbar {...base} />)
    expect(screen.getByTestId('toolbar-title')).toHaveTextContent('All Customers')
  })

  it('calls onSearchChange when typing', () => {
    const onSearchChange = vi.fn()
    render(<CustomersTableToolbar {...base} onSearchChange={onSearchChange} />)
    fireEvent.change(screen.getByTestId('toolbar-search'), { target: { value: 'Jane' } })
    expect(onSearchChange).toHaveBeenCalledWith('Jane')
  })

  it('calls onFilterChange toggling filter to active', () => {
    const onFilterChange = vi.fn()
    render(<CustomersTableToolbar {...base} onFilterChange={onFilterChange} />)
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    expect(onFilterChange).toHaveBeenCalledWith('active')
  })

  it('calls onFilterChange toggling filter back to all', () => {
    const onFilterChange = vi.fn()
    render(<CustomersTableToolbar {...base} filter="active" onFilterChange={onFilterChange} />)
    fireEvent.click(screen.getByTestId('toolbar-filter-toggle'))
    expect(onFilterChange).toHaveBeenCalledWith('all')
  })

  it('calls onSortChange when selecting oldest', () => {
    const onSortChange = vi.fn()
    render(<CustomersTableToolbar {...base} onSortChange={onSortChange} />)
    fireEvent.change(screen.getByTestId('toolbar-sort'), { target: { value: 'oldest' } })
    expect(onSortChange).toHaveBeenCalledWith('oldest')
  })

  it('shows aria-pressed=true when filter is active', () => {
    render(<CustomersTableToolbar {...base} filter="active" />)
    expect(screen.getByTestId('toolbar-filter-toggle')).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows aria-pressed=false when filter is all', () => {
    render(<CustomersTableToolbar {...base} filter="all" />)
    expect(screen.getByTestId('toolbar-filter-toggle')).toHaveAttribute('aria-pressed', 'false')
  })
})
