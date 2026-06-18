import { useState, useEffect } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button, Select } from '@/components/ui';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Clock,
  Gauge,
  Activity,
  RefreshCw,
  Bell,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { generateEnergyHourlyData } from '@/mock';

const COLORS = ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#86909C', '#0FC6C2'];

export default function Energy() {
  const energyRecords = useMESStore((state) => state.energyRecords);
  const equipments = useMESStore((state) => state.equipments);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [hourlyData, setHourlyData] = useState<{ hour: number; consumption: number }[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (selectedEquipment) {
      setHourlyData(generateEnergyHourlyData(selectedEquipment));
    } else {
      const totalHourly = Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        consumption: 0,
      }));
      equipments.forEach(eq => {
        const data = generateEnergyHourlyData(eq.id);
        data.forEach(d => {
          totalHourly[d.hour].consumption += d.consumption;
        });
      });
      setHourlyData(totalHourly);
    }
  }, [selectedEquipment, equipments]);

  const totalConsumption = energyRecords.reduce((sum, r) => sum + r.powerConsumption, 0);
  const totalStandard = energyRecords.reduce((sum, r) => sum + r.standardConsumption, 0);
  const overLimitCount = energyRecords.filter(r => r.isOverLimit).length;
  const overLimitRate = totalConsumption > totalStandard
    ? ((totalConsumption - totalStandard) / totalStandard * 100)
    : 0;

  const equipmentOptions = equipments.map(eq => ({
    value: eq.id,
    label: eq.name,
  }));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (selectedEquipment) {
        setHourlyData(generateEnergyHourlyData(selectedEquipment));
      }
    }, 500);
  };

  const sortedByConsumption = [...energyRecords].sort((a, b) => b.powerConsumption - a.powerConsumption);

  const pieData = energyRecords.map(r => ({
    name: r.equipmentName,
    value: r.powerConsumption,
  }));

  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      consumption: 450 + Math.random() * 150,
      standard: 500,
    };
  });

  const stats = [
    {
      label: '今日总电耗',
      value: totalConsumption.toFixed(1),
      unit: 'kWh',
      icon: Zap,
      color: 'text-industrial-400',
      trend: overLimitRate > 0 ? 'up' : 'down',
      trendText: `超标准 ${overLimitRate.toFixed(1)}%`,
    },
    {
      label: '标准电耗',
      value: totalStandard.toFixed(0),
      unit: 'kWh',
      icon: Gauge,
      color: 'text-dark-300',
      trend: 'none',
      trendText: '基准值',
    },
    {
      label: '超标设备',
      value: overLimitCount,
      unit: '台',
      icon: AlertTriangle,
      color: 'text-warning-500',
      trend: 'up',
      trendText: '需关注',
    },
    {
      label: '节能目标',
      value: ((1 - totalConsumption / (totalStandard * 1.1)) * 100).toFixed(1),
      unit: '%',
      icon: TrendingDown,
      color: 'text-success-500',
      trend: 'down',
      trendText: '较上周',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">能耗管理中心</h1>
          <p className="text-dark-400 text-sm">实时监控设备电耗，超标自动预警</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedEquipment}
            onChange={setSelectedEquipment}
            options={equipmentOptions}
            placeholder="全部设备"
            className="w-48"
          />
          <Button
            variant="secondary"
            icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
          >
            刷新
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-dark-800/50 border border-dark-600 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-sm">{stat.label}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className={`text-3xl font-bold font-mono ${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className="text-dark-400 text-sm">{stat.unit}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-dark-700 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <span className={
                stat.trend === 'up' ? 'text-danger-500' :
                stat.trend === 'down' ? 'text-success-500' : 'text-dark-400'
              }>
                {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
              </span>
              <span className="text-dark-400">{stat.trendText}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card
            title="24小时用电曲线"
            subtitle="实时功率消耗趋势"
            icon={<Activity className="w-5 h-5 text-industrial-400" />}
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData.map(d => ({ ...d, hour: `${d.hour}:00` }))}>
                  <defs>
                    <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#165DFF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#165DFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272e3b" />
                  <XAxis dataKey="hour" stroke="#4e5969" fontSize={11} />
                  <YAxis stroke="#4e5969" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value.toFixed(1)} kWh`, '电耗']}
                  />
                  <Area type="monotone" dataKey="consumption" stroke="#165DFF" fill="url(#energyGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card
            title="设备能耗占比"
            subtitle="各设备用电量分布"
            icon={<PieChartIcon className="w-5 h-5 text-warning-500" />}
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value.toFixed(1)} kWh`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card
            title="设备电耗排行"
            subtitle="按用电量从高到低排序"
            icon={<BarChart3 className="w-5 h-5" />}
          >
            <div className="space-y-3">
              {sortedByConsumption.map((record, idx) => (
                <div key={record.id} className="flex items-center gap-4">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx < 3 ? 'bg-industrial-500 text-white' : 'bg-dark-600 text-dark-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">{record.equipmentName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${
                          record.isOverLimit ? 'text-danger-500' : 'text-white'
                        }`}>
                          {record.powerConsumption.toFixed(1)} kWh
                        </span>
                        {record.isOverLimit && (
                          <Badge variant="danger" size="sm">超标</Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          record.isOverLimit ? 'bg-danger-500' : 'bg-industrial-500'
                        }`}
                        style={{ width: `${Math.min(100, (record.powerConsumption / sortedByConsumption[0].powerConsumption) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-dark-500 text-xs">标准: {record.standardConsumption} kWh</span>
                      <span className={`text-xs ${record.isOverLimit ? 'text-danger-500' : 'text-success-500'}`}>
                        {record.isOverLimit
                          ? `+${((record.powerConsumption - record.standardConsumption) / record.standardConsumption * 100).toFixed(1)}%`
                          : `-${((record.standardConsumption - record.powerConsumption) / record.standardConsumption * 100).toFixed(1)}%`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card
            title="能耗预警"
            subtitle="超标预警记录"
            icon={<Bell className="w-5 h-5 text-warning-500" />}
          >
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {energyRecords.filter(r => r.isOverLimit).map((record, idx) => (
                <div key={record.id} className="bg-danger-500/10 border border-danger-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{record.equipmentName}</p>
                      <p className="text-danger-400 text-xs mt-0.5">
                        电耗超标 {((record.powerConsumption - record.standardConsumption) / record.standardConsumption * 100).toFixed(1)}%
                      </p>
                      <p className="text-dark-400 text-xs mt-1">
                        {record.powerConsumption.toFixed(1)} / {record.standardConsumption} kWh
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {energyRecords.filter(r => r.isOverLimit).length === 0 && (
                <div className="text-center py-8">
                  <Zap className="w-10 h-10 text-success-500 mx-auto mb-2" />
                  <p className="text-success-500 text-sm">所有设备能耗正常</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card title="近7日能耗趋势" subtitle="每日用电量对比" icon={<TrendingUp className="w-5 h-5" />}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#272e3b" />
              <XAxis dataKey="date" stroke="#4e5969" fontSize={12} />
              <YAxis stroke="#4e5969" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="consumption" name="实际电耗(kWh)" fill="#165DFF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="standard" name="标准电耗(kWh)" fill="#4e5969" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function PieChartIcon(props: any) {
  return <PieChart {...props} />;
}
