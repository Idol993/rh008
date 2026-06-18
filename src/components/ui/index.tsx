import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  glow?: boolean;
}

export function Card({ children, className, title, subtitle, icon, action, glow = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-dark-700/80 backdrop-blur-sm border border-dark-500 rounded-xl overflow-hidden transition-all duration-300',
        glow && 'border-industrial-500/30 shadow-lg shadow-industrial-500/10',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-500/50">
          <div className="flex items-center gap-3">
            {icon && <div className="text-industrial-400">{icon}</div>}
            <div>
              {title && <h3 className="text-white font-medium">{title}</h3>}
              {subtitle && <p className="text-dark-300 text-sm mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'none';
  trendValue?: string;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'industrial';
  className?: string;
}

export function StatCard({ label, value, unit, icon, trend = 'none', trendValue, color = 'default', className }: StatCardProps) {
  const colorClasses = {
    default: 'text-white',
    success: 'text-success-500',
    warning: 'text-warning-500',
    danger: 'text-danger-500',
    industrial: 'text-industrial-400',
  };

  return (
    <div className={cn('bg-dark-700/80 backdrop-blur-sm border border-dark-500 rounded-xl p-5 transition-all hover:border-dark-400 hover:shadow-lg', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-300 text-sm">{label}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className={cn('text-3xl font-bold font-mono', colorClasses[color])}>
              {value}
            </span>
            {unit && <span className="text-dark-400 text-sm">{unit}</span>}
          </div>
        </div>
        {icon && <div className={cn('p-3 rounded-lg bg-dark-600', colorClasses[color])}>{icon}</div>}
      </div>
      {trend !== 'none' && trendValue && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          <span className={trend === 'up' ? 'text-success-500' : trend === 'down' ? 'text-danger-500' : 'text-dark-400'}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
          <span className="text-dark-400">{trendValue}</span>
        </div>
      )}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'industrial';
  size?: 'sm' | 'md';
  className?: string;
  pulse?: boolean;
}

export function Badge({ children, variant = 'default', size = 'md', className, pulse = false }: BadgeProps) {
  const variants = {
    default: 'bg-dark-500 text-dark-200',
    success: 'bg-success-500/20 text-success-500 border border-success-500/30',
    warning: 'bg-warning-500/20 text-warning-500 border border-warning-500/30',
    danger: 'bg-danger-500/20 text-danger-500 border border-danger-500/30',
    info: 'bg-industrial-500/20 text-industrial-400 border border-industrial-500/30',
    industrial: 'bg-industrial-500/20 text-industrial-400 border border-industrial-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );
}

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  type?: 'button' | 'submit';
}

export function Button({ children, variant = 'primary', size = 'md', className, onClick, disabled = false, icon, type = 'button' }: ButtonProps) {
  const variants = {
    primary: 'bg-industrial-500 hover:bg-industrial-600 text-white shadow-lg shadow-industrial-500/25',
    secondary: 'bg-dark-500 hover:bg-dark-400 text-white',
    outline: 'border border-dark-400 hover:border-industrial-500 text-white hover:bg-industrial-500/10',
    ghost: 'text-dark-200 hover:text-white hover:bg-dark-500',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white shadow-lg shadow-danger-500/25',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
  error?: string;
  suffix?: ReactNode;
}

export function Input({ label, placeholder, value, onChange, type = 'text', className, error, suffix }: InputProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label className="text-sm text-dark-200 font-medium">{label}</label>}
      <div className="relative">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'w-full px-4 py-2.5 bg-dark-700 border border-dark-400 rounded-lg text-white placeholder-dark-400',
            'focus:outline-none focus:border-industrial-500 focus:ring-2 focus:ring-industrial-500/20 transition-all',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
            suffix && 'pr-10'
          )}
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">{suffix}</div>}
      </div>
      {error && <p className="text-danger-500 text-sm">{error}</p>}
    </div>
  );
}

interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}

export function Select({ label, value, onChange, options, className, placeholder = '请选择' }: SelectProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label className="text-sm text-dark-200 font-medium">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-4 py-2.5 bg-dark-700 border border-dark-400 rounded-lg text-white focus:outline-none focus:border-industrial-500 focus:ring-2 focus:ring-industrial-500/20 transition-all appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'industrial';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, max = 100, color = 'industrial', height = 'md', showLabel = false, className }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    default: 'bg-dark-400',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    industrial: 'bg-industrial-500',
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-dark-300">进度</span>
          <span className="text-white font-mono">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-dark-600 rounded-full overflow-hidden', heights[height])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface StatusDotProps {
  status: 'running' | 'idle' | 'maintenance' | 'fault' | 'pending' | 'completed' | 'abnormal' | string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusDot({ status, pulse = false, size = 'md' }: StatusDotProps) {
  const statusColors: Record<string, string> = {
    running: 'bg-success-500',
    idle: 'bg-dark-400',
    maintenance: 'bg-warning-500',
    fault: 'bg-danger-500',
    pending: 'bg-warning-500',
    completed: 'bg-success-500',
    abnormal: 'bg-danger-500',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        statusColors[status] || 'bg-dark-400',
        sizes[size],
        pulse && 'animate-pulse'
      )}
    />
  );
}
