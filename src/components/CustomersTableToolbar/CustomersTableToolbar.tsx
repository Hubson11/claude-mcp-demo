// figma: https://www.figma.com/design/jQxGbsT4g3WZDPIfVXzZUx/CRM-Dashboard-Customers-List--Community-?node-id=501-3
import styles from './CustomersTableToolbar.module.css'
import iconSearch from '../../assets/CustomersTableToolbar/icon-search.svg'
import iconChevron from '../../assets/CustomersTableToolbar/icon-chevron-down.svg'

type SortOption = 'newest' | 'oldest'
type FilterOption = 'all' | 'active'

interface Props {
  search: string
  sort: SortOption
  filter: FilterOption
  onSearchChange: (value: string) => void
  onSortChange: (sort: SortOption) => void
  onFilterChange: (filter: FilterOption) => void
}

export function CustomersTableToolbar({
  search, sort, filter, onSearchChange, onSortChange, onFilterChange,
}: Props) {
  return (
    <div className={styles.root} data-testid="customers-toolbar">
      <div className={styles.titleGroup}>
        <h2 className={styles.title} data-testid="toolbar-title">All Customers</h2>
        <button
          className={`${styles.filterBtn}${filter === 'active' ? ` ${styles.filterBtnActive}` : ''}`}
          onClick={() => onFilterChange(filter === 'active' ? 'all' : 'active')}
          data-testid="toolbar-filter-toggle"
          aria-pressed={filter === 'active'}
        >
          Active Members
        </button>
      </div>
      <div className={styles.controls}>
        <div className={styles.searchBox} data-testid="toolbar-search-box">
          <img src={iconSearch} alt="" className={styles.searchIcon} aria-hidden="true" />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            data-testid="toolbar-search"
            aria-label="Search customers"
          />
        </div>
        <div className={styles.sortBox} data-testid="toolbar-sort-box">
          <span className={styles.sortLabel}>
            Sort by : <strong className={styles.sortValue}>{sort === 'newest' ? 'Newest' : 'Oldest'}</strong>
          </span>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={e => onSortChange(e.target.value as SortOption)}
            data-testid="toolbar-sort"
            aria-label="Sort order"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <img src={iconChevron} alt="" className={styles.chevronIcon} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
