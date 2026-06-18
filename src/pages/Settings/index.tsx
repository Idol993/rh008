import { useState } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  User,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Eye,
  Check,
  X,
} from 'lucide-react';
import type { RoleType, User as UserType } from '@/types';

const roleNames: Record<RoleType, string> = {
  operator: '操作工',
  teamLeader: '班组长',
  workshopDirector: '车间主任',
  factoryManager: '厂长',
};

const roleColors: Record<RoleType, string> = {
  operator: 'bg-dark-500 text-dark-200',
  teamLeader: 'bg-industrial-500/20 text-industrial-400 border-industrial-500/30',
  workshopDirector: 'bg-warning-500/20 text-warning-500 border-warning-500/30',
  factoryManager: 'bg-danger-500/20 text-danger-500 border-danger-500/30',
};

const roleDescriptions: Record<RoleType, string> = {
  operator: '基础操作权限，可扫码开工、报工、查看个人工单',
  teamLeader: '班组管理权限，可管理工单、处理异常、查看班组数据',
  workshopDirector: '车间管理权限，可排程、管控质量、分析成本',
  factoryManager: '全部权限，可决策分析、查看报表、系统配置',
};

const permissions = [
  { id: 'dashboard', name: '车间大屏', icon: Eye },
  { id: 'orders', name: '订单管理', icon: Eye },
  { id: 'planning', name: '生产计划', icon: Eye },
  { id: 'workorders', name: '工单管理', icon: Eye },
  { id: 'equipment', name: '设备监控', icon: Eye },
  { id: 'quality', name: '质量管理', icon: Eye },
  { id: 'warehouse', name: '仓储物流', icon: Eye },
  { id: 'energy', name: '能耗管理', icon: Eye },
  { id: 'cost', name: '成本核算', icon: Eye },
  { id: 'settings', name: '系统设置', icon: Eye },
];

const rolePermissions: Record<RoleType, string[]> = {
  operator: ['dashboard', 'workorders'],
  teamLeader: ['dashboard', 'workorders', 'equipment', 'quality', 'warehouse'],
  workshopDirector: ['dashboard', 'orders', 'planning', 'workorders', 'equipment', 'quality', 'warehouse', 'energy'],
  factoryManager: ['dashboard', 'orders', 'planning', 'workorders', 'equipment', 'quality', 'warehouse', 'energy', 'cost', 'settings'],
};

function RolePermissionCard({ role }: { role: RoleType }) {
  const perms = rolePermissions[role];

  return (
    <div className={`border rounded-xl p-5 ${
      role === 'factoryManager' ? 'border-danger-500/30 bg-danger-500/5' :
      role === 'workshopDirector' ? 'border-warning-500/30 bg-warning-500/5' :
      role === 'teamLeader' ? 'border-industrial-500/30 bg-industrial-500/5' :
      'border-dark-600 bg-dark-700/30'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            role === 'factoryManager' ? 'bg-danger-500/20 text-danger-500' :
            role === 'workshopDirector' ? 'bg-warning-500/20 text-warning-500' :
            role === 'teamLeader' ? 'bg-industrial-500/20 text-industrial-400' :
            'bg-dark-600 text-dark-400'
          }`}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-medium">{roleNames[role]}</h3>
            <p className="text-dark-400 text-xs">{perms.length} 个模块权限</p>
          </div>
        </div>
      </div>

      <p className="text-dark-400 text-sm mb-4">{roleDescriptions[role]}</p>

      <div className="space-y-2">
        {permissions.map((perm) => {
          const hasPermission = perms.includes(perm.id);
          return (
            <div key={perm.id} className="flex items-center gap-2">
              {hasPermission ? (
                <Check className="w-4 h-4 text-success-500" />
              ) : (
                <X className="w-4 h-4 text-dark-600" />
              )}
              <span className={`text-sm ${hasPermission ? 'text-white' : 'text-dark-500'}`}>
                {perm.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserManagement() {
  const users = useMESStore((state) => state.users);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.includes(searchText);
    const matchRole = !roleFilter || u.roleId === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <Card
      title="用户管理"
      subtitle="系统用户列表与权限分配"
      icon={<Users className="w-5 h-5" />}
      action={
        <Button size="sm" icon={<Plus className="w-4 h-4" />}>
          添加用户
        </Button>
      }
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="搜索用户名..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-industrial-500 transition-colors text-sm"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: 'operator', label: '操作工' },
            { value: 'teamLeader', label: '班组长' },
            { value: 'workshopDirector', label: '车间主任' },
            { value: 'factoryManager', label: '厂长' },
          ]}
          placeholder="全部角色"
          className="w-40"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-600">
              <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">用户</th>
              <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">角色</th>
              <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">权限范围</th>
              <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">状态</th>
              <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-dark-300" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{user.name}</p>
                      <p className="text-dark-500 text-xs">ID: {user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[user.roleId]}`}>
                    {roleNames[user.roleId]}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {rolePermissions[user.roleId].slice(0, 4).map(p => (
                      <span key={p} className="text-xs bg-dark-600 text-dark-300 px-2 py-0.5 rounded">
                        {permissions.find(perm => perm.id === p)?.name}
                      </span>
                    ))}
                    {rolePermissions[user.roleId].length > 4 && (
                      <span className="text-xs bg-dark-600 text-dark-400 px-2 py-0.5 rounded">
                        +{rolePermissions[user.roleId].length - 4}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1.5 text-success-500 text-sm">
                    <span className="w-2 h-2 rounded-full bg-success-500" />
                    正常
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-danger-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function Settings() {
  const currentUser = useMESStore((state) => state.currentUser);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">系统设置</h1>
          <p className="text-dark-400 text-sm">用户权限管理与系统配置</p>
        </div>
        {currentUser && (
          <div className="flex items-center gap-3 px-4 py-2 bg-dark-800 rounded-xl border border-dark-600">
            <div className="w-10 h-10 rounded-full bg-industrial-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-industrial-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{currentUser.name}</p>
              <p className="text-industrial-400 text-xs">{roleNames[currentUser.roleId]}</p>
            </div>
          </div>
        )}
      </div>

      <Card
        title="角色权限说明"
        subtitle="系统共设四级权限，由低到高依次为操作工、班组长、车间主任、厂长"
        icon={<Shield className="w-5 h-5 text-industrial-400" />}
      >
        <div className="grid grid-cols-4 gap-4">
          {(['operator', 'teamLeader', 'workshopDirector', 'factoryManager'] as RoleType[]).map(role => (
            <RolePermissionCard key={role} role={role} />
          ))}
        </div>
      </Card>

      <UserManagement />

      <div className="grid grid-cols-2 gap-6">
        <Card title="基础数据配置" subtitle="产品、物料、设备等基础数据维护" icon={<SettingsIcon className="w-5 h-5" />}>
          <div className="space-y-3">
            {[
              { name: '产品管理', desc: '产品信息与BOM配置' },
              { name: '物料管理', desc: '物料基础信息维护' },
              { name: '设备管理', desc: '设备档案与参数配置' },
              { name: '仓库管理', desc: '仓库与库位设置' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 cursor-pointer transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  <p className="text-dark-400 text-xs">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-dark-400" />
              </div>
            ))}
          </div>
        </Card>

        <Card title="系统参数" subtitle="系统运行参数与阈值配置" icon={<SettingsIcon className="w-5 h-5" />}>
          <div className="space-y-3">
            {[
              { name: '能耗阈值', desc: '设备电耗超标预警设置' },
              { name: '库存预警', desc: '安全库存与预警参数' },
              { name: '质量标准', desc: '合格品判定标准配置' },
              { name: '班次设置', desc: '工作班次与时间配置' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 cursor-pointer transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  <p className="text-dark-400 text-xs">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-dark-400" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
