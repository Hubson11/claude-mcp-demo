// figma: https://www.figma.com/design/jQxGbsT4g3WZDPIfVXzZUx/CRM-Dashboard-Customers-List--Community-?node-id=501-3
import { useState, useMemo, useEffect } from 'react'
import styles from './CustomersTable.module.css'
import { CustomersTableToolbar } from '../CustomersTableToolbar'
import { CustomersTablePagination } from '../CustomersTablePagination'

export interface CustomersData {
  customer: string
  company: string
  phone: string
  email: string
  country: string
  status: 'active' | 'inactive'
}

interface Props {
  customers: CustomersData[]
}

type SortOption = 'newest' | 'oldest'
type FilterOption = 'all' | 'active'
type ColumnKey = keyof CustomersData
type SortDir = 'asc' | 'desc'

const ITEMS_PER_PAGE = 8

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: 'customer', label: 'Customer Name' },
  { key: 'company', label: 'Company' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'email', label: 'Email' },
  { key: 'country', label: 'Country' },
  { key: 'status', label: 'Status' },
]

const COL_CLASS: Record<ColumnKey, string> = {
  customer: styles.colCustomer,
  company: styles.colCompany,
  phone: styles.colPhone,
  email: styles.colEmail,
  country: styles.colCountry,
  status: styles.colStatus,
}

export function CustomersTable({ customers }: Props) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<ColumnKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  useEffect(() => { setCurrentPage(1) }, [search, filter, sort, sortColumn])

  const processed = useMemo(() => {
    let result = [...customers]

    if (filter === 'active') {
      result = result.filter(c => c.status === 'active')
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.customer.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      )
    }
    if (sortColumn) {
      result.sort((a, b) => {
        const cmp = a[sortColumn].localeCompare(b[sortColumn])
        return sortDir === 'asc' ? cmp : -cmp
      })
    } else if (sort === 'oldest') {
      result.reverse()
    }
    return result
  }, [customers, search, filter, sort, sortColumn, sortDir])

  const totalPages = Math.max(1, Math.ceil(processed.length / ITEMS_PER_PAGE))
  const rows = processed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  function handleColumnSort(col: ColumnKey) {
    if (sortColumn === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDir('asc')
    }
  }

  return (
    <div className={styles.card} data-testid="customers-table">
      <CustomersTableToolbar
        search={search} sort={sort} filter={filter}
        onSearchChange={setSearch} onSortChange={setSort} onFilterChange={setFilter}
      />
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={`${styles.th} ${COL_CLASS[col.key]}`}
                  onClick={() => handleColumnSort(col.key)}
                  data-testid={`th-${col.key}`}
                  aria-sort={sortColumn === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  {col.label}
                  {sortColumn === col.key && (
                    <span className={styles.sortIndicator} aria-hidden="true">
                      {sortDir === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className={styles.row} data-testid="customer-row">
                {(['customer', 'company', 'phone', 'email', 'country'] as ColumnKey[]).map(key => (
                  <td key={key} className={`${styles.td} ${COL_CLASS[key]}`}>
                    <span className={styles.cell} title={row[key]}>{row[key]}</span>
                  </td>
                ))}
                <td className={`${styles.td} ${styles.colStatus}`}>
                  <span
                    className={row.status === 'active' ? styles.badgeActive : styles.badgeInactive}
                    data-testid={`status-badge-${row.status}`}
                  >
                    {row.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.paginationRow}>
        <CustomersTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={processed.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
