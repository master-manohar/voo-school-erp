'use client';

import { useState, useMemo } from 'react';
import { FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiSearch, FiInbox } from 'react-icons/fi';
import LoadingSkeleton from './LoadingSkeleton';

/**
 * DataTable — Reusable sortable, searchable, paginated data table
 *
 * @param {object} props
 * @param {Array<{key: string, label: string, sortable?: boolean, render?: Function, width?: string}>} props.columns
 * @param {Array<object>} props.data - Array of row objects
 * @param {boolean} [props.loading] - Show loading skeletons
 * @param {boolean} [props.searchable] - Show search bar
 * @param {string} [props.searchPlaceholder] - Search placeholder text
 * @param {number} [props.pageSize] - Items per page (default: 10)
 * @param {Function} [props.onRowClick] - Row click handler (row) => void
 * @param {string} [props.emptyTitle] - Empty state title
 * @param {string} [props.emptyText] - Empty state description
 * @param {React.ReactNode} [props.filters] - Additional filter elements
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  onRowClick,
  emptyTitle = 'No data found',
  emptyText = 'There are no records to display.',
  filters,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data by search query
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;

    const query = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [data, search, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when search changes
  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // Sort handler
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Page navigation
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="table-container">
        {(searchable || filters) && (
          <div className="filter-bar">
            <div className="skeleton skeleton-text" style={{ width: '280px', height: '40px' }} />
          </div>
        )}
        <LoadingSkeleton variant="table-row" count={5} />
      </div>
    );
  }

  return (
    <div className="table-container">
      {/* Search & Filters */}
      {(searchable || filters) && (
        <div className="filter-bar">
          {searchable && (
            <div style={{ position: 'relative', flex: '1', maxWidth: '280px' }}>
              <FiSearch
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          )}
          {filters}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={sortKey === col.key ? 'sorted' : ''}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {col.label}
                    {col.sortable !== false && sortKey === col.key && (
                      sortDir === 'asc'
                        ? <FiChevronUp style={{ fontSize: '12px' }} />
                        : <FiChevronDown style={{ fontSize: '12px' }} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <FiInbox className="empty-state-icon" />
                    <h3 className="empty-state-title">{emptyTitle}</h3>
                    <p className="empty-state-text">{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || row.admNo || index}
                  className={onRowClick ? 'clickable' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(row[col.key], row, index + (currentPage - 1) * pageSize)
                        : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length}
          </span>

          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
