import { useState, useEffect } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button } from '@/components/ui';
import {
  Cpu,
  Thermometer,
  Gauge,
  Zap,
  AlertTriangle,
  Wrench,
  Clock,
  Play,
  CheckCircle,
  User,
  Activity,
  RefreshCw,
  Bell,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import type { Equipment, EquipmentData } from '@/types';

const statusMap = {
  running: { label: '运行中', variant: 'success' as const, color: 'text-success-500' },
  idle: { label: '待机', variant: 'default' as const, color: 'text-dark-400' },
  maintenance: { label: '维护中', variant: 'warning' as const, color: 'text-warning-500' },
  fault: { label: '故障', variant: 'danger' as const, color: 'text-danger-500' },
};

function EquipmentMonitorDetail({ equipment, onClose }: { equipment: Equipment; onClose: () => void }) {
  const [historyData, setHistoryData] = useState<EquipmentData[]>([]);
  const getEquipmentData = useMESStore((state) => state.getEquipmentData);
  const updateEquipmentData = useMESStore((state) => state.updateEquipmentData);
  const addMaintenanceOrder = useMESStore((state) => state.addMaintenanceOrder);
  const addAlert = useMESStore((state) => state.addAlert);

  useEffect(() => {
    setHistoryData(getEquipmentData(equipment.id));
  }, [equipment.id, getEquipmentData]);

  useEffect(() => {
    if (equipment.status !== 'running') return;
    const interval = setInterval(() => {
      const newData: EquipmentData = {
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        temperature: equipment.currentTemperature + (Math.random() - 0.5) * 5,
        speed: Math.max(0, equipment.currentSpeed + (Math.random() - 0.5) * 100),
        power: Math.max(0, equipment.currentPower + (Math.random() - 0.5) * 2),
      };
      updateEquipmentData(equipment.id, newData);
      setHistoryData(prev => [...prev.slice(-100), newData]);
    }, 2000);
    return () => clearInterval(interval);
  }, [equipment, updateEquipmentData]);

  const handleCreateMaintenance = () => {
    addMaintenanceOrder({
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      faultType: '人工报修',
      faultDesc: `${equipment.name} 需要维护检查`,
      status: 'pending',
    });
    addAlert({
      type: 'equipment',
      level: 'warning',
      title: `${equipment.name} 报修`,
      message: '已创建设备维修工单',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      relatedId: equipment.id,
    });
  };

  const chartData = historyData.slice(-30).map(d => ({
    time: d.timestamp.split(' ')[1],
    temperature: parseFloat(d.temperature.toFixed(1)),
    speed: parseFloat(d.speed.toFixed(0)),
    power: parseFloat(d.power.toFixed(2)),
  }));

  const isTempWarning = equipment.currentTemperature > equipment.temperatureThreshold.max * 0.85;
  const isPowerWarning = equipment.currentPower > equipment.powerThreshold.max * 0.9;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-white font-bold text-lg">{equipment.name}</h2>
              <Badge variant={statusMap[equipment.status].variant}>
                {statusMap[equipment.status].label}
              </Badge>
            </div>
            <p className="text-dark-400 text-sm mt-0.5">{equipment.code} · {equipment.type}</p>
          </div>
          <div className="flex gap-2">
            {equipment.status === 'running' && (
              <Button variant="secondary" size="sm" icon={<Wrench className="w-4 h-4" />} onClick={handleCreateMaintenance}>
                报修
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>关闭</Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className={`bg-dark-700/50 border rounded-xl p-4 ${
              isTempWarning ? 'border-warning-500/50' : 'border-dark-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className={`w-5 h-5 ${isTempWarning ? 'text-warning-500' : 'text-industrial-400'}`} />
                <span className="text-dark-400 text-sm">温度</span>
              </div>
              <p className={`text-3xl font-bold font-mono ${isTempWarning ? 'text-warning-500' : 'text-white'}`}>
                {equipment.currentTemperature.toFixed(1)}
                <span className="text-lg ml-1">°C</span>
              </p>
              <p className="text-dark-500 text-xs mt-1">阈值: {equipment.temperatureThreshold.min}-{equipment.temperatureThreshold.max}°C</p>
            </div>

            <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-5 h-5 text-industrial-400" />
                <span className="text-dark-400 text-sm">转速</span>
              </div>
              <p className="text-3xl font-bold font-mono text-white">
                {equipment.currentSpeed.toFixed(0)}
                <span className="text-lg ml-1">rpm</span>
              </p>
              <p className="text-dark-500 text-xs mt-1">最大: {equipment.speedThreshold.max} rpm</p>
            </div>

            <div className={`bg-dark-700/50 border rounded-xl p-4 ${
              isPowerWarning ? 'border-danger-500/50' : 'border-dark-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className={`w-5 h-5 ${isPowerWarning ? 'text-danger-500' : 'text-industrial-400'}`} />
                <span className="text-dark-400 text-sm">功率</span>
              </div>
              <p className={`text-3xl font-bold font-mono ${isPowerWarning ? 'text-danger-500' : 'text-white'}`}>
                {equipment.currentPower.toFixed(1)}
                <span className="text-lg ml-1">kW</span>
              </p>
              <p className="text-dark-500 text-xs mt-1">上限: {equipment.powerThreshold.max} kW</p>
            </div>

            <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-industrial-400" />
                <span className="text-dark-400 text-sm">OEE</span>
              </div>
              <p className="text-3xl font-bold font-mono text-industrial-400">
                {equipment.oee.toFixed(1)}%
              </p>
              <p className="text-dark-500 text-xs mt-1">产能: {equipment.capacityPerHour} 件/小时</p>
            </div>
          </div>

          <Card title="温度变化趋势" subtitle="近10分钟温度数据">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF7D00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF7D00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272e3b" />
                  <XAxis dataKey="time" stroke="#4e5969" fontSize={11} />
                  <YAxis stroke="#4e5969" fontSize={11} domain={[20, 80]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="temperature" stroke="#FF7D00" fill="url(#tempGradient)" strokeWidth={2} name="温度(°C)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card title="转速变化" subtitle="实时转速监控">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#272e3b" />
                    <XAxis dataKey="time" stroke="#4e5969" fontSize={10} />
                    <YAxis stroke="#4e5969" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="speed" stroke="#165DFF" strokeWidth={2} dot={false} name="转速(rpm)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="功率变化" subtitle="实时功率监控">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#272e3b" />
                    <XAxis dataKey="time" stroke="#4e5969" fontSize={10} />
                    <YAxis stroke="#4e5969" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="power" stroke="#00B42A" strokeWidth={2} dot={false} name="功率(kW)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintenanceOrdersList() {
  const maintenanceOrders = useMESStore((state) => state.maintenanceOrders);

  const statusMap = {
    pending: { label: '待处理', variant: 'warning' as const },
    processing: { label: '处理中', variant: 'info' as const },
    completed: { label: '已完成', variant: 'success' as const },
  };

  return (
    <div className="space-y-3">
      {maintenanceOrders.length === 0 ? (
        <p className="text-dark-400 text-center py-6">暂无维修工单</p>
      ) : (
        maintenanceOrders.map((mo) => (
          <div key={mo.id} className="bg-dark-700/50 border border-dark-600 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wrench className={`w-4 h-4 ${
                  mo.status === 'pending' ? 'text-warning-500' :
                  mo.status === 'processing' ? 'text-industrial-400' : 'text-success-500'
                }`} />
                <span className="text-industrial-400 font-mono text-sm">{mo.maintenanceNo}</span>
              </div>
              <Badge variant={statusMap[mo.status].variant} size="sm">
                {statusMap[mo.status].label}
              </Badge>
            </div>
            <p className="text-white text-sm font-medium">{mo.equipmentName}</p>
            <p className="text-dark-400 text-xs mt-1">{mo.faultDesc}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-600/50">
              <div className="flex items-center gap-1 text-dark-400 text-xs">
                <User className="w-3 h-3" />
                <span>{mo.assigneeName || '未分配'}</span>
              </div>
              <div className="flex items-center gap-1 text-dark-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>{mo.createTime.slice(11, 16)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function Equipment() {
  const equipments = useMESStore((state) => state.equipments);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const stats = [
    { label: '设备总数', value: equipments.length, icon: Cpu, color: 'text-industrial-400' },
    { label: '运行中', value: equipments.filter(e => e.status === 'running').length, icon: Play, color: 'text-success-500' },
    { label: '故障', value: equipments.filter(e => e.status === 'fault').length, icon: AlertTriangle, color: 'text-danger-500' },
    { label: '维护中', value: equipments.filter(e => e.status === 'maintenance').length, icon: Wrench, color: 'text-warning-500' },
  ];

  const avgOEE = equipments.reduce((sum, e) => sum + e.oee, 0) / equipments.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">设备监控中心</h1>
          <p className="text-dark-400 text-sm">实时监控设备运行状态与参数</p>
        </div>
        <Button
          variant="secondary"
          icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
          onClick={handleRefresh}
        >
          刷新数据
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-dark-800/50 border border-dark-600 rounded-xl p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-dark-700 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">{stat.label}</p>
              <p className="text-white text-2xl font-bold font-mono">{stat.value}</p>
            </div>
          </div>
        ))}
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-dark-700 text-industrial-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <p className="text-dark-400 text-sm">平均OEE</p>
            <p className="text-industrial-400 text-2xl font-bold font-mono">{avgOEE.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card
            title="设备状态总览"
            subtitle="点击设备查看详细参数"
            icon={<Cpu className="w-5 h-5" />}
          >
            <div className="grid grid-cols-2 gap-4">
              {equipments.map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => setSelectedEq(eq)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                    eq.status === 'running' ? 'border-success-500/30 bg-success-500/5' :
                    eq.status === 'fault' ? 'border-danger-500/30 bg-danger-500/5' :
                    eq.status === 'maintenance' ? 'border-warning-500/30 bg-warning-500/5' :
                    'border-dark-600 bg-dark-700/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-medium">{eq.name}</h3>
                      <p className="text-dark-400 text-xs">{eq.code}</p>
                    </div>
                    <Badge
                      variant={
                        eq.status === 'running' ? 'success' :
                        eq.status === 'fault' ? 'danger' :
                        eq.status === 'maintenance' ? 'warning' : 'default'
                      }
                      size="sm"
                    >
                      {statusMap[eq.status].label}
                    </Badge>
                  </div>

                  {eq.status === 'running' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-dark-400 text-xs">温度</p>
                        <p className={`text-sm font-mono font-bold ${
                          eq.currentTemperature > 60 ? 'text-warning-500' : 'text-white'
                        }`}>
                          {eq.currentTemperature.toFixed(0)}°C
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-dark-400 text-xs">转速</p>
                        <p className="text-sm font-mono font-bold text-white">{eq.currentSpeed.toFixed(0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-dark-400 text-xs">功率</p>
                        <p className="text-sm font-mono font-bold text-white">{eq.currentPower.toFixed(1)}kW</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-dark-600/50 flex items-center justify-between">
                    <span className="text-dark-400 text-xs">OEE</span>
                    <span className={`text-sm font-mono font-bold ${
                      eq.oee >= 85 ? 'text-success-500' : eq.oee >= 70 ? 'text-warning-500' : 'text-danger-500'
                    }`}>
                      {eq.oee.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card
            title="维修工单"
            subtitle="设备异常维修记录"
            icon={<Wrench className="w-5 h-5 text-warning-500" />}
          >
            <MaintenanceOrdersList />
          </Card>
        </div>
      </div>

      {selectedEq && (
        <EquipmentMonitorDetail equipment={selectedEq} onClose={() => setSelectedEq(null)} />
      )}
    </div>
  );
}
