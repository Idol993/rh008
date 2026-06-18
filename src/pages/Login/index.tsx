import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMESStore } from '@/store/useMESStore';
import { Button, Input } from '@/components/ui';
import { Factory, User, Lock, Users } from 'lucide-react';
import type { RoleType } from '@/types';

const roleNames: Record<RoleType, string> = {
  operator: '操作工',
  teamLeader: '班组长',
  workshopDirector: '车间主任',
  factoryManager: '厂长',
};

const roleDescriptions: Record<RoleType, string> = {
  operator: '扫码开工、工单执行、异常上报',
  teamLeader: '班组管理、工单调度、质量监控',
  workshopDirector: '计划排程、生产管控、成本分析',
  factoryManager: '全局管控、决策分析、系统配置',
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<RoleType>('operator');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useMESStore((state) => state.login);
  const users = useMESStore((state) => state.users);
  const navigate = useNavigate();

  const roleUsers = users.filter(u => u.roleId === selectedRole);

  const handleQuickLogin = (userId: string) => {
    const success = login(userId);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleUsers.length > 0) {
      handleQuickLogin(roleUsers[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-industrial-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-industrial-700/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-dark-700 rounded-full opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dark-700 rounded-full opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-dark-700 rounded-full opacity-10" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-industrial-500 to-industrial-700 mb-4 shadow-lg shadow-industrial-500/30">
            <Factory className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MES 生产执行系统</h1>
          <p className="text-dark-400">离散型智能制造车间管理平台</p>
        </div>

        <div className="bg-dark-800/80 backdrop-blur-xl border border-dark-600 rounded-2xl p-6 shadow-2xl">
          <div className="mb-6">
            <label className="text-sm text-dark-200 font-medium mb-3 block flex items-center gap-2">
              <Users className="w-4 h-4" />
              选择角色
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(roleNames) as RoleType[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedRole === role
                      ? 'border-industrial-500 bg-industrial-500/10'
                      : 'border-dark-600 hover:border-dark-500 bg-dark-700/50'
                  }`}
                >
                  <p className={`font-medium text-sm ${selectedRole === role ? 'text-industrial-400' : 'text-white'}`}>
                    {roleNames[role]}
                  </p>
                  <p className="text-dark-400 text-xs mt-1">{roleDescriptions[role]}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="账号"
              placeholder="请输入账号"
              value={username}
              onChange={setUsername}
              suffix={<User className="w-4 h-4" />}
            />
            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={setPassword}
              suffix={<Lock className="w-4 h-4" />}
            />

            <Button type="submit" className="w-full" size="lg">
              登 录
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-dark-600">
            <p className="text-dark-400 text-xs mb-3">快速体验登录（点击用户头像直接登录）</p>
            <div className="flex flex-wrap gap-2">
              {roleUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-industrial-500/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-industrial-400" />
                  </div>
                  <span className="text-sm text-dark-200 group-hover:text-white">{user.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-dark-500 text-xs mt-6">
          © 2026 MES 生产执行系统 v1.0.0 | 离散型智能制造
        </p>
      </div>
    </div>
  );
}
