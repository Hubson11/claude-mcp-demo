// figma: https://www.figma.com/design/Xzztnkpd7O7kJmsoUYnQgu?node-id=501-2
import searchIcon from '../../assets/DashboardHeader/search.svg';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  name: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function DashboardHeader({ name, searchValue, onSearchChange }: DashboardHeaderProps) {
  return (
    <header className={styles.header} data-testid="dashboard-header">
      <p className={styles.greeting} data-testid="header-greeting">
        Hello {name} 👋🏼,
      </p>

      <div className={styles.searchContainer}>
        <label htmlFor="header-search-input" className={styles.srOnly}>
          Search
        </label>
        <img src={searchIcon} alt="" className={styles.searchIcon} width={24} height={24} />
        <input
          id="header-search-input"
          type="text"
          className={styles.searchInput}
          placeholder="Search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          data-testid="header-search"
        />
      </div>
    </header>
  );
}
