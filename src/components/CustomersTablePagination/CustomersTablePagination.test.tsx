import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { CustomersTablePagination } from './CustomersTablePagination'

describe('CustomersTablePagination', () => {
  const base = {
    currentPage: 1, totalPages: 5, totalItems: 40, itemsPerPage: 8, onPageChange: vi.fn(),
  }

  it('shows range for first page', () => {
    render(<CustomersTablePagination {...base} />)
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('Showing data 1 to 8 of 40 entries')
  })

  it('shows correct range for middle page', () => {
    render(<CustomersTablePagination {...base} currentPage={3} />)
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('Showing data 17 to 24 of 40 entries')
  })

  it('shows correct range for last page', () => {
    render(<CustomersTablePagination {...base} currentPage={5} />)
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('Showing data 33 to 40 of 40 entries')
  })

  it('calls onPageChange with next page number', () => {
    const onPageChange = vi.fn()
    render(<CustomersTablePagination {...base} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByTestId('pagination-next'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with prev page number', () => {
    const onPageChange = vi.fn()
    render(<CustomersTablePagination {...base} currentPage={3} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByTestId('pagination-prev'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange when clicking a page number', () => {
    const onPageChange = vi.fn()
    render(<CustomersTablePagination {...base} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByTestId('pagination-page-3'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('disables prev on first page', () => {
    render(<CustomersTablePagination {...base} />)
    expect(screen.getByTestId('pagination-prev')).toBeDisabled()
  })

  it('disables next on last page', () => {
    render(<CustomersTablePagination {...base} currentPage={5} />)
    expect(screen.getByTestId('pagination-next')).toBeDisabled()
  })

  it('marks current page with aria-current', () => {
    render(<CustomersTablePagination {...base} currentPage={3} />)
    expect(screen.getByTestId('pagination-page-3')).toHaveAttribute('aria-current', 'page')
  })

  it('shows ellipsis and last page for large page sets', () => {
    render(<CustomersTablePagination {...base} totalPages={42} totalItems={336} currentPage={1} />)
    expect(screen.getByText('...')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-page-42')).toBeInTheDocument()
  })

  it('shows window of 3 pages around current for large sets', () => {
    render(<CustomersTablePagination {...base} totalPages={42} totalItems={336} currentPage={20} />)
    expect(screen.getByTestId('pagination-page-19')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-page-20')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-page-21')).toBeInTheDocument()
  })
})
