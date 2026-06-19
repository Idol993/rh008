import { useState, useMemo } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button, Select } from '@/components/ui';
import type { WorkOrder, Order, ScheduleDraft, OrderScheduleDraft, RiskLevel } from '@/types';
import {
  CalendarClock,
  Gauge,
  AlertTriangle,
  Clock,
  Play,
  ChevronLeft,
  ChevronRight,
  Factory,
  ListTodo,
  Zap,
  Info,
  X,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Sparkles,
  Eye,
  RotateCcw,
  AlertCircle,
  Clock3,
  TrendingDown,
} from 'lucide-react';

const riskLevelMap: Record<RiskLevel, { label: string; color: string; bgColor: string; borderColor: string }> = {
  none: { label: '正常', color: 'text-success-500', bgColor: 'bg-success-500/20', borderColor: 'border-success-500/30' },
  low: { label: '较低', color: 'text-industrial-400', bgColor: 'bg-industrial-500/20', borderColor: 'border-industrial-500/30' },
  medium: { label: '中等', color: 'text-warning-500', bgColor: 'bg-warning-500/20', borderColor: 'border-warning-500/30' },
  high: { label: '较高', color: 'text-danger-500', bgColor: 'bg-danger-500/20', borderColor: 'border-danger-500/30' },
  critical: { label: '严重', color: 'text-danger-600', bgColor: 'bg-danger-600/20', borderColor: 'border-danger-600/50' },
};

function GanttChart({
  riskFilter = 'all',
  onWorkOrderClick,
  draftWorkOrders,
}: {
  riskFilter?: string;
  onWorkOrderClick?: (wo: WorkOrder) => void;
  draftWorkOrders?: WorkOrder[];
}) {
  const workOrders = useMESStore((state) => state.workOrders);
  const equipments = useMESStore((state) => state.equipments);

  const displayWorkOrders = useMemo(() => {
    let list = draftWorkOrders ? draftWorkOrders : workOrders;
    if (riskFilter !== 'all') {
      list = list.filter(wo => wo.riskLevel === riskFilter);
    }
    return list;
  }, [workOrders, draftWorkOrders, riskFilter]);

  const groupedByEquipment = useMemo(() => {
    const groups: Record<string, WorkOrder[]> = {};
    equipments.forEach(eq => {
      groups[eq.id] = displayWorkOrders.filter(wo => wo.equipmentId === eq.id)
        .sort((a, b) => new Date(a.planStartTime).getTime() - new Date(b.planStartTime).getTime());
    });
    return groups;
  }, [displayWorkOrders, equipments]);

  const timeRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getTime() - 2 * 3600 * 1000);
    const end = new Date(now.getTime() + 48 * 3600 * 1000);
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
    for (let i = 0; i <= totalHours; i += 6) {
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

  const riskBorderColors: Record<RiskLevel, string> = {
    none: '',
    low: 'ring-2 ring-industrial-500/50',
    medium: 'ring-2 ring-warning-500/50',
    high: 'ring-2 ring-danger-500/70',
    critical: 'ring-2 ring-danger-600 animate-pulse',
  };

  return (
    <div className="border border-dark-600 rounded-xl overflow-hidden">
      <div className="bg-dark-700/50 border-b border-dark-600 px-4 py-2 flex items-center justify-between">
        <p className="text-dark-400 text-xs">
          时间范围：{timeRange.start.toLocaleDateString('zh-CN')} {timeRange.start.getHours()}:00 - {timeRange.end.toLocaleDateString('zh-CN')} {timeRange.end.getHours()}:00
        </p>
        <div className="flex items-center gap-2">
          {draftWorkOrders && (
            <Badge variant="industrial" size="sm">预览模式</Badge>
          )}
          <p className="text-dark-400 text-xs">点击工单可查看详情</p>
        </div>
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
          <div className="min-w-[1000px]">
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
                  const risk = wo.riskLevel || 'none';
                  return (
                    <div
                      key={wo.id}
                      className={`absolute top-2 bottom-2 rounded-md border ${statusColors[wo.status]} ${riskBorderColors[risk]} cursor-pointer transition-all hover:scale-y-110 overflow-hidden group`}
                      style={{ left: `${Math.max(0, left)}%`, width: `${width}%` }}
                      onClick={() => onWorkOrderClick?.(wo)}
                      title={`${wo.workOrderNo} - ${wo.productName}${risk !== 'none' ? ` [${riskLevelMap[risk].label}风险]` : ''}`}
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
                      {risk !== 'none' && (
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <AlertTriangle className="w-3 h-3 text-warning-400 m-1" />
                        </div>
                      )}
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

  const priorityLabels: Record<string, string> = { high: '高', medium: '中', low: '低' };

  return (
    <div className="space-y-3">
      {pendingWOs.length === 0 ? (
        <p className="text-dark-400 text-center py-8">暂无待下发工单</p>
      ) : (
        pendingWOs.map((wo) => {
          const risk = wo.riskLevel || 'none';
          const riskInfo = riskLevelMap[risk];
          return (
            <div
              key={wo.id}
              className={`bg-dark-700/50 border rounded-xl p-4 hover:border-dark-500 transition-all ${riskInfo.borderColor}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <p className="text-industrial-400 font-mono text-sm">{wo.workOrderNo}</p>
                  <p className="text-white font-medium">{wo.productName}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="default" size="sm">{wo.equipmentName}</Badge>
                  {risk !== 'none' && (
                    <Badge size="sm" variant={risk === 'high' || risk === 'critical' ? 'danger' : risk === 'medium' ? 'warning' : 'industrial'}>
                      <AlertTriangle className="w-3 h-3 mr-0.5" />
                      {riskInfo.label}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
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
                  <p className="text-xs text-dark-300 line-clamp-2">{wo.scheduleReason}</p>
                </div>
              )}
              {wo.riskReasons && wo.riskReasons.length > 0 && (
                <div className="bg-warning-500/10 border border-warning-500/30 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-warning-500 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    风险提示
                  </p>
                  <p className="text-xs text-dark-300">{wo.riskReasons[0]}</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-dark-600">
                <div className="flex items-center gap-1 text-dark-400 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{wo.planStartTime.slice(5, 16)}</span>
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
          );
        })
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
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs">计划数量</p>
                  <p className="text-white font-mono font-bold">{selectedWo.planQty} 件</p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs">生产设备</p>
                  <p className="text-white text-sm">{selectedWo.equipmentName}</p>
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
                  <p className="text-dark-200 text-sm leading-relaxed">{selectedWo.scheduleReason}</p>
                </div>
              )}
              {selectedWo.riskReasons && selectedWo.riskReasons.length > 0 && (
                <div className="bg-warning-500/10 border border-warning-500/30 rounded-lg p-3">
                  <p className="text-warning-500 text-xs font-medium mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    风险提示 ({riskLevelMap[selectedWo.riskLevel || 'none'].label})
                  </p>
                  <ul className="space-y-1">
                    {selectedWo.riskReasons.map((r, i) => (
                      <li key={i} className="text-dark-200 text-sm flex items-start gap-1.5">
                        <span className="text-warning-500 mt-1">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
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

function PendingOrderPool({
  onScheduleOne,
  onGenerateDraft,
  riskFilter,
  onRiskFilterChange,
}: {
  onScheduleOne: (order: Order) => void;
  onGenerateDraft: () => void;
  riskFilter: string;
  onRiskFilterChange: (v: string) => void;
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

  const riskOptions = [
    { value: 'all', label: '全部风险' },
    { value: 'high', label: '高风险' },
    { value: 'medium', label: '中风险' },
    { value: 'low', label: '低风险' },
    { value: 'none', label: '无风险' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-dark-400 text-sm">共 {pendingOrders.length} 个待排订单</p>
        <div className="flex items-center gap-2">
          <Select
            value={riskFilter}
            onChange={onRiskFilterChange}
            options={riskOptions}
            className="w-28"
            size="sm"
          />
          {pendingOrders.length > 0 && (
            <Button
              size="sm"
              variant="primary"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={onGenerateDraft}
            >
              生成排程方案
            </Button>
          )}
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-10 h-10 text-success-500/50 mx-auto mb-2" />
          <p className="text-dark-400 text-sm">所有订单均已排程</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {pendingOrders.map((order) => {
            const urgency = getUrgency(order.deliveryDate);
            return (
              <div
                key={order.id}
                className="bg-dark-700/50 border border-dark-600 rounded-lg p-3 hover:border-industrial-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="min-w-0 flex-1">
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
                    单排
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

function ScheduleDraftModal({
  draft,
  onConfirm,
  onCancel,
}: {
  draft: ScheduleDraft;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(
    draft.orderDrafts.find(o => o.riskLevel === 'high' || o.riskLevel === 'critical')?.orderId ||
    draft.orderDrafts[0]?.orderId || null
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
        <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-industrial-500/20">
              <Eye className="w-5 h-5 text-industrial-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">排程方案预览</h2>
              <p className="text-dark-400 text-sm">生成时间：{draft.generatedAt}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-dark-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 bg-dark-700/30 border-b border-dark-600 flex-shrink-0">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-dark-800 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold font-mono text-industrial-400">{draft.totalScheduled}</p>
              <p className="text-dark-400 text-xs mt-1">计划排程工序</p>
            </div>
            <div className="bg-dark-800 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold font-mono ${draft.totalUnscheduled > 0 ? 'text-warning-500' : 'text-dark-400'}`}>
                {draft.totalUnscheduled}
              </p>
              <p className="text-dark-400 text-xs mt-1">未排工序</p>
            </div>
            <div className="bg-dark-800 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold font-mono ${draft.highRiskCount > 0 ? 'text-danger-500' : 'text-success-500'}`}>
                {draft.highRiskCount}
              </p>
              <p className="text-dark-400 text-xs mt-1">高风险订单</p>
            </div>
            <div className="bg-dark-800 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold font-mono text-white">{draft.orderDrafts.length}</p>
              <p className="text-dark-400 text-xs mt-1">涉及订单</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {draft.orderDrafts.map((od) => {
              const risk = riskLevelMap[od.riskLevel];
              const isExpanded = expandedOrder === od.orderId;
              return (
                <div
                  key={od.orderId}
                  className={`border rounded-xl overflow-hidden transition-all ${risk.borderColor} ${isExpanded ? 'bg-dark-700/50' : 'bg-dark-750'}`}
                >
                  <div
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-dark-700/50"
                    onClick={() => setExpandedOrder(isExpanded ? null : od.orderId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        od.riskLevel === 'critical' ? 'bg-danger-600 animate-pulse' :
                        od.riskLevel === 'high' ? 'bg-danger-500' :
                        od.riskLevel === 'medium' ? 'bg-warning-500' :
                        od.riskLevel === 'low' ? 'bg-industrial-500' : 'bg-success-500'
                      }`} />
                      <div>
                        <p className="text-white font-medium flex items-center gap-2">
                          {od.orderNo}
                          <span className="text-dark-400 font-normal text-sm">{od.productName}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-dark-400 text-xs flex items-center gap-1">
                            <Clock3 className="w-3 h-3" />
                            交期：{od.deliveryDate}
                          </span>
                          <span className={`text-xs flex items-center gap-1 ${od.onTime ? 'text-success-500' : 'text-danger-500'}`}>
                            {od.onTime ? <CheckCircle2 className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {od.onTime ? '可按时交付' : '预计延误'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge size="sm" variant={
                        od.riskLevel === 'critical' || od.riskLevel === 'high' ? 'danger' :
                        od.riskLevel === 'medium' ? 'warning' :
                        od.riskLevel === 'low' ? 'industrial' : 'success'
                      }>
                        {risk.label}风险
                      </Badge>
                      <ChevronRight className={`w-4 h-4 text-dark-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-dark-600/50 pt-3 space-y-3">
                      {od.riskReasons.length > 0 && (
                        <div className="bg-warning-500/5 border border-warning-500/20 rounded-lg p-3">
                          <p className="text-warning-500 text-xs font-medium mb-1.5 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            风险提示
                          </p>
                          <ul className="space-y-1">
                            {od.riskReasons.map((r, i) => (
                              <li key={i} className="text-dark-300 text-xs flex items-start gap-1.5">
                                <span className="text-warning-500 mt-0.5">•</span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <p className="text-dark-400 text-xs mb-2">工序排程详情 ({od.scheduledSteps.length} 道)</p>
                        <div className="space-y-2">
                          {od.scheduledSteps.map((step, idx) => (
                            <div key={idx} className="bg-dark-800 rounded-lg p-2.5 flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-industrial-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-industrial-400 text-xs font-bold">{idx + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium">{step.workOrder.processName}</p>
                                <p className="text-dark-400 text-xs">{step.workOrder.equipmentName}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-white text-xs font-mono">
                                  {step.workOrder.planStartTime.slice(11, 16)} - {step.workOrder.planEndTime.slice(11, 16)}
                                </p>
                                <p className="text-dark-500 text-xs">{step.workOrder.planQty} 件</p>
                              </div>
                              {step.riskLevel !== 'none' && (
                                <Badge size="sm" variant={step.riskLevel === 'high' ? 'danger' : 'warning'}>
                                  {riskLevelMap[step.riskLevel].label}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {od.unscheduledSteps.length > 0 && (
                        <div>
                          <p className="text-danger-500 text-xs mb-2">未排程工序 ({od.unscheduledSteps.length} 道)</p>
                          <div className="space-y-2">
                            {od.unscheduledSteps.map((step, idx) => (
                              <div key={idx} className="bg-danger-500/10 border border-danger-500/30 rounded-lg p-2.5 flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                                <div>
                                  <p className="text-white text-sm">{step.processName}</p>
                                  <p className="text-danger-400 text-xs">{step.reason}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-dark-400 flex items-center gap-1 pt-1">
                        <Clock3 className="w-3 h-3" />
                        预计完成：{od.estimatedDeliveryTime}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-dark-600 flex items-center justify-between flex-shrink-0">
          <p className="text-dark-400 text-xs">
            💡 排程策略：EDD 交期优先 + 负荷均衡 + 故障/维护设备自动排除
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<RotateCcw className="w-4 h-4" />} onClick={onCancel}>
              取消
            </Button>
            <Button variant="primary" icon={<CheckCircle2 className="w-4 h-4" />} onClick={onConfirm}>
              确认排程
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Planning() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const workOrders = useMESStore((state) => state.workOrders);
  const equipments = useMESStore((state) => state.equipments);
  const orders = useMESStore((state) => state.orders);
  const scheduleDraft = useMESStore((state) => state.scheduleDraft);
  const generateScheduleDraft = useMESStore((state) => state.generateScheduleDraft);
  const applyScheduleDraft = useMESStore((state) => state.applyScheduleDraft);
  const clearScheduleDraft = useMESStore((state) => state.clearScheduleDraft);
  const generateWorkOrders = useMESStore((state) => state.generateWorkOrders);
  const addAlert = useMESStore((state) => state.addAlert);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [riskFilter, setRiskFilter] = useState('all');
  const [showScheduleResult, setShowScheduleResult] = useState<any>(null);

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
    const result = generateWorkOrders(order.id, false);
    addAlert({
      type: 'equipment',
      level: result.unscheduled.length > 0 ? 'warning' : 'info',
      title: `订单 ${order.orderNo} 排程完成`,
      message: `成功排程 ${result.scheduled.length} 道工序${result.unscheduled.length > 0 ? `，${result.unscheduled.length} 道未排` : ''}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      relatedId: order.id,
    });
  };

  const handleGenerateDraft = () => {
    generateScheduleDraft();
  };

  const handleConfirmDraft = () => {
    const result = applyScheduleDraft();
    setShowScheduleResult(result);
    addAlert({
      type: 'equipment',
      level: result.totalUnscheduled > 0 ? 'warning' : 'info',
      title: '智能排程已执行',
      message: `共生成 ${result.totalScheduled} 道工序${result.totalUnscheduled > 0 ? `，${result.totalUnscheduled} 道未排` : ''}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      relatedId: 'all',
    });
  };

  const handleCancelDraft = () => {
    clearScheduleDraft();
  };

  const stats = [
    { label: '今日计划工单', value: workOrders.filter(wo => wo.status !== 'completed').length, icon: ListTodo, color: 'text-industrial-400' },
    { label: '进行中', value: workOrders.filter(wo => wo.status === 'running').length, icon: Play, color: 'text-success-500' },
    { label: '设备平均负荷', value: totalLoad.toFixed(1) + '%', icon: Gauge, color: 'text-warning-500' },
    { label: '故障设备', value: equipments.filter(e => e.status === 'fault').length, icon: AlertTriangle, color: 'text-danger-500' },
  ];

  const riskFilterOptions = [
    { value: 'all', label: '全部风险' },
    { value: 'high', label: '仅高风险' },
    { value: 'medium', label: '仅中风险' },
    { value: 'low', label: '仅低风险' },
    { value: 'none', label: '无风险' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
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
          <div className="flex items-center gap-2">
            <Select
              value={riskFilter}
              onChange={setRiskFilter}
              options={riskFilterOptions}
              className="w-32"
              size="sm"
            />
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <Button
                size="sm"
                variant="primary"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={handleGenerateDraft}
              >
                生成排程方案
              </Button>
            )}
          </div>
        }
      >
        <PendingOrderPool
          onScheduleOne={handleScheduleOne}
          onGenerateDraft={handleGenerateDraft}
          riskFilter={riskFilter}
          onRiskFilterChange={setRiskFilter}
        />
      </Card>

      <Card title="设备负荷热力图" subtitle="各设备24小时负荷率分布" icon={<Gauge className="w-5 h-5" />}>
        <EquipmentLoadHeatmap />
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card
            title="甘特图排程"
            subtitle="点击工单可查看详情和风险信息"
            icon={<CalendarClock className="w-5 h-5" />}
          >
            <GanttChart
              riskFilter={riskFilter}
              onWorkOrderClick={setSelectedWorkOrder}
              draftWorkOrders={undefined}
            />
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
              {selectedWorkOrder.riskReasons && selectedWorkOrder.riskReasons.length > 0 && (
                <div className="bg-warning-500/10 border border-warning-500/30 rounded-lg p-3">
                  <p className="text-warning-500 text-xs font-medium mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    风险提示
                  </p>
                  <ul className="space-y-1">
                    {selectedWorkOrder.riskReasons.map((r, i) => (
                      <li key={i} className="text-dark-200 text-sm flex items-start gap-1.5">
                        <span className="text-warning-500 mt-0.5">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
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

      {scheduleDraft && (
        <ScheduleDraftModal
          draft={scheduleDraft}
          onConfirm={handleConfirmDraft}
          onCancel={handleCancelDraft}
        />
      )}

      {showScheduleResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-dark-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-industrial-500/20">
                  <Sparkles className="w-5 h-5 text-industrial-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">智能排程结果</h3>
                  <p className="text-dark-400 text-sm">基于 EDD + 负荷均衡 + 故障排除</p>
                </div>
              </div>
              <button onClick={() => setShowScheduleResult(null)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-success-500/10 border border-success-500/30 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold font-mono text-success-500">{showScheduleResult.totalScheduled}</p>
                  <p className="text-dark-300 text-sm mt-1">成功排程工序</p>
                </div>
                <div className={`${showScheduleResult.totalUnscheduled > 0 ? 'bg-warning-500/10 border-warning-500/30' : 'bg-dark-700/50 border-dark-600'} rounded-xl p-4 text-center`}>
                  <p className={`text-3xl font-bold font-mono ${showScheduleResult.totalUnscheduled > 0 ? 'text-warning-500' : 'text-dark-400'}`}>
                    {showScheduleResult.totalUnscheduled}
                  </p>
                  <p className="text-dark-300 text-sm mt-1">未排程工序</p>
                </div>
              </div>

              {showScheduleResult.unscheduledSteps?.length > 0 && (
                <div className="bg-warning-500/5 border border-warning-500/20 rounded-xl p-4">
                  <p className="text-warning-500 text-sm font-medium mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    未排程工序详情
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {showScheduleResult.unscheduledSteps.map((step: any, idx: number) => (
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
            <div className="px-5 py-3 border-t border-dark-600 flex justify-end">
              <Button variant="secondary" onClick={() => setShowScheduleResult(null)}>知道了</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
