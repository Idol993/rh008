import { useEffect, useState, useRef } from 'react';
import { useMESStore } from '@/store/useMESStore';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  Cpu,
  AlertTriangle,
  Package,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Zap,
  Clock,
} from 'lucide-react';
import { StatusDot, Badge } from '@/components/ui';

function OEERingChart({ value, label }: { value: number; label: string }) {
  const percentage = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * 80;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  const getColor = (val: number) => {
    if (val >= 85) return '#00B42A';
    if (val >= 70) return '#FF7D00';
    return '#F53F3F';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#1D2129"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${getColor(percentage)}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold font-mono text-white">
            {percentage.toFixed(1)}%
          </span>
          <span className="text-dark-400 text-sm mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
}

function BigNumber({ value, unit, label, color = 'text-white', icon }: {
  value: string | number;
  unit?: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-dark-700/60 backdrop-blur-sm border border-dark-600 rounded-xl p-5">
      <div className="flex items-start justify-between mb-2">
        <span className="text-dark-400 text-sm">{label}</span>
        {icon && <span className="text-dark-400">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-bold font-mono ${color}`}>
          {value}
        </span>
        {unit && <span className="text-dark-400 text-sm">{unit}</span>}
      </div>
    </div>
  );
}

function EquipmentGrid() {
  const equipments = useMESStore((state) => state.equipments);
  const updateEquipmentData = useMESStore((state) => state.updateEquipmentData);

  useEffect(() => {
    const interval = setInterval(() => {
      equipments.forEach((eq) => {
        if (eq.status === 'running') {
          const newTemp = eq.currentTemperature + (Math.random() - 0.5) * 3;
          const newSpeed = eq.currentSpeed + (Math.random() - 0.5) * 100;
          const newPower = eq.currentPower + (Math.random() - 0.5) * 1;
          updateEquipmentData(eq.id, {
            timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
            temperature: Math.max(eq.temperatureThreshold.min, Math.min(eq.temperatureThreshold.max, newTemp)),
            speed: Math.max(0, newSpeed),
            power: Math.max(0, newPower),
          });
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [equipments, updateEquipmentData]);

  const statusColors: Record<string, string> = {
    running: 'border-success-500/50 bg-success-500/10',
    idle: 'border-dark-500 bg-dark-700/50',
    maintenance: 'border-warning-500/50 bg-warning-500/10',
    fault: 'border-danger-500/50 bg-danger-500/10 animate-pulse',
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {equipments.map((eq) => (
        <div
          key={eq.id}
          className={`border rounded-xl p-4 transition-all ${statusColors[eq.status]}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <StatusDot status={eq.status} pulse={eq.status === 'running'} size="lg" />
              <span className="text-white font-medium text-sm">{eq.name}</span>
            </div>
            <Badge variant={eq.status === 'running' ? 'success' : eq.status === 'fault' ? 'danger' : eq.status === 'maintenance' ? 'warning' : 'default'} size="sm">
              {eq.status === 'running' ? '运行中' : eq.status === 'idle' ? '待机' : eq.status === 'maintenance' ? '维护中' : '故障'}
            </Badge>
          </div>
          {eq.status === 'running' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-dark-400">温度</span>
                <span className={`font-mono ${eq.currentTemperature > eq.temperatureThreshold.max * 0.8 ? 'text-warning-500' : 'text-white'}`}>
                  {eq.currentTemperature.toFixed(1)}°C
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-400">转速</span>
                <span className="text-white font-mono">{eq.currentSpeed.toFixed(0)} rpm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-400">功率</span>
                <span className="text-white font-mono">{eq.currentPower.toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-dark-600/50">
                <span className="text-dark-400">OEE</span>
                <span className="text-industrial-400 font-mono font-bold">{eq.oee.toFixed(1)}%</span>
              </div>
            </div>
          )}
          {eq.status === 'fault' && (
            <p className="text-danger-500 text-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              故障停机中
            </p>
          )}
          {eq.status === 'maintenance' && (
            <p className="text-warning-500 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              计划维护
            </p>
          )}
          {eq.status === 'idle' && (
            <p className="text-dark-400 text-xs">待命中</p>
          )}
        </div>
      ))}
    </div>
  );
}

function AlertTicker() {
  const alerts = useMESStore((state) => state.alerts);
  const [tickerKey, setTickerKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerKey(k => k + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const levelColors = {
    danger: 'text-danger-500 bg-danger-500/10 border-danger-500/30',
    warning: 'text-warning-500 bg-warning-500/10 border-warning-500/30',
    info: 'text-industrial-400 bg-industrial-500/10 border-industrial-500/30',
  };

  return (
    <div className="overflow-hidden relative h-32">
      <div
        key={tickerKey}
        className="space-y-2 animate-slide-up"
      >
        {alerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${levelColors[alert.level as keyof typeof levelColors]}`}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{alert.title}</p>
            </div>
            <span className="text-xs opacity-70 flex-shrink-0">{alert.timestamp.split(' ')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const productionStats = useMESStore((state) => state.productionStats);
  const workOrders = useMESStore((state) => state.workOrders);
  const qualityChecks = useMESStore((state) => state.qualityChecks);
  const orders = useMESStore((state) => state.orders);

  const todayStats = productionStats[productionStats.length - 1];
  const runningWO = workOrders.filter(wo => wo.status === 'running');
  const completedToday = workOrders.filter(wo => wo.status === 'completed' && wo.endTime?.startsWith(new Date().toISOString().split('T')[0]));

  const totalPlanQty = workOrders.reduce((sum, wo) => sum + wo.planQty, 0);
  const totalCompletedQty = workOrders.reduce((sum, wo) => sum + wo.completedQty, 0);
  const totalGoodQty = workOrders.reduce((sum, wo) => sum + wo.goodQty, 0);
  const totalBadQty = workOrders.reduce((sum, wo) => sum + wo.badQty, 0);
  const passRate = totalCompletedQty > 0 ? (totalGoodQty / totalCompletedQty) * 100 : 0;
  const achievementRate = totalPlanQty > 0 ? (totalCompletedQty / totalPlanQty) * 100 : 0;

  const defectData = qualityChecks.flatMap(qc => qc.defects).reduce((acc, d) => {
    const existing = acc.find(item => item.name === d.defectName);
    if (existing) {
      existing.value += d.quantity;
    } else {
      acc.push({ name: d.defectName, value: d.quantity });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1'];

  const hourlyOutput = Array.from({ length: 12 }, (_, i) => ({
    time: `${8 + i}:00`,
    plan: 40 + Math.floor(Math.random() * 15),
    actual: 35 + Math.floor(Math.random() * 18),
  }));

  return (
    <div className="space-y-4 -m-6 p-6 min-h-full bg-dark-900">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-industrial-400" />
            车间生产实时监控
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            <span className="ml-2 text-industrial-400 animate-pulse">● 实时数据</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="success" size="md" className="text-sm">
            <span className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse" />
            在线设备 {workOrders.filter(w => w.status === 'running').length + 1}/{8}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3 space-y-4">
          <div className="bg-dark-800/60 backdrop-blur-sm border border-dark-600 rounded-2xl p-6 flex flex-col items-center">
            <OEERingChart value={todayStats?.oee || 82.5} label="设备综合效率" />
            <div className="w-full mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-dark-400">可用率</p>
                <p className="text-white font-mono font-bold">92.5%</p>
              </div>
              <div>
                <p className="text-xs text-dark-400">性能率</p>
                <p className="text-white font-mono font-bold">91.2%</p>
              </div>
              <div>
                <p className="text-xs text-dark-400">良品率</p>
                <p className="text-white font-mono font-bold">{passRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <BigNumber
            value={achievementRate.toFixed(1)}
            unit="%"
            label="产量达成率"
            color="text-industrial-400"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <BigNumber
            value={passRate.toFixed(1)}
            unit="%"
            label="产品合格率"
            color="text-success-500"
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <BigNumber
            value={((100 - passRate)).toFixed(2)}
            unit="%"
            label="不良品率"
            color={passRate > 95 ? 'text-success-500' : passRate > 90 ? 'text-warning-500' : 'text-danger-500'}
            icon={<XCircle className="w-5 h-5" />}
          />
        </div>

        <div className="col-span-6 space-y-4">
          <div className="bg-dark-800/60 backdrop-blur-sm border border-dark-600 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Package className="w-5 h-5 text-industrial-400" />
                今日产量趋势
              </h3>
              <Badge variant="industrial" size="sm">实时更新</Badge>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyOutput}>
                  <defs>
                    <linearGradient id="colorPlan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#165DFF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#165DFF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00B42A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00B42A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272e3b" />
                  <XAxis dataKey="time" stroke="#4e5969" fontSize={12} />
                  <YAxis stroke="#4e5969" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="plan" stroke="#165DFF" fill="url(#colorPlan)" strokeWidth={2} name="计划" />
                  <Area type="monotone" dataKey="actual" stroke="#00B42A" fill="url(#colorActual)" strokeWidth={2} name="实际" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-dark-800/60 backdrop-blur-sm border border-dark-600 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Cpu className="w-5 h-5 text-industrial-400" />
                设备状态监控
              </h3>
              <div className="flex gap-2">
                <Badge variant="success" size="sm">运行 5</Badge>
                <Badge variant="default" size="sm">待机 1</Badge>
                <Badge variant="warning" size="sm">维护 1</Badge>
                <Badge variant="danger" size="sm">故障 1</Badge>
              </div>
            </div>
            <EquipmentGrid />
          </div>
        </div>

        <div className="col-span-3 space-y-4">
          <div className="bg-dark-800/60 backdrop-blur-sm border border-dark-600 rounded-2xl p-5">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              实时告警
            </h3>
            <AlertTicker />
          </div>

          <div className="bg-dark-800/60 backdrop-blur-sm border border-dark-600 rounded-2xl p-5">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning-500" />
              今日能耗
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-dark-400 text-sm">总用电量</span>
                <span className="text-white font-mono font-bold">524.6 kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-400 text-sm">目标能耗</span>
                <span className="text-dark-300 font-mono">500 kWh</span>
              </div>
              <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-industrial-500 to-warning-500 rounded-full" style={{ width: '105%' }} />
              </div>
              <p className="text-warning-500 text-xs text-right">超出目标 4.9%</p>
            </div>
          </div>

          <div className="bg-dark-800/60 backdrop-blur-sm border border-dark-600 rounded-2xl p-5">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-danger-500" />
              缺陷类型分布
            </h3>
            {defectData.length > 0 ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={defectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {defectData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-dark-400 text-sm text-center py-8">暂无缺陷记录</p>
            )}
            <div className="space-y-1 mt-2">
              {defectData.slice(0, 3).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-dark-300">{d.name}</span>
                  </div>
                  <span className="text-white font-mono">{d.value}件</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-800/60 backdrop-blur-sm border border-dark-600 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">今日生产工单</h3>
          <span className="text-dark-400 text-sm">共 {workOrders.length} 个工单</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">工单号</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">产品</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">设备</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">操作工</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">计划/完成</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">进度</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">状态</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.slice(0, 5).map((wo) => (
                <tr key={wo.id} className="border-b border-dark-700 hover:bg-dark-700/30 transition-colors">
                  <td className="py-3 px-4 text-industrial-400 font-mono text-sm">{wo.workOrderNo}</td>
                  <td className="py-3 px-4 text-white text-sm">{wo.productName}</td>
                  <td className="py-3 px-4 text-dark-200 text-sm">{wo.equipmentName}</td>
                  <td className="py-3 px-4 text-dark-300 text-sm">{wo.operatorName || '-'}</td>
                  <td className="py-3 px-4 text-white font-mono text-sm">
                    {wo.completedQty} / {wo.planQty}
                  </td>
                  <td className="py-3 px-4 w-32">
                    <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-industrial-500 rounded-full transition-all duration-500"
                        style={{ width: `${(wo.completedQty / wo.planQty) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      size="sm"
                      variant={
                        wo.status === 'running' ? 'success' :
                        wo.status === 'completed' ? 'industrial' :
                        wo.status === 'abnormal' ? 'danger' :
                        wo.status === 'paused' ? 'warning' : 'default'
                      }
                    >
                      {wo.status === 'running' ? '进行中' :
                       wo.status === 'pending' ? '待开工' :
                       wo.status === 'paused' ? '暂停' :
                       wo.status === 'completed' ? '已完成' : '异常'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
