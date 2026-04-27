// figma: https://www.figma.com/design/Xzztnkpd7O7kJmsoUYnQgu?node-id=501-2
import { useState } from 'react';
import { DashboardHeader } from '../../components/DashboardHeader';
import { StatisticsSection, DEFAULT_TILES } from '../../components/StatisticsSection';
import { CustomersTable } from '../../components/CustomersTable';
import styles from './LandingPage.module.css';

export function LandingPage() {
  const [search, setSearch] = useState('');

  return (
    <main className={styles.page} data-testid="landing-page">
      <DashboardHeader name="Evano" searchValue={search} onSearchChange={setSearch} />
      <StatisticsSection tiles={DEFAULT_TILES} />
      <CustomersTable searchValue={search} onSearchChange={setSearch} />
    </main>
  );
}
