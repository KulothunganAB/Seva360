import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '', className = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);
  
  useEffect(() => {
    if (!started) return;
    
    let startTime;
    const startValue = 0;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (end - startValue) * eased);
      
      setCount(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [started, end, duration]);
  
  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Skeleton Loader
export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const SkeletonCard = () => (
  <div className="card p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <Skeleton className="h-3 w-4/6" />
  </div>
);

// Progress Bar
export const ProgressBar = ({ value = 0, max = 100, className = '', showLabel = true, color = 'primary' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorMap = {
    primary: 'from-primary-600 to-primary-400',
    success: 'from-green-600 to-green-400',
    warning: 'from-yellow-500 to-yellow-400',
    danger: 'from-red-600 to-red-400',
    gold: 'from-gold-600 to-gold-400',
  };
  
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-dark-500 dark:text-dark-400 mb-1">
          <span>{value.toLocaleString()}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="progress-bar">
        <motion.div
          className={`progress-fill bg-gradient-to-r ${colorMap[color] || colorMap.primary}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// Status Badge
export const StatusBadge = ({ status, className = '' }) => {
  const config = {
    open: { label: 'Open', class: 'badge-warning' },
    'in-progress': { label: 'In Progress', class: 'badge-info' },
    resolved: { label: 'Resolved', class: 'badge-success' },
    closed: { label: 'Closed', class: 'badge-gray' },
    rejected: { label: 'Rejected', class: 'badge-danger' },
    pending: { label: 'Pending', class: 'badge-warning' },
    completed: { label: 'Completed', class: 'badge-success' },
    delayed: { label: 'Delayed', class: 'badge-danger' },
    active: { label: 'Active', class: 'badge-success' },
    upcoming: { label: 'Upcoming', class: 'badge-info' },
    approved: { label: 'Approved', class: 'badge-success' },
    cancelled: { label: 'Cancelled', class: 'badge-danger' },
  };
  
  const item = config[status] || { label: status, class: 'badge-gray' };
  
  return (
    <span className={`badge ${item.class} ${className}`}>
      {item.label}
    </span>
  );
};

// Priority Badge
export const PriorityBadge = ({ priority }) => {
  const config = {
    low: { label: 'Low', class: 'badge-success' },
    medium: { label: 'Medium', class: 'badge-warning' },
    high: { label: 'High', class: 'badge bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    critical: { label: 'Critical', class: 'badge-danger' },
  };
  
  const item = config[priority] || { label: priority, class: 'badge-gray' };
  return <span className={`badge ${item.class}`}>{item.label}</span>;
};

// Empty State
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    {Icon && <Icon className="empty-state-icon" />}
    <h3 className="empty-state-title">{title}</h3>
    {description && <p className="empty-state-desc">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// Avatar
export const Avatar = ({ name, size = 'md', src, className = '' }) => {
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };
  
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
  
  if (src) {
    return <img src={src} alt={name} className={`avatar ${sizeMap[size]} ${className}`} />;
  }
  
  return (
    <div className={`avatar ${sizeMap[size]} ${className}`}>
      {initials}
    </div>
  );
};

// Stat Card  
export const StatCard = ({ title, value, icon: Icon, change, changeType = 'up', color = 'primary', loading = false }) => {
  const colorMap = {
    primary: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20',
    success: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    gold: 'text-gold-600 bg-gold-50 dark:bg-gold-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  };
  
  if (loading) {
    return (
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }
  
  return (
    <motion.div 
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="stat-card-label">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.primary}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="stat-card-value">
        {typeof value === 'number' ? (
          <AnimatedCounter end={value} />
        ) : value}
      </div>
      {change !== undefined && (
        <div className={`text-xs mt-2 flex items-center gap-1 ${changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          <span>{changeType === 'up' ? '↑' : '↓'}</span>
          <span>{change}</span>
        </div>
      )}
    </motion.div>
  );
};

// Pagination
export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  
  const { page, totalPages } = pagination;
  
  const pages = [];
  const delta = 2;
  const range = [];
  
  for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
    range.push(i);
  }
  
  if (page - delta > 2) range.unshift('...');
  if (page + delta < totalPages - 1) range.push('...');
  
  pages.push(1);
  range.forEach(r => pages.push(r));
  if (totalPages > 1) pages.push(totalPages);
  
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-sm text-dark-500 dark:text-dark-400">
        Page {page} of {totalPages} ({pagination.total} total)
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!pagination.hasPrevPage}
          className="btn btn-ghost btn-sm disabled:opacity-40"
        >
          ← Prev
        </button>
        {pages.map((p, idx) => (
          <button
            key={idx}
            onClick={() => typeof p === 'number' && onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-primary-700 text-white'
                : p === '...'
                ? 'cursor-default text-dark-400'
                : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-dark-600 dark:text-dark-300'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.hasNextPage}
          className="btn btn-ghost btn-sm disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default AnimatedCounter;
