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
  Zap,
  Info,
  X,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import type { WorkOrder, Order } from '@/types';

function GanttChart({ onWorkOrderClick }: { onWorkOrderClick?: (wo: WorkOrder) => void }) {
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
    const end = new Date(now.getTime() + 36 * 3600 * 1000);
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
      <div className="bg-dark-700/50 border-b border-dark-600 px-4 py-2 flex items-center justify-between">
        <p className="text-dark-400 text-xs">时间轴：{timeRange.start.toLocaleString('zh-CN')} - {timeRange.end.toLocaleString('zh-CN')}</p>
        <p className="text-dark-400 text-xs">点击工单可查看排程原因</p>
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
          <div className="min-w-[800px]">
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
                      className={`absolute top-2 bottom-2 rounded-md border ${statusColors[wo.status]} cursor-pointer transition-all hover:scale-y-110 overflow-hidden group`}
                      style={{ left: `${Math.max(0, left)}%`, width: `${width}%` }}
                      onClick={() => onWorkOrderClick?.(wo)}
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
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Info className="w-3 h-3 text-white/70 m-1" />
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
  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(null);

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
        <p className="text-dark-400 text-center py-8">暂无待下发工单</p>
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
            {wo.scheduleReason && (
              <div className="bg-dark-800/50 border border-dark-600/50 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-industrial-400 mb-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  排程原因
                </p>
                <p className="text-xs text-dark-300">{wo.scheduleReason}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-dark-600">
              <div className="flex items-center gap-1 text-dark-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>{wo.planStartTime.slice(0, 16)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedWo(wo)}
                  className="text-xs text-dark-400 hover:text-industrial-400 transition-colors"
                >
                  详情
                </button>
                <Button size="sm" icon={<Play className="w-3.5 h-3.5" />} onClick={() => handleStart(wo)}>
                  下发
                </Button>
              </div>
            </div>
          </div>
        ))
      )}

      {selectedWo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-dark-600 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">{selectedWo.workOrderNo}</h3>
                <p className="text-dark-400 text-sm">{selectedWo.productName}</p>
              </div>
              <button onClick={() => setSelectedWo(null)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs">计划数量</p>
                  <p className="text-white font-mono font-bold">{selectedWo.planQty} 件</p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs">生产设备</p>
                  <p className="text-white font-medium">{selectedWo.equipmentName}</p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs">计划开始</p>
                  <p className="text-white text-sm font-mono">{selectedWo.planStartTime}</p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs">计划结束</p>
                  <p className="text-white text-sm font-mono">{selectedWo.planEndTime}</p>
                </div>
              </div>
              {selectedWo.scheduleReason && (
                <div className="bg-industrial-500/10 border border-industrial-500/30 rounded-lg p-3">
                  <p className="text-industrial-400 text-xs font-medium mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    智能排程决策原因
                  </p>
                  <p className="text-dark-200 text-sm">{selectedWo.scheduleReason}</p>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-dark-600 flex justify-end">
              <Button variant="ghost" onClick={() => setSelectedWo(null)}>关闭</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PendingOrderPool({ onScheduleOne, onScheduleAll }: {
  onScheduleOne: (order: Order) => void;
  onScheduleAll: () => void;
}) {
  const orders = useMESStore((state) => state.orders);
  const pendingOrders = useMemo(() =>
    orders.filter(o => o.status === 'pending')
      .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()),
    [orders]
  );

  const getUrgency = (deliveryDate: string) => {
    const days = Math.ceil((new Date(deliveryDate).getTime() - Date.now()) / (24 * 3600 * 1000));
    if (days <= 3) return { label: '紧急', color: 'danger' };
    if (days <= 7) return { label: '较急', color: 'warning' };
    return { label: '正常', color: 'default' };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-dark-400 text-sm">共 {pendingOrders.length} 个待排订单</p>
        {pendingOrders.length > 0 && (
          <Button
            size="sm"
            variant="primary"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={onScheduleAll}
          >
            一键智能排程
          </Button>
        )}
      </div>

      {pendingOrders.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-10 h-10 text-success-500/50 mx-auto mb-2" />
          <p className="text-dark-400 text-sm">所有订单均已排程</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {pendingOrders.map((order) => {
            const urgency = getUrgency(order.deliveryDate);
            return (
              <div
                key={order.id}
                className="bg-dark-700/50 border border-dark-600 rounded-lg p-3 hover:border-industrial-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="min-w-0">
                    <p className="text-industrial-400 font-mono text-xs">{order.orderNo}</p>
                    <p className="text-white text-sm font-medium truncate">{order.productName}</p>
                  </div>
                  <Badge size="sm" variant={urgency.color as any}>
                    {urgency.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-dark-400">
                    <ShoppingCart className="w-3 h-3" />
                    <span>{order.quantity} 件</span>
                  </div>
                  <div className="flex items-center gap-1 text-warning-500">
                    <CalendarClock className="w-3 h-3" />
                    <span>{order.deliveryDate.slice(5)}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onScheduleOne(order)}
                  >
                    排程
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Planning() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const workOrders = useMESStore((state) => state.workOrders);
  const equipments = useMESStore((state) => state.equipments);
  const orders = useMESStore((state) => state.orders);
  const scheduleAllPendingOrders = useMESStore((state) => state.scheduleAllPendingOrders);
  const generateWorkOrders = useMESStore((state) => state.generateWorkOrders);
  const addAlert = useMESStore((state) => state.addAlert);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [scheduleResult, setScheduleResult] = useState<{
    show: boolean;
    totalScheduled: number;
    totalUnscheduled: number;
    unscheduledSteps: { orderNo: string; processName: string; reason: string }[];
  } | null>(null);

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

  const handleScheduleOne = (order: Order) => {
    const result = generateWorkOrders(order.id);
    addAlert({
      type: 'equipment',
      level: result.unscheduled.length > 0 ? 'warning' : 'info',
      title: `订单 ${order.orderNo} 排程完成`,
      message: `成功 ${result.scheduled.length} 道${result.unscheduled.length > 0 ? `，未排 ${result.unscheduled.length} 道` : ''}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      relatedId: order.id,
    });
  };

  const handleScheduleAll = () => {
    const result = scheduleAllPendingOrders();
    setScheduleResult({
      show: true,
      totalScheduled: result.totalScheduled,
      totalUnscheduled: result.totalUnscheduled,
      unscheduledSteps: result.unscheduledSteps,
    });
    if (result.totalScheduled > 0) {
      addAlert({
        type: 'equipment',
        level: 'info',
        title: '一键智能排程完成',
        message: `共生成 ${result.totalScheduled} 道工${result.totalUnscheduled > 0 ? `，${result.totalUnscheduled} 道未排` : ''}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        relatedId: 'all',
      });
    }
  };

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
          <Badge variant="industrial" size="md">
            <Zap className="w-3.5 h-3.5 mr-1" />
            待排 {orders.filter(o => o.status === 'pending').length} 个订单
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

      <Card
        title="待排程订单池"
        subtitle="按交期从近到远排序，近交期订单优先占用设备"
        icon={<ListTodo className="w-5 h-5 text-industrial-400" />}
        action={
          orders.filter(o => o.status === 'pending').length > 0 && (
            <Button
              size="sm"
              variant="primary"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={handleScheduleAll}
            >
              一键智能排程
            </Button>
          )
        }
      >
        <PendingOrderPool onScheduleOne={handleScheduleOne} onScheduleAll={handleScheduleAll} />
      </Card>

      <Card title="设备负荷热力图" subtitle="各设备24小时负荷率分布" icon={<Gauge className="w-5 h-5" />}>
        <EquipmentLoadHeatmap />
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card title="甘特图排程" subtitle="点击工单可查看排程原因" icon={<CalendarClock className="w-5 h-5" />}>
            <GanttChart onWorkOrderClick={setSelectedWorkOrder} />
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

      {selectedWorkOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-dark-600 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">{selectedWorkOrder.workOrderNo}</h3>
                <p className="text-dark-400 text-sm">{selectedWorkOrder.productName}</p>
              </div>
              <button onClick={() => setSelectedWorkOrder(null)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs">计划数量</p>
                  <p className="text-white font-mono font-bold">{selectedWorkOrder.planQty} 件</p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs">生产设备</p>
                  <p className="text-white text-sm">{selectedWorkOrder.equipmentName}</p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs">计划开始</p>
                  <p className="text-white text-xs font-mono">{selectedWorkOrder.planStartTime}</p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs">计划结束</p>
                  <p className="text-white text-xs font-mono">{selectedWorkOrder.planEndTime}</p>
                </div>
              </div>
              {selectedWorkOrder.scheduleReason && (
                <div className="bg-industrial-500/10 border border-industrial-500/30 rounded-lg p-3">
                  <p className="text-industrial-400 text-xs font-medium mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    智能排程决策原因
                  </p>
                  <p className="text-dark-200 text-sm leading-relaxed">{selectedWorkOrder.scheduleReason}</p>
                </div>
              )}
              {!selectedWorkOrder.scheduleReason && (
                <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-3">
                  <p className="text-dark-400 text-sm">该工单为手动创建，无排程决策记录</p>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-dark-600 flex justify-end">
              <Button variant="ghost" onClick={() => setSelectedWorkOrder(null)}>关闭</Button>
            </div>
          </div>
        </div>
      )}

      {scheduleResult?.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-dark-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-industrial-500/20">
                  <Sparkles className="w-5 h-5 text-industrial-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">一键智能排程结果</h3>
                  <p className="text-dark-400 text-sm">基于 EDD + 负荷均衡 + 故障排除</p>
                </div>
              </div>
              <button onClick={() => setScheduleResult(null)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-success-500/10 border border-success-500/30 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold font-mono text-success-500">{scheduleResult.totalScheduled}</p>
                  <p className="text-dark-300 text-sm mt-1">成功排程工序</p>
                </div>
                <div className={`${scheduleResult.totalUnscheduled > 0 ? 'bg-warning-500/10 border-warning-500/30' : 'bg-dark-700/50 border-dark-600'} rounded-xl p-4 text-center`}>
                  <p className={`text-3xl font-bold font-mono ${scheduleResult.totalUnscheduled > 0 ? 'text-warning-500' : 'text-dark-400'}`}>
                    {scheduleResult.totalUnscheduled}
                  </p>
                  <p className="text-dark-300 text-sm mt-1">未排程工序</p>
                </div>
              </div>

              {scheduleResult.unscheduledSteps.length > 0 && (
                <div className="bg-warning-500/5 border border-warning-500/20 rounded-xl p-4">
                  <p className="text-warning-500 text-sm font-medium mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    未排程工序详情
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {scheduleResult.unscheduledSteps.map((step, idx) => (
                      <div key={idx} className="bg-dark-700/50 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm font-medium">{step.orderNo}</span>
                          <Badge size="sm" variant="warning">{step.processName}</Badge>
                        </div>
                        <p className="text-dark-300 text-xs flex items-start gap-1.5">
                          <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {step.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-dark-400 text-xs">
                💡 排程策略：按交期从近到远排序，故障/维护设备自动跳过，同类型设备中选择空闲最早且负荷最低的
              </p>
            </div>
            <div className="px-5 py-3 border-t border-dark-600 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setScheduleResult(null)}>知道了</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
