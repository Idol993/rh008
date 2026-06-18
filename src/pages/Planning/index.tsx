import { useState, useMemo } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button } from '@/components/ui';
import {
  CalendarClock,
  Gauge,
  AlertTriangle,
  Clock,
  Play,
  ChevronLeft,
  ChevronRight,
  Factory,
  TrendingUp,
  ListTodo,
} from 'lucide-react';
import type { WorkOrder } from '@/types';

function GanttChart() {
  const workOrders = useMESStore((state) => state.workOrders);
  const equipments = useMESStore((state) => state.equipments);

  const groupedByEquipment = useMemo(() => {
    const groups: Record<string, WorkOrder[]> = {};
    equipments.forEach(eq => {
      groups[eq.id] = workOrders.filter(wo => wo.equipmentId === eq.id)
        .sort((a, b) => new Date(a.planStartTime).getTime() - new Date(b.planStartTime).getTime());
    });
    return groups;
  }, [workOrders, equipments]);

  const timeRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getTime() - 2 * 3600 * 1000);
    const end = new Date(now.getTime() + 24 * 3600 * 1000);
    return { start, end };
  }, []);

  const totalHours = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 3600);

  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const offset = (date.getTime() - timeRange.start.getTime()) / (1000 * 3600);
    return (offset / totalHours) * 100;
  };

  const getWidth = (start: string, end: string) => {
    const left = getPosition(start);
    const right = getPosition(end);
    return Math.max(2, right - left);
  };

  const hours = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= totalHours; i += 4) {
      const time = new Date(timeRange.start.getTime() + i * 3600 * 1000);
      arr.push({
        label: `${time.getHours().toString().padStart(2, '0')}:00`,
        position: (i / totalHours) * 100,
      });
    }
    return arr;
  }, [totalHours, timeRange.start]);

  const statusColors: Record<string, string> = {
    running: 'bg-success-500 border-success-400',
    pending: 'bg-dark-500 border-dark-400',
    paused: 'bg-warning-500 border-warning-400',
    completed: 'bg-industrial-500 border-industrial-400',
    abnormal: 'bg-danger-500 border-danger-400',
  };

  return (
    <div className="border border-dark-600 rounded-xl overflow-hidden">
      <div className="bg-dark-700/50 border-b border-dark-600 px-4 py-2">
        <p className="text-dark-400 text-xs">时间轴：{timeRange.start.toLocaleString('zh-CN')} - {timeRange.end.toLocaleString('zh-CN')}</p>
      </div>

      <div className="flex">
        <div className="w-36 flex-shrink-0 border-r border-dark-600">
          <div className="h-10 border-b border-dark-600 bg-dark-700/30 flex items-center px-3">
            <span className="text-dark-400 text-sm font-medium">设备</span>
          </div>
          {equipments.map((eq) => (
            <div key={eq.id} className="h-16 border-b border-dark-700/50 flex items-center px-3 hover:bg-dark-700/30">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  eq.status === 'running' ? 'bg-success-500' :
                  eq.status === 'idle' ? 'bg-dark-400' :
                  eq.status === 'fault' ? 'bg-danger-500' : 'bg-warning-500'
                }`} />
                <span className="text-white text-sm truncate">{eq.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="h-10 border-b border-dark-600 bg-dark-700/30 relative">
              {hours.map((h, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 border-l border-dark-600/50 flex items-start px-2"
                  style={{ left: `${h.position}%` }}
                >
                  <span className="text-dark-400 text-xs mt-2">{h.label}</span>
                </div>
              ))}
            </div>

            {equipments.map((eq) => (
              <div key={eq.id} className="h-16 border-b border-dark-700/50 relative hover:bg-dark-700/20">
                {hours.map((h, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 bottom-0 border-l border-dark-700/30"
                    style={{ left: `${h.position}%` }}
                  />
                ))}
                {groupedByEquipment[eq.id]?.map((wo) => {
                  const left = getPosition(wo.planStartTime);
                  const width = getWidth(wo.planStartTime, wo.planEndTime);
                  const progress = (wo.completedQty / wo.planQty) * 100;
                  return (
                    <div
                      key={wo.id}
                      className={`absolute top-2 bottom-2 rounded-md border ${statusColors[wo.status]} cursor-pointer transition-all hover:scale-y-110 overflow-hidden`}
                      style={{ left: `${Math.max(0, left)}%`, width: `${width}%` }}
                      title={`${wo.workOrderNo} - ${wo.productName}`}
                    >
                      <div
                        className="h-full bg-white/10"
                        style={{ width: `${progress}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-white text-xs font-mono truncate">
                          {wo.workOrderNo.slice(-6)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EquipmentLoadHeatmap() {
  const equipments = useMESStore((state) => state.equipments);
  const workOrders = useMESStore((state) => state.workOrders);

  const loadData = useMemo(() => {
    return equipments.map(eq => {
      const eqWOs = workOrders.filter(wo => wo.equipmentId === eq.id && (wo.status === 'running' || wo.status === 'pending'));
      let totalHours = 0;
      eqWOs.forEach(wo => {
        const start = new Date(wo.planStartTime).getTime();
        const end = new Date(wo.planEndTime).getTime();
        totalHours += (end - start) / (1000 * 3600);
      });
      const loadRate = Math.min(100, (totalHours / 24) * 100);
      return {
        id: eq.id,
        name: eq.name,
        loadRate,
        status: eq.status,
        workOrderCount: eqWOs.length,
      };
    });
  }, [equipments, workOrders]);

  const getLoadColor = (rate: number) => {
    if (rate >= 90) return 'bg-danger-500 text-white';
    if (rate >= 70) return 'bg-warning-500 text-white';
    if (rate >= 40) return 'bg-industrial-500 text-white';
    return 'bg-success-500 text-white';
  };

  const getBgColor = (rate: number) => {
    if (rate >= 90) return 'bg-danger-500/20 border-danger-500/30';
    if (rate >= 70) return 'bg-warning-500/20 border-warning-500/30';
    if (rate >= 40) return 'bg-industrial-500/20 border-industrial-500/30';
    return 'bg-success-500/20 border-success-500/30';
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {loadData.map((item) => (
        <div
          key={item.id}
          className={`border rounded-xl p-4 ${getBgColor(item.loadRate)} transition-all hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-white text-sm font-medium truncate">{item.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getLoadColor(item.loadRate)} font-mono`}>
              {item.loadRate.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                item.loadRate >= 90 ? 'bg-danger-500' :
                item.loadRate >= 70 ? 'bg-warning-500' :
                item.loadRate >= 40 ? 'bg-industrial-500' : 'bg-success-500'
              }`}
              style={{ width: `${item.loadRate}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-dark-400">{item.workOrderCount} 个工单</span>
            <span className={
              item.status === 'running' ? 'text-success-500' :
              item.status === 'fault' ? 'text-danger-500' : 'text-dark-400'
            }>
              {item.status === 'running' ? '运行中' : item.status === 'fault' ? '故障' : '待机'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingWorkOrders() {
  const workOrders = useMESStore((state) => state.workOrders);
  const startWorkOrder = useMESStore((state) => state.startWorkOrder);
  const currentUser = useMESStore((state) => state.currentUser);

  const pendingWOs = workOrders.filter(wo => wo.status === 'pending');

  const handleStart = (wo: WorkOrder) => {
    if (currentUser) {
      startWorkOrder(wo.id, currentUser.id, currentUser.name);
    }
  };

  const priorityColors = {
    high: 'bg-danger-500/20 text-danger-500 border-danger-500/30',
    medium: 'bg-warning-500/20 text-warning-500 border-warning-500/30',
    low: 'bg-dark-500/50 text-dark-300 border-dark-500',
  };

  const priorityLabels = {
    high: '高',
    medium: '中',
    low: '低',
  };

  return (
    <div className="space-y-3">
      {pendingWOs.length === 0 ? (
        <p className="text-dark-400 text-center py-8">暂无待排产工单</p>
      ) : (
        pendingWOs.map((wo) => (
          <div
            key={wo.id}
            className="bg-dark-700/50 border border-dark-600 rounded-xl p-4 hover:border-dark-500 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-industrial-400 font-mono text-sm">{wo.workOrderNo}</p>
                <p className="text-white font-medium">{wo.productName}</p>
              </div>
              <Badge variant="default" size="sm">{wo.equipmentName}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <p className="text-dark-400 text-xs">计划数量</p>
                <p className="text-white font-mono">{wo.planQty} 件</p>
              </div>
              <div>
                <p className="text-dark-400 text-xs">优先级</p>
                <p className={`text-xs font-medium ${
                  wo.priority === 'high' ? 'text-danger-500' :
                  wo.priority === 'medium' ? 'text-warning-500' : 'text-dark-400'
                }`}>
                  {priorityLabels[wo.priority]}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-dark-600">
              <div className="flex items-center gap-1 text-dark-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>{wo.planStartTime.slice(0, 16)}</span>
              </div>
              <Button size="sm" icon={<Play className="w-3.5 h-3.5" />} onClick={() => handleStart(wo)}>
                下发工单
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function Planning() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const workOrders = useMESStore((state) => state.workOrders);
  const equipments = useMESStore((state) => state.equipments);

  const totalLoad = useMemo(() => {
    const runningWOs = workOrders.filter(wo => wo.status === 'running' || wo.status === 'pending');
    let totalWorkHours = 0;
    runningWOs.forEach(wo => {
      const start = new Date(wo.planStartTime).getTime();
      const end = new Date(wo.planEndTime).getTime();
      totalWorkHours += (end - start) / (1000 * 3600);
    });
    const totalCapacity = equipments.length * 24;
    return (totalWorkHours / totalCapacity) * 100;
  }, [workOrders, equipments]);

  const stats = [
    { label: '今日计划工单', value: workOrders.filter(wo => wo.status !== 'completed').length, icon: ListTodo, color: 'text-industrial-400' },
    { label: '进行中', value: workOrders.filter(wo => wo.status === 'running').length, icon: Play, color: 'text-success-500' },
    { label: '设备平均负荷', value: totalLoad.toFixed(1) + '%', icon: Gauge, color: 'text-warning-500' },
    { label: '故障设备', value: equipments.filter(e => e.status === 'fault').length, icon: AlertTriangle, color: 'text-danger-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getTime() - 24 * 3600 * 1000))}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-white font-bold text-xl">
              {currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <p className="text-dark-400 text-sm">生产计划排程</p>
          </div>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getTime() + 24 * 3600 * 1000))}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-lg bg-industrial-500/20 text-industrial-400 text-sm hover:bg-industrial-500/30 transition-colors"
          >
            今日
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info" size="md">
            <Factory className="w-3.5 h-3.5 mr-1" />
            共 {equipments.length} 台设备
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
      </div>

      <Card title="设备负荷热力图" subtitle="各设备24小时负荷率分布" icon={<Gauge className="w-5 h-5" />}>
        <EquipmentLoadHeatmap />
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card title="甘特图排程" subtitle="拖拽可调整工单时间（演示）" icon={<CalendarClock className="w-5 h-5" />}>
            <GanttChart />
          </Card>
        </div>
        <div>
          <Card
            title="待下发工单"
            subtitle={`共 ${workOrders.filter(wo => wo.status === 'pending').length} 个工单待下发`}
            icon={<ListTodo className="w-5 h-5" />}
          >
            <PendingWorkOrders />
          </Card>
        </div>
      </div>
    </div>
  );
}
