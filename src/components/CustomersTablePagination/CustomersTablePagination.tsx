// figma: https://www.figma.com/design/jQxGbsT4g3WZDPIfVXzZUx/CRM-Dashboard-Customers-List--Community-?node-id=501-3
import styles from './CustomersTablePagination.module.css'

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const rangeStart = Math.max(2, currentPage - 1)
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1)
  const result: (number | '...')[] = [1]
  if (rangeStart > 2) result.push('...')
  for (let i = rangeStart; i <= rangeEnd; i++) result.push(i)
  if (rangeEnd < totalPages - 1) result.push('...')
  result.push(totalPages)
  return result
}

export function CustomersTablePagination({
  currentPage, totalPages, totalItems, itemsPerPage, onPageChange,
}: Props) {
  const from = (currentPage - 1) * itemsPerPage + 1
  const to = Math.min(currentPage * itemsPerPage, totalItems)
  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <div className={styles.root} data-testid="pagination">
      <p className={styles.info} data-testid="pagination-info">
        Showing data {from} to {to} of {totalItems} entries
      </p>
      <div className={styles.controls}>
        <button className={styles.btn} onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1} data-testid="pagination-prev" aria-label="Previous page">
          {'<'}
        </button>
        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`dots-${idx}`} className={styles.ellipsis}>...</span>
          ) : (
            <button
              key={page}
              className={page === currentPage ? styles.btnActive : styles.btn}
              onClick={() => onPageChange(page as number)}
              data-testid={`pagination-page-${page}`}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
        <button className={styles.btn} onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages} data-testid="pagination-next" aria-label="Next page">
          {'>'}
        </button>
      </div>
    </div>
  )
}
