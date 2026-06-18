import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useMESStore } from '@/store/useMESStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  CalendarClock,
  ClipboardList,
  Cpu,
  ShieldCheck,
  Warehouse,
  Zap,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  Factory,
  LogOut,
  Bell,
  User,
} from 'lucide-react';
import type { RoleType } from '@/types';
import { useState } from 'react';
import { Badge } from '@/components/ui';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { path: '/dashboard', label: '车间大屏', icon: LayoutDashboard, roles: ['operator', 'teamLeader', 'workshopDirector', 'factoryManager'] as RoleType[] },
  { path: '/orders', label: '订单管理', icon: ShoppingCart, roles: ['workshopDirector', 'factoryManager'] as RoleType[] },
  { path: '/planning', label: '生产计划', icon: CalendarClock, roles: ['workshopDirector', 'factoryManager'] as RoleType[] },
  { path: '/workorders', label: '工单管理', icon: ClipboardList, roles: ['operator', 'teamLeader', 'workshopDirector', 'factoryManager'] as RoleType[] },
  { path: '/equipment', label: '设备监控', icon: Cpu, roles: ['teamLeader', 'workshopDirector', 'factoryManager'] as RoleType[] },
  { path: '/quality', label: '质量管理', icon: ShieldCheck, roles: ['teamLeader', 'workshopDirector', 'factoryManager'] as RoleType[] },
  { path: '/warehouse', label: '仓储物流', icon: Warehouse, roles: ['teamLeader', 'workshopDirector', 'factoryManager'] as RoleType[] },
  { path: '/energy', label: '能耗管理', icon: Zap, roles: ['workshopDirector', 'factoryManager'] as RoleType[] },
  { path: '/cost', label: '成本核算', icon: DollarSign, roles: ['factoryManager'] as RoleType[] },
  { path: '/settings', label: '系统设置', icon: Settings, roles: ['factoryManager'] as RoleType[] },
];

const roleNames: Record<RoleType, string> = {
  operator: '操作工',
  teamLeader: '班组长',
  workshopDirector: '车间主任',
  factoryManager: '厂长',
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const currentUser = useMESStore((state) => state.currentUser);
  const unreadCount = useMESStore((state) => state.alerts.filter(a => !a.isRead).length);
  const logout = useMESStore((state) => state.logout);
  const navigate = useNavigate();

  const visibleItems = menuItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.roleId) : false
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'h-screen bg-dark-800 border-r border-dark-600 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className={cn('h-16 flex items-center border-b border-dark-600 px-4', collapsed ? 'justify-center' : 'gap-3')}>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-industrial-500 to-industrial-700 flex items-center justify-center flex-shrink-0">
          <Factory className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-lg truncate">MES系统</h1>
            <p className="text-dark-400 text-xs">制造执行系统</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-industrial-500/20 text-industrial-400 border border-industrial-500/30'
                  : 'text-dark-200 hover:bg-dark-700 hover:text-white'
              )
            }
          >
            {item.label === '设备监控' && unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
            )}
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
            {item.label === '设备监控' && unreadCount > 0 && !collapsed && (
              <Badge variant="danger" size="sm" className="ml-auto">{unreadCount}</Badge>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-dark-600 p-3">
        {currentUser && !collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center">
              <User className="w-5 h-5 text-dark-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-dark-400 text-xs">{roleNames[currentUser.roleId]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
              title="退出登录"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        className="h-10 border-t border-dark-600 flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
}

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const alerts = useMESStore((state) => state.alerts);
  const unreadCount = useMESStore((state) => state.alerts.filter(a => !a.isRead).length);
  const markAlertRead = useMESStore((state) => state.markAlertRead);
  const location = useLocation();

  const getPageTitle = () => {
    const item = menuItems.find(m => location.pathname.startsWith(m.path));
    return item?.label || 'MES系统';
  };

  const levelColors = {
    info: 'bg-industrial-500/20 text-industrial-400 border-industrial-500/30',
    warning: 'bg-warning-500/20 text-warning-500 border-warning-500/30',
    danger: 'bg-danger-500/20 text-danger-500 border-danger-500/30',
  };

  return (
    <header className="h-16 bg-dark-800/80 backdrop-blur-sm border-b border-dark-600 flex items-center justify-between px-6">
      <div>
        <h2 className="text-white text-lg font-medium">{title || getPageTitle()}</h2>
        <p className="text-dark-400 text-xs mt-0.5">
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-dark-700 text-dark-300 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-dark-700 border border-dark-500 rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-up">
              <div className="px-4 py-3 border-b border-dark-500 flex items-center justify-between">
                <h3 className="text-white font-medium">告警通知</h3>
                <span className="text-dark-400 text-xs">{unreadCount} 条未读</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.slice(0, 10).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => markAlertRead(alert.id)}
                    className={cn(
                      'px-4 py-3 border-b border-dark-600/50 cursor-pointer hover:bg-dark-600/50 transition-colors',
                      !alert.isRead && 'bg-dark-600/30'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0',
                        alert.level === 'danger' ? 'bg-danger-500' : alert.level === 'warning' ? 'bg-warning-500' : 'bg-industrial-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{alert.title}</p>
                        <p className="text-dark-400 text-xs mt-1 line-clamp-2">{alert.message}</p>
                        <p className="text-dark-500 text-xs mt-1.5">{alert.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const sidebarCollapsed = useMESStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useMESStore((state) => state.toggleSidebar);

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
