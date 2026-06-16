'use client';

import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

/**
 * StatsCard — Dashboard statistics card with glassmorphism
 *
 * @param {object} props
 * @param {React.ReactNode} props.icon - Icon component or element
 * @param {string} props.title - Card title (e.g., "Total Students")
 * @param {string|number} props.value - Display value (e.g., "1,234")
 * @param {number} [props.trend] - Trend percentage (positive = up, negative = down)
 * @param {string} [props.trendLabel] - Custom trend label
 * @param {string} [props.accent] - Accent color: 'primary' | 'success' | 'accent' | 'danger' | 'info'
 * @param {string} [props.iconColor] - Icon background color variant
 * @param {Function} [props.onClick] - Click handler
 */
export default function StatsCard({
  icon,
  title,
  value,
  trend,
  trendLabel,
  accent = 'primary',
  iconColor,
  onClick,
}) {
  const trendDirection = trend > 0 ? 'up' : trend < 0 ? 'down' : null;
  const colorClass = iconColor || accent;

  return (
    <div
      className={`stat-card accent-${accent}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="stat-card-info">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-value">{value}</span>
        {(trend !== undefined && trend !== null) && (
          <div className={`stat-card-trend ${trendDirection}`}>
            {trendDirection === 'up' && <FiTrendingUp style={{ fontSize: '14px' }} />}
            {trendDirection === 'down' && <FiTrendingDown style={{ fontSize: '14px' }} />}
            <span>{Math.abs(trend)}%</span>
            {trendLabel && (
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={`stat-card-icon ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
}
