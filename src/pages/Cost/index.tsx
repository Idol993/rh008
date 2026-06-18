import { useState } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button, Select } from '@/components/ui';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Users,
  Zap,
  Settings,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#165DFF', '#00B42A', '#FF7D00', '#722ED1'];

const costBreakdownData = [
  { name: '材料成本', value: 65, color: '#165DFF' },
  { name: '人工成本', value: 20, color: '#00B42A' },
  { name: '能耗成本', value: 10, color: '#FF7D00' },
  { name: '其他成本', value: 5, color: '#722ED1' },
];

const monthlyData = Array.from({ length: 6 }, (_, i) => {
  const month = new Date();
  month.setMonth(month.getMonth() - 5 + i);
  return {
    month: `${month.getMonth() + 1}月`,
    revenue: 120 + Math.random() * 50,
    cost: 80 + Math.random() * 30,
    profit: 40 + Math.random() * 20,
  };
});

export default function Cost() {
  const workOrderCosts = useMESStore((state) => state.workOrderCosts);
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  const totalRevenue = workOrderCosts.reduce((sum, c) => sum + c.revenue, 0);
  const totalCost = workOrderCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const totalProfit = workOrderCosts.reduce((sum, c) => sum + c.profit, 0);
  const avgProfitMargin = workOrderCosts.length > 0
    ? workOrderCosts.reduce((sum, c) => sum + c.profitMargin, 0) / workOrderCosts.length
    : 0;

  const totalMaterialCost = workOrderCosts.reduce((sum, c) => sum + c.materialCost, 0);
  const totalLaborCost = workOrderCosts.reduce((sum, c) => sum + c.laborCost, 0);
  const totalEnergyCost = workOrderCosts.reduce((sum, c) => sum + c.energyCost, 0);

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
      icon: PieChart,
      color: 'text-success-500',
      bgColor: 'bg-success-500/10',
      trend: '+2.3%',
    },
  ];

  const workOrderProfitData = workOrderCosts.map(c => ({
    name: c.workOrderNo.slice(-6),
    revenue: c.revenue,
    cost: c.totalCost,
    profit: c.profit,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">成本核算中心</h1>
          <p className="text-dark-400 text-sm">工单成本核算与利润分析</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={[
              { value: 'current', label: '本月' },
              { value: 'last', label: '上月' },
              { value: 'quarter', label: '本季度' },
              { value: 'year', label: '本年度' },
            ]}
            className="w-36"
          />
          <Button variant="secondary" icon={<FileText className="w-4 h-4" />}>
            导出报表
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-dark-800/50 border border-dark-600 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold font-mono mt-2 ${stat.color}`}>
                  {stat.value}
                </p>
                {stat.trend && (
                  <div className="flex items-center gap-1 mt-2 text-success-500 text-xs">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>较上月 {stat.trend}</span>
                  </div>
                )}
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
            subtitle="近6个月营收、成本与利润对比"
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
                    formatter={(value: number) => [`¥${value.toFixed(0)}万`, '']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="营收" stroke="#00B42A" fill="url(#revenueGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cost" name="成本" stroke="#FF7D00" fill="url(#costGradient)" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" name="利润" stroke="#165DFF" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card
            title="成本构成"
            subtitle="各项成本占比分析"
            icon={<PieChart className="w-5 h-5 text-warning-500" />}
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
                    formatter={(value: number) => [`${value}%`, '占比']}
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
                  <span className="text-white font-mono font-bold">{item.value}%</span>
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
          <p className="text-2xl font-bold font-mono text-white">¥{(totalMaterialCost / 1000).toFixed(1)}k</p>
          <p className="text-dark-500 text-xs mt-1">占总成本 {((totalMaterialCost / totalCost) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-success-500" />
            <span className="text-dark-400 text-sm">人工成本</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">¥{(totalLaborCost / 1000).toFixed(1)}k</p>
          <p className="text-dark-500 text-xs mt-1">占总成本 {((totalLaborCost / totalCost) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-warning-500" />
            <span className="text-dark-400 text-sm">能耗成本</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">¥{(totalEnergyCost / 1000).toFixed(1)}k</p>
          <p className="text-dark-500 text-xs mt-1">占总成本 {((totalEnergyCost / totalCost) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-dark-400" />
            <span className="text-dark-400 text-sm">其他成本</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">¥{((totalCost - totalMaterialCost - totalLaborCost - totalEnergyCost) / 1000).toFixed(1)}k</p>
          <p className="text-dark-500 text-xs mt-1">占总成本 {(((totalCost - totalMaterialCost - totalLaborCost - totalEnergyCost) / totalCost) * 100).toFixed(1)}%</p>
        </div>
      </div>

      <Card
        title="工单成本明细"
        subtitle="各工单成本与利润详情"
        icon={<BarChart3 className="w-5 h-5" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">工单号</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">产品名称</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">数量</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">材料成本</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">人工成本</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">能耗成本</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">总成本</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">营收</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">利润</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">利润率</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {workOrderCosts.map((cost) => (
                <tr key={cost.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                  <td className="py-3 px-4 text-industrial-400 font-mono text-sm">{cost.workOrderNo}</td>
                  <td className="py-3 px-4 text-white text-sm">{cost.productName}</td>
                  <td className="py-3 px-4 text-center text-white font-mono text-sm">{cost.quantity}</td>
                  <td className="py-3 px-4 text-right text-white font-mono text-sm">¥{cost.materialCost}</td>
                  <td className="py-3 px-4 text-right text-white font-mono text-sm">¥{cost.laborCost}</td>
                  <td className="py-3 px-4 text-right text-white font-mono text-sm">¥{cost.energyCost}</td>
                  <td className="py-3 px-4 text-right text-warning-500 font-mono font-bold text-sm">¥{cost.totalCost}</td>
                  <td className="py-3 px-4 text-right text-success-500 font-mono text-sm">¥{cost.revenue}</td>
                  <td className="py-3 px-4 text-right text-industrial-400 font-mono font-bold text-sm">¥{cost.profit}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      size="sm"
                      variant={cost.profitMargin >= 25 ? 'success' : cost.profitMargin >= 20 ? 'industrial' : 'warning'}
                    >
                      {cost.profitMargin.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedWorkOrder(cost)}
                      className="text-industrial-400 hover:text-industrial-300 text-xs"
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedWorkOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">工单成本详情</h2>
                <p className="text-dark-400 text-sm">{selectedWorkOrder.workOrderNo} - {selectedWorkOrder.productName}</p>
              </div>
              <Badge variant="success">利润率 {selectedWorkOrder.profitMargin.toFixed(1)}%</Badge>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs mb-1">生产数量</p>
                  <p className="text-white text-lg font-mono font-bold">{selectedWorkOrder.quantity} 件</p>
                </div>
                <div className="bg-dark-700/50 rounded-lg p-3">
                  <p className="text-dark-400 text-xs mb-1">单位成本</p>
                  <p className="text-warning-500 text-lg font-mono font-bold">¥{selectedWorkOrder.unitCost}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-dark-600/50">
                  <span className="text-dark-400">材料成本</span>
                  <span className="text-white font-mono">¥{selectedWorkOrder.materialCost}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600/50">
                  <span className="text-dark-400">人工成本</span>
                  <span className="text-white font-mono">¥{selectedWorkOrder.laborCost}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600/50">
                  <span className="text-dark-400">能耗成本</span>
                  <span className="text-white font-mono">¥{selectedWorkOrder.energyCost}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-600/50">
                  <span className="text-dark-400">其他成本</span>
                  <span className="text-white font-mono">¥{selectedWorkOrder.otherCost}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white font-medium">总成本</span>
                  <span className="text-warning-500 font-mono font-bold">¥{selectedWorkOrder.totalCost}</span>
                </div>
              </div>

              <div className="bg-success-500/10 border border-success-500/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-dark-400 text-sm">营收</p>
                    <p className="text-success-500 text-xl font-mono font-bold">¥{selectedWorkOrder.revenue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-dark-400 text-sm">利润</p>
                    <p className="text-industrial-400 text-xl font-mono font-bold">¥{selectedWorkOrder.profit}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-dark-600 flex justify-end">
              <Button variant="ghost" onClick={() => setSelectedWorkOrder(null)}>关闭</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
