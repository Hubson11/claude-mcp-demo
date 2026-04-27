// figma: https://www.figma.com/design/Xzztnkpd7O7kJmsoUYnQgu?node-id=501:195
import styles from './Statistics.module.css'
import iconCircleBg from '../../assets/Statistics/icon-circle-bg.svg'
import iconProfile2User from '../../assets/Statistics/icon-profile-2user.svg'
import iconProfileTick from '../../assets/Statistics/icon-profile-tick.svg'
import iconMonitor from '../../assets/Statistics/icon-monitor.svg'
import iconArrowUp from '../../assets/Statistics/icon-arrow-up.svg'
import iconArrowDown from '../../assets/Statistics/icon-arrow-down.svg'

export interface StatisticsProps {
  totalCustomers: number
  totalCustomersChange: number
  members: number
  membersChange: number
  activeNow: number
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

function TrendIndicator({ percent }: { percent: number }) {
  const isUp = percent >= 0
  return (
    <div className={styles.trend}>
      <img
        src={isUp ? iconArrowUp : iconArrowDown}
        alt={isUp ? 'increase' : 'decrease'}
        className={`${styles.trendArrow}${isUp ? '' : ` ${styles.trendArrowDown}`}`}
      />
      <p className={styles.trendText}>
        <span className={isUp ? styles.trendPercentUp : styles.trendPercentDown}>
          {Math.abs(percent)}%
        </span>
        {' this month'}
      </p>
    </div>
  )
}

export function Statistics({ totalCustomers, totalCustomersChange, members, membersChange, activeNow }: StatisticsProps) {
  return (
    <div className={styles.container} data-testid="statistics">
      <div className={styles.stat} data-testid="stat-total-customers">
        <div className={styles.iconWrapper}>
          <img src={iconCircleBg} alt="" className={styles.iconCircle} />
          <img src={iconProfile2User} alt="" className={`${styles.iconImg} ${styles.iconImg42}`} />
        </div>
        <div className={styles.textGroup}>
          <p className={styles.label}>Total Customers</p>
          <p className={styles.value}>{formatNumber(totalCustomers)}</p>
          <TrendIndicator percent={totalCustomersChange} />
        </div>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.stat} data-testid="stat-members">
        <div className={styles.iconWrapper}>
          <img src={iconCircleBg} alt="" className={styles.iconCircle} />
          <img src={iconProfileTick} alt="" className={`${styles.iconImg} ${styles.iconImg40}`} />
        </div>
        <div className={styles.textGroup}>
          <p className={styles.label}>Members</p>
          <p className={styles.value}>{formatNumber(members)}</p>
          <TrendIndicator percent={membersChange} />
        </div>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.stat} data-testid="stat-active-now">
        <div className={styles.iconWrapper}>
          <img src={iconCircleBg} alt="" className={styles.iconCircle} />
          <img src={iconMonitor} alt="" className={`${styles.iconImg} ${styles.iconImg42}`} />
        </div>
        <div className={styles.textGroup}>
          <p className={styles.label}>Active Now</p>
          <p className={styles.value}>{formatNumber(activeNow)}</p>
        </div>
      </div>
    </div>
  )
}
