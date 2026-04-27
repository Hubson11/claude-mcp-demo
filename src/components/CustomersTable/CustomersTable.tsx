// figma: https://www.figma.com/design/Xzztnkpd7O7kJmsoUYnQgu?node-id=501-3
import { useState, useMemo } from 'react';
import { MOCK_CUSTOMERS } from './mockData';
import styles from './CustomersTable.module.css';

const ROWS_PER_PAGE = 8;

interface CustomersTableProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 1) return [1];

  const pages: (number | '...')[] = [];

  // Always include page 1
  pages.push(1);

  // Window of 4 pages around current
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 2);

  if (windowStart > 2) pages.push('...');

  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  if (windowEnd < total - 1) pages.push('...');

  // Always include last page
  if (total > 1) pages.push(total);

  return pages;
}

export function CustomersTable({ searchValue, onSearchChange }: CustomersTableProps) {
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return MOCK_CUSTOMERS;
    return MOCK_CUSTOMERS.filter((row) =>
      [row.customer, row.company, row.phone, row.email, row.country, row.status].some((val) =>
        val.toLowerCase().includes(q)
      )
    );
  }, [searchValue]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const diff = a.createdAt.localeCompare(b.createdAt);
      return sort === 'newest' ? -diff : diff;
    });
  }, [filtered, sort]);

  const totalRows = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const pageStart = (safePage - 1) * ROWS_PER_PAGE;
  const pageEnd = Math.min(safePage * ROWS_PER_PAGE, totalRows);
  const pageRows = sorted.slice(pageStart, pageEnd);

  const showingFrom = totalRows === 0 ? 0 : pageStart + 1;
  const showingTo = pageEnd;

  function handleSearchChange(v: string) {
    onSearchChange(v);
    setPage(1);
  }

  function handleSortToggle() {
    setSort((s) => (s === 'newest' ? 'oldest' : 'newest'));
    setPage(1);
  }

  function handlePageChange(p: number) {
    setPage(p);
  }

  const pageNumbers = buildPageNumbers(safePage, totalPages);

  return (
    <div className={styles.container} data-testid="customers-table">
      {/* Card header */}
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>All Customers</h2>
          <span className={styles.subtitle}>Active Members</span>
        </div>

        <div className={styles.controls}>
          {/* Search */}
          <label htmlFor="table-search-input" className={styles.srOnly}>
            Search customers
          </label>
          <div className={styles.searchWrapper}>
            <svg
              className={styles.searchIcon}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="#b5b7c0" strokeWidth="1.5" />
              <path d="M16.5 16.5L21 21" stroke="#b5b7c0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              id="table-search-input"
              className={styles.searchInput}
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              data-testid="table-search"
            />
          </div>

          {/* Sort */}
          <button
            className={styles.sortButton}
            onClick={handleSortToggle}
            aria-label="Sort customers"
            data-testid="table-sort"
          >
            <span className={styles.sortLabel}>
              Sort by :{' '}
              <span className={styles.sortValue}>{sort === 'newest' ? 'Newest' : 'Oldest'}</span>
            </span>
            <svg
              className={styles.chevronIcon}
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="#7e7e7e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Customers table</caption>
          <thead>
            <tr className={styles.headerRow}>
              <th scope="col" className={styles.th} style={{ width: '17%' }}>Customer Name</th>
              <th scope="col" className={styles.th} style={{ width: '13%' }}>Company</th>
              <th scope="col" className={styles.th} style={{ width: '14%' }}>Phone Number</th>
              <th scope="col" className={styles.th} style={{ width: '20%' }}>Email</th>
              <th scope="col" className={styles.th} style={{ width: '14%' }}>Country</th>
              <th scope="col" className={styles.th} style={{ width: '12%' }}>Status</th>
            </tr>
          </thead>
          <tbody data-testid="customers-table-body">
            {pageRows.map((row, index) => (
              <tr key={row.email} className={styles.dataRow} data-testid={`customer-row-${index}`}>
                <td className={styles.td} title={row.customer}>{row.customer}</td>
                <td className={styles.td} title={row.company}>{row.company}</td>
                <td className={styles.td} title={row.phone}>{row.phone}</td>
                <td className={styles.td} title={row.email}>{row.email}</td>
                <td className={styles.td} title={row.country}>{row.country}</td>
                <td className={styles.td}>
                  <span
                    className={`${styles.badge} ${row.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}
                    data-testid={`customer-status-${index}`}
                  >
                    {row.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.paginationRow} data-testid="pagination">
        <span className={styles.showingInfo} data-testid="showing-info">
          {`Showing data ${showingFrom} to ${showingTo} of ${totalRows} entries`}
        </span>

        <div className={styles.pageButtons}>
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage <= 1}
            aria-label="Previous page"
            aria-disabled={safePage <= 1}
            data-testid="page-prev"
          >
            {'<'}
          </button>

          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className={styles.ellipsis}>...</span>
            ) : (
              <button
                key={p}
                className={`${styles.pageBtn} ${p === safePage ? styles.pageBtnActive : ''}`}
                onClick={() => handlePageChange(p as number)}
                aria-label={`Page ${p}`}
                aria-current={p === safePage ? 'page' : undefined}
                data-testid={`page-btn-${p}`}
              >
                {p}
              </button>
            )
          )}

          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            aria-label="Next page"
            aria-disabled={safePage >= totalPages}
            data-testid="page-next"
          >
            {'>'}
          </button>
        </div>
      </div>
    </div>
  );
}
