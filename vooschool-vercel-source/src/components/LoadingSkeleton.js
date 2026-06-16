'use client';

/**
 * LoadingSkeleton — Shimmer loading placeholders
 *
 * @param {object} props
 * @param {'card'|'table-row'|'text'|'avatar'|'stat-card'} [props.variant] - Skeleton variant
 * @param {number} [props.count] - Number of skeleton items to render
 * @param {string} [props.width] - Custom width
 * @param {string} [props.height] - Custom height
 */
export default function LoadingSkeleton({
  variant = 'text',
  count = 1,
  width,
  height,
}) {
  const items = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = (index) => {
    switch (variant) {
      case 'card':
        return (
          <div
            key={index}
            className="skeleton skeleton-card"
            style={{
              width: width || '100%',
              height: height || '120px',
            }}
          />
        );

      case 'stat-card':
        return (
          <div
            key={index}
            className="skeleton"
            style={{
              width: width || '100%',
              height: height || '120px',
              borderRadius: 'var(--radius-lg)',
            }}
          />
        );

      case 'table-row':
        return (
          <div
            key={index}
            className="skeleton-row"
            style={{ padding: '12px 16px' }}
          >
            <div
              className="skeleton"
              style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', flexShrink: 0 }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                className="skeleton skeleton-text"
                style={{ width: `${60 + Math.random() * 30}%`, height: '14px' }}
              />
              <div
                className="skeleton skeleton-text"
                style={{ width: `${30 + Math.random() * 20}%`, height: '12px' }}
              />
            </div>
            <div
              className="skeleton"
              style={{ width: '60px', height: '24px', borderRadius: 'var(--radius-full)' }}
            />
          </div>
        );

      case 'avatar':
        return (
          <div
            key={index}
            className="skeleton skeleton-avatar"
            style={{
              width: width || '40px',
              height: height || '40px',
            }}
          />
        );

      case 'text':
      default:
        return (
          <div
            key={index}
            className="skeleton skeleton-text"
            style={{
              width: width || `${60 + Math.random() * 40}%`,
              height: height || '14px',
            }}
          />
        );
    }
  };

  return <>{items.map(renderSkeleton)}</>;
}

/**
 * PageSkeleton — Full page loading skeleton
 */
export function PageSkeleton() {
  return (
    <div style={{ padding: 'var(--space-lg)' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
        <div className="skeleton" style={{ width: '200px', height: '32px', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: 'var(--radius-sm)' }} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        <LoadingSkeleton variant="stat-card" count={4} />
      </div>

      {/* Table skeleton */}
      <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)' }} />
    </div>
  );
}
