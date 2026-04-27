// figma: https://www.figma.com/design/Xzztnkpd7O7kJmsoUYnQgu?node-id=501-195
import styles from './StatisticsSection.module.css';

import statCircle from '../../assets/StatisticsSection/stat-circle.svg';
import profile2User from '../../assets/StatisticsSection/profile-2user.svg';
import profileTick from '../../assets/StatisticsSection/profile-tick.svg';
import monitor from '../../assets/StatisticsSection/monitor.svg';
import arrowUp from '../../assets/StatisticsSection/arrow-up.svg';
import avatar1 from '../../assets/StatisticsSection/avatar-1.png';
import avatar2 from '../../assets/StatisticsSection/avatar-2.png';
import avatar3 from '../../assets/StatisticsSection/avatar-3.png';
import avatar4 from '../../assets/StatisticsSection/avatar-4.png';
import avatar5 from '../../assets/StatisticsSection/avatar-5.png';

export interface StatTrend {
  direction: 'up' | 'down';
  percent: string;
}

export interface StatTile {
  icon: string;
  iconAlt: string;
  iconSize: number;
  label: string;
  value: string;
  trend?: StatTrend;
  avatars?: string[];
}

export interface StatisticsSectionProps {
  tiles: StatTile[];
}

export const DEFAULT_TILES: StatTile[] = [
  {
    icon: profile2User,
    iconAlt: '',
    iconSize: 42,
    label: 'Total Customers',
    value: '5,423',
    trend: { direction: 'up', percent: '16%' },
  },
  {
    icon: profileTick,
    iconAlt: '',
    iconSize: 40,
    label: 'Members',
    value: '1,893',
    trend: { direction: 'down', percent: '1%' },
  },
  {
    icon: monitor,
    iconAlt: '',
    iconSize: 42,
    label: 'Active Now',
    value: '189',
    avatars: [avatar1, avatar2, avatar3, avatar4, avatar5],
  },
];

export function StatisticsSection({ tiles }: StatisticsSectionProps) {
  return (
    <section className={styles.card} data-testid="statistics-section" aria-label="Statistics overview">
      {tiles.map((tile, i) => (
        <div
          key={tile.label}
          className={`${styles.tile} ${i < tiles.length - 1 ? styles.tileBorder : ''}`}
          data-testid={`stat-tile-${i}`}
        >
          <div className={styles.circleWrap}>
            <img src={statCircle} alt="" className={styles.circle} />
            <img
              src={tile.icon}
              alt={tile.iconAlt}
              className={styles.icon}
              style={{ width: tile.iconSize, height: tile.iconSize }}
            />
          </div>

          <div className={styles.info}>
            <p className={styles.label}>{tile.label}</p>
            <p className={styles.value} data-testid={`stat-value-${i}`}>{tile.value}</p>

            {tile.trend && (
              <div className={styles.trend} data-testid={`stat-trend-${i}`}>
                <img
                  src={arrowUp}
                  alt=""
                  className={`${styles.arrow} ${tile.trend.direction === 'down' ? styles.arrowDown : ''}`}
                />
                <span
                  className={styles.trendPercent}
                  style={{ color: tile.trend.direction === 'up' ? 'var(--color-trend-up)' : 'var(--color-trend-down)' }}
                >
                  {tile.trend.percent}
                </span>
                <span className={styles.trendLabel}> this month</span>
              </div>
            )}

            {tile.avatars && (
              <div className={styles.avatars} aria-label="Active users">
                {tile.avatars.map((src, j) => (
                  <img key={j} src={src} alt="" className={styles.avatar} />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
