import { useState, useMemo } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button, Select } from '@/components/ui';
import type { WorkOrderCost, WorkOrder } from '@/types';
import {
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  FileText,
  Package,
  Users,
  Zap,
  Settings as SettingsIcon,
  Filter,
  X,
  AlertTriangle,
  CalendarClock,
  Factory,
  ListTodo,
  ChevronDown,
  ChevronRight,
  Eye,
} from 'lucide-react';
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#165DFF', '#00B42A', '#FF7D00', '#722ED1'];

const statusOptions = [
  { value: 'all', label: '全部工单状态' },
  { value: 'completed', label: '已完工' },
  { value: 'running', label: '进行中' },
  { value: 'pending', label: '待下发' },
];

const costAbnormalOptions = [
  { value: 'all', label: '全部成本' },
  { value: 'abnormal', label: '仅异常成本' },
  { value: 'low_margin', label: '低利润率（<15%）' },
  { value: 'high_margin', label: '高利润率（>45%）' },
  { value: 'normal', label: '正常范围' },
];

function WorkOrderCostDetailModal({ cost, onClose, onJumpToWorkOrder }: {
  cost: WorkOrderCost;
  onClose: () => void;
  onJumpToWorkOrder?: (woId: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">工单成本详情</h2>
            <p className="text-dark-400 text-sm">{cost.workOrderNo} - {cost.productName}</p>
          </div>
          <button onClick={onClose} className="text-dark-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-dark-700/50 rounded-xl p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-dark-400 text-xs mb-1">对应订单</p>
              <p className="text-industrial-400 font-mono text-sm font-medium">{cost.orderNo}</p>
            </div>
            <div>
              <p className="text-dark-400 text-xs mb-1">完工月份</p>
              <p className="text-white text-sm font-medium">{cost.completedMonth}</p>
            </div>
            <div>
              <p className="text-dark-400 text-xs mb-1">完工日期</p>
              <p className="text-white text-sm font-mono">{cost.completedDate}</p>
            </div>
            <div>
              <p className="text-dark-400 text-xs mb-1">生产数量</p>
              <p className="text-white text-sm font-mono">{cost.quantity} 件</p>
            </div>
          </div>

          {cost.isCostAbnormal && (
            <div className="bg-warning-500/10 border border-warning-500/30 rounded-xl p-4">
              <p className="text-warning-500 text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                成本异常
              </p>
              <p className="text-dark-300 text-sm mt-1">{cost.costAbnormalReason}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-dark-600/50">
              <span className="text-dark-400">材料成本</span>
              <span className="text-white font-mono">¥{cost.materialCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-600/50">
              <span className="text-dark-400">人工成本</span>
              <span className="text-white font-mono">¥{cost.laborCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-600/50">
              <span className="text-dark-400">能耗成本</span>
              <span className="text-white font-mono">¥{cost.energyCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-600/50">
              <span className="text-dark-400">其他成本</span>
              <span className="text-white font-mono">¥{cost.otherCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white font-medium">总成本</span>
              <span className="text-warning-500 font-mono font-bold">¥{cost.totalCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-success-500/10 border border-success-500/30 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-dark-400 text-sm">营收</p>
                <p className="text-success-500 text-xl font-mono font-bold">¥{cost.revenue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-dark-400 text-sm">利润</p>
                <p className="text-industrial-400 text-xl font-mono font-bold">¥{cost.profit.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-dark-400 text-sm">利润率</p>
                <Badge size="sm" variant={cost.profitMargin >= 25 ? 'success' : cost.profitMargin >= 20 ? 'industrial' : 'warning'}>
                  {cost.profitMargin.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-dark-700/50 rounded-xl p-4">
            <p className="text-dark-400 text-xs mb-2">单位成本</p>
            <p className="text-white text-2xl font-mono font-bold">¥{cost.unitCost} <span className="text-sm font-normal text-dark-400">/ 件</span></p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-dark-600 flex justify-between">
          {onJumpToWorkOrder && (
            <Button variant="secondary" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => onJumpToWorkOrder(cost.workOrderId)}>
              查看对应工单
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  );
}

export default function Cost() {
  const workOrderCosts = useMESStore((state) => state.workOrderCosts);
  const workOrders = useMESStore((state) => state.workOrders);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [costAbnormalFilter, setCostAbnormalFilter] = useState('all');
  const [selectedWorkOrderCost, setSelectedWorkOrderCost] = useState<WorkOrderCost | null>(null);

  const productOptions = useMemo(() => {
    const products = new Set<string>();
    workOrderCosts.forEach(c => products.add(c.productName));
    return [
      { value: 'all', label: '全部产品' },
      ...Array.from(products).map(p => ({ value: p, label: p })),
    ];
  }, [workOrderCosts]);

  const orderOptions = useMemo(() => {
    const orders = new Set<string>();
    workOrderCosts.forEach(c => orders.add(c.orderNo));
    return [
      { value: 'all', label: '全部订单' },
      ...Array.from(orders).sort().map(o => ({ value: o, label: o })),
    ];
  }, [workOrderCosts]);

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [
      { value: 'all', label: '全部月份' },
    ];
    const monthSet = new Set<string>();
    workOrderCosts.forEach(c => {
      if (c.completedMonth) monthSet.add(c.completedMonth);
    });
    const sortedMonths = Array.from(monthSet).sort().reverse();
    sortedMonths.forEach(m => {
      const [y, mon] = m.split('-');
      options.push({ value: m, label: `${y}年${parseInt(mon, 10)}月` });
    });
    return options;
  }, [workOrderCosts]);

  const filteredCosts = useMemo(() => {
    return workOrderCosts.filter(c => {
      if (selectedProduct !== 'all' && c.productName !== selectedProduct) return false;
      if (selectedOrder !== 'all' && c.orderNo !== selectedOrder) return false;
      if (selectedMonth !== 'all' && c.completedMonth !== selectedMonth) return false;

      if (costAbnormalFilter === 'abnormal' && !c.isCostAbnormal) return false;
      if (costAbnormalFilter === 'low_margin' && c.profitMargin >= 15) return false;
      if (costAbnormalFilter === 'high_margin' && c.profitMargin <= 45) return false;
      if (costAbnormalFilter === 'normal' && c.isCostAbnormal) return false;

      if (statusFilter !== 'all') {
        const wo = workOrders.find(w => w.workOrderNo === c.workOrderNo);
        if (!wo || wo.status !== statusFilter) return false;
      }

      return true;
    });
  }, [workOrderCosts, workOrders, selectedMonth, selectedProduct, selectedOrder, statusFilter, costAbnormalFilter]);

  const totalRevenue = filteredCosts.reduce((sum, c) => sum + c.revenue, 0);
  const totalCost = filteredCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const totalProfit = filteredCosts.reduce((sum, c) => sum + c.profit, 0);
  const avgProfitMargin = filteredCosts.length > 0
    ? filteredCosts.reduce((sum, c) => sum + c.profitMargin, 0) / filteredCosts.length
    : 0;

  const totalMaterialCost = filteredCosts.reduce((sum, c) => sum + c.materialCost, 0);
  const totalLaborCost = filteredCosts.reduce((sum, c) => sum + c.laborCost, 0);
  const totalEnergyCost = filteredCosts.reduce((sum, c) => sum + c.energyCost, 0);
  const totalOtherCost = filteredCosts.reduce((sum, c) => sum + c.otherCost, 0);

  const costBreakdownData = useMemo(() => {
    if (totalCost <= 0) {
      return [
        { name: '材料成本', value: 65, amount: 0, color: '#165DFF' },
        { name: '人工成本', value: 20, amount: 0, color: '#00B42A' },
        { name: '能耗成本', value: 10, amount: 0, color: '#FF7D00' },
        { name: '其他成本', value: 5, amount: 0, color: '#722ED1' },
      ];
    }
    return [
      { name: '材料成本', value: Math.round((totalMaterialCost / totalCost) * 1000) / 10, amount: totalMaterialCost, color: '#165DFF' },
      { name: '人工成本', value: Math.round((totalLaborCost / totalCost) * 1000) / 10, amount: totalLaborCost, color: '#00B42A' },
      { name: '能耗成本', value: Math.round((totalEnergyCost / totalCost) * 1000) / 10, amount: totalEnergyCost, color: '#FF7D00' },
      { name: '其他成本', value: Math.max(0, Math.round((totalOtherCost / totalCost) * 1000) / 10), amount: totalOtherCost, color: '#722ED1' },
    ];
  }, [totalCost, totalMaterialCost, totalLaborCost, totalEnergyCost, totalOtherCost]);

  const monthlyData = useMemo(() => {
    const map: Record<string, { revenue: number; cost: number; profit: number; count: number }> = {};

    const relevantCosts = selectedProduct !== 'all'
      ? workOrderCosts.filter(c => c.productName === selectedProduct)
      : selectedOrder !== 'all'
        ? workOrderCosts.filter(c => c.orderNo === selectedOrder)
        : workOrderCosts;

    relevantCosts.forEach(c => {
      const monthKey = c.completedMonth || '未知';
      if (!map[monthKey]) {
        map[monthKey] = { revenue: 0, cost: 0, profit: 0, count: 0 };
      }
      map[monthKey].revenue += c.revenue;
      map[monthKey].cost += c.totalCost;
      map[monthKey].profit += c.profit;
      map[monthKey].count += 1;
    });

    const sortedKeys = Object.keys(map).sort();
    return sortedKeys.map(key => {
      const [, m] = key.split('-');
      return {
        month: key === '未知' ? '未知' : `${parseInt(m, 10)}月`,
        monthKey: key,
        revenue: Math.round(map[key].revenue / 10000 * 100) / 100,
        cost: Math.round(map[key].cost / 10000 * 100) / 100,
        profit: Math.round(map[key].profit / 10000 * 100) / 100,
        count: map[key].count,
      };
    });
  }, [workOrderCosts, selectedProduct, selectedOrder]);

  const stats = [
    {
      label: '总营收',
      value: '¥' + (totalRevenue / 10000).toFixed(2) + '万',
      icon: DollarSign,
      color: 'text-success-500',
      bgColor: 'bg-success-500/10',
    },
    {
      label: '总成本',
      value: '¥' + (totalCost / 10000).toFixed(2) + '万',
      icon: Package,
      color: 'text-warning-500',
      bgColor: 'bg-warning-500/10',
    },
    {
      label: '总利润',
      value: '¥' + (totalProfit / 10000).toFixed(2) + '万',
      icon: TrendingUp,
      color: 'text-industrial-400',
      bgColor: 'bg-industrial-500/10',
    },
    {
      label: '平均利润率',
      value: avgProfitMargin.toFixed(1) + '%',
      icon: PieChartIcon,
      color: avgProfitMargin >= 25 ? 'text-success-500' : avgProfitMargin >= 20 ? 'text-industrial-400' : 'text-warning-500',
      bgColor: avgProfitMargin >= 25 ? 'bg-success-500/10' : avgProfitMargin >= 20 ? 'bg-industrial-500/10' : 'bg-warning-500/10',
    },
  ];

  const hasActiveFilter = selectedMonth !== 'all' || selectedProduct !== 'all' || selectedOrder !== 'all' || statusFilter !== 'all' || costAbnormalFilter !== 'all';

  const activeFilterCount = [
    selectedMonth !== 'all',
    selectedProduct !== 'all',
    selectedOrder !== 'all',
    statusFilter !== 'all',
    costAbnormalFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">成本核算中心</h1>
          <p className="text-dark-400 text-sm">工单成本核算与利润分析</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<FileText className="w-4 h-4" />}>
            导出报表
          </Button>
        </div>
      </div>

      <Card
        title="筛选条件"
        subtitle={`当前 ${filteredCosts.length} 条成本记录`}
        icon={<Filter className="w-5 h-5 text-industrial-400" />}
        action={
          hasActiveFilter && (
            <Button
              size="sm"
              variant="ghost"
              icon={<X className="w-3.5 h-3.5" />}
              onClick={() => {
                setSelectedMonth('all');
                setSelectedProduct('all');
                setSelectedOrder('all');
                setStatusFilter('all');
                setCostAbnormalFilter('all');
              }}
            >
              重置筛选
            </Button>
          )
        }
      >
        <div className="grid grid-cols-5 gap-3">
          <div>
            <label className="text-dark-400 text-xs mb-1.5 block">月份</label>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={monthOptions}
              size="sm"
            />
          </div>
          <div>
            <label className="text-dark-400 text-xs mb-1.5 block">产品</label>
            <Select
              value={selectedProduct}
              onChange={setSelectedProduct}
              options={productOptions}
              size="sm"
            />
          </div>
          <div>
            <label className="text-dark-400 text-xs mb-1.5 block">订单</label>
            <Select
              value={selectedOrder}
              onChange={setSelectedOrder}
              options={orderOptions}
              size="sm"
            />
          </div>
          <div>
            <label className="text-dark-400 text-xs mb-1.5 block">工单状态</label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              size="sm"
            />
          </div>
          <div>
            <label className="text-dark-400 text-xs mb-1.5 block">成本区间</label>
            <Select
              value={costAbnormalFilter}
              onChange={setCostAbnormalFilter}
              options={costAbnormalOptions}
              size="sm"
            />
          </div>
        </div>
      </Card>

      {hasActiveFilter && (
        <div className="bg-industrial-500/10 border border-industrial-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-industrial-400 flex-shrink-0" />
          <span className="text-industrial-400 text-sm">
            已应用 {activeFilterCount} 个筛选条件，共匹配 {filteredCosts.length} 条成本记录
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-dark-800/50 border border-dark-600 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold font-mono mt-2 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card
            title="月度营收成本趋势"
            subtitle={`${selectedMonth === 'all' ? '全周期' : monthOptions.find(o => o.value === selectedMonth)?.label} 营收、成本与利润（单位：万元）`}
            icon={<TrendingUp className="w-5 h-5 text-industrial-400" />}
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00B42A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00B42A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF7D00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF7D00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272e3b" />
                  <XAxis dataKey="month" stroke="#4e5969" fontSize={12} />
                  <YAxis stroke="#4e5969" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => [`¥${value.toFixed(2)}万`, name]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="营收" stroke="#00B42A" fill="url(#revenueGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cost" name="成本" stroke="#FF7D00" fill="url(#costGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="profit" name="利润" stroke="#165DFF" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card
            title="成本构成"
            subtitle="各项成本占比分析"
            icon={<PieChartIcon className="w-5 h-5 text-warning-500" />}
          >
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number, _name: string, props: any) => [`${value}%  (¥${(props.payload.amount / 10000).toFixed(2)}万)`, props.payload.name]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {costBreakdownData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-dark-300">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-mono font-bold">{item.value}%</span>
                    <span className="text-dark-400 text-xs ml-2">¥{(item.amount / 10000).toFixed(2)}万</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-industrial-400" />
            <span className="text-dark-400 text-sm">材料成本</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">¥{(totalMaterialCost / 10000).toFixed(2)}万</p>
          <p className="text-dark-500 text-xs mt-1">占总成本 {totalCost > 0 ? ((totalMaterialCost / totalCost) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-success-500" />
            <span className="text-dark-400 text-sm">人工成本</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">¥{(totalLaborCost / 10000).toFixed(2)}万</p>
          <p className="text-dark-500 text-xs mt-1">占总成本 {totalCost > 0 ? ((totalLaborCost / totalCost) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-warning-500" />
            <span className="text-dark-400 text-sm">能耗成本</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">¥{(totalEnergyCost / 10000).toFixed(2)}万</p>
          <p className="text-dark-500 text-xs mt-1">占总成本 {totalCost > 0 ? ((totalEnergyCost / totalCost) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon className="w-4 h-4 text-dark-400" />
            <span className="text-dark-400 text-sm">其他成本</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">¥{(totalOtherCost / 10000).toFixed(2)}万</p>
          <p className="text-dark-500 text-xs mt-1">占总成本 {totalCost > 0 ? ((totalOtherCost / totalCost) * 100).toFixed(1) : 0}%</p>
        </div>
      </div>

      <Card
        title="工单成本明细"
        subtitle={`${filteredCosts.length} 条工单成本与利润详情（金额单位：元）`}
        icon={<BarChart3 className="w-5 h-5" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">工单号</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">对应订单</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">完工月份</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">产品名称</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">数量</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">材料成本</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">人工成本</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">总成本</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">利润</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">利润率</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">状态</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredCosts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-dark-400">
                    暂无符合筛选条件的工单成本记录
                  </td>
                </tr>
              ) : (
                filteredCosts.map((cost) => {
                  const wo = workOrders.find(w => w.workOrderNo === cost.workOrderNo);
                  return (
                    <tr key={cost.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                      <td className="py-3 px-4 text-industrial-400 font-mono text-sm">{cost.workOrderNo}</td>
                      <td className="py-3 px-4 text-dark-300 font-mono text-sm">{cost.orderNo}</td>
                      <td className="py-3 px-4 text-dark-400 text-sm">{cost.completedMonth}</td>
                      <td className="py-3 px-4 text-white text-sm">{cost.productName}</td>
                      <td className="py-3 px-4 text-center text-white font-mono text-sm">{cost.quantity}</td>
                      <td className="py-3 px-4 text-right text-white font-mono text-sm">¥{cost.materialCost.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-white font-mono text-sm">¥{cost.laborCost.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-warning-500 font-mono font-bold text-sm">¥{cost.totalCost.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-industrial-400 font-mono font-bold text-sm">¥{cost.profit.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          size="sm"
                          variant={cost.profitMargin >= 25 ? 'success' : cost.profitMargin >= 20 ? 'industrial' : 'warning'}
                        >
                          {cost.profitMargin.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {cost.isCostAbnormal ? (
                          <Badge size="sm" variant="danger">
                            <AlertTriangle className="w-3 h-3 mr-0.5" />
                            异常
                          </Badge>
                        ) : (
                          <Badge size="sm" variant="success">正常</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedWorkOrderCost(cost)}
                          className="text-industrial-400 hover:text-industrial-300 text-xs"
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedWorkOrderCost && (
        <WorkOrderCostDetailModal
          cost={selectedWorkOrderCost}
          onClose={() => setSelectedWorkOrderCost(null)}
        />
      )}
    </div>
  );
}
