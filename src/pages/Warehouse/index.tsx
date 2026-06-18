import { useState } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import {
  Warehouse as WarehouseIcon,
  Package,
  Truck,
  Battery,
  MapPin,
  Clock,
  Play,
  CheckCircle,
  AlertTriangle,
  Search,
  TrendingUp,
  Zap,
  ArrowRight,
  Box,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { AGV, JITDelivery, Inventory } from '@/types';

const agvStatusMap: Record<AGV['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'industrial' }> = {
  idle: { label: '空闲', variant: 'default' },
  working: { label: '作业中', variant: 'success' },
  charging: { label: '充电中', variant: 'warning' },
  fault: { label: '故障', variant: 'danger' },
};

const deliveryStatusMap: Record<JITDelivery['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'industrial' }> = {
  pending: { label: '待配送', variant: 'warning' },
  delivering: { label: '配送中', variant: 'info' },
  delivered: { label: '已送达', variant: 'success' },
  failed: { label: '失败', variant: 'danger' },
};

function AGVStatusCard({ agv }: { agv: AGV }) {
  const batteryColor = agv.battery > 60 ? 'text-success-500' : agv.battery > 30 ? 'text-warning-500' : 'text-danger-500';

  return (
    <div className={`bg-dark-700/50 border rounded-xl p-4 transition-all hover:border-dark-500 ${
      agv.status === 'working' ? 'border-success-500/30' :
      agv.status === 'fault' ? 'border-danger-500/30' :
      agv.status === 'charging' ? 'border-warning-500/30' : 'border-dark-600'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck className={`w-5 h-5 ${
            agv.status === 'working' ? 'text-success-500' :
            agv.status === 'fault' ? 'text-danger-500' :
            agv.status === 'charging' ? 'text-warning-500' : 'text-dark-400'
          }`} />
          <span className="text-white font-medium">{agv.code}</span>
        </div>
        <Badge variant={agvStatusMap[agv.status].variant} size="sm">
          {agvStatusMap[agv.status].label}
        </Badge>
      </div>

      <p className="text-dark-400 text-sm mb-3">{agv.name}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-dark-400 text-xs">
            <Battery className="w-3 h-3" />
            <span>电量</span>
          </div>
          <span className={`text-sm font-mono font-bold ${batteryColor}`}>{agv.battery}%</span>
        </div>
        <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              agv.battery > 60 ? 'bg-success-500' : agv.battery > 30 ? 'bg-warning-500' : 'bg-danger-500'
            }`}
            style={{ width: `${agv.battery}%` }}
          />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-dark-600/50">
        <div className="flex items-center gap-1 text-dark-400 text-xs">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{agv.currentLocation}</span>
        </div>
      </div>
    </div>
  );
}

function JITDeliveryList() {
  const jitDeliveries = useMESStore((state) => state.jitDeliveries);
  const [filter, setFilter] = useState('');

  const filtered = jitDeliveries.filter(d => !filter || d.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['', 'pending', 'delivering', 'delivered'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filter === s
                ? 'bg-industrial-500 text-white'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            {s === '' ? '全部' : deliveryStatusMap[s].label}
          </button>
        ))}
      </div>

      {filtered.map((delivery) => (
        <div
          key={delivery.id}
          className="bg-dark-700/50 border border-dark-600 rounded-xl p-4 hover:border-dark-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-industrial-400 font-mono text-sm">{delivery.deliveryNo}</span>
            <Badge variant={deliveryStatusMap[delivery.status].variant} size="sm">
              {deliveryStatusMap[delivery.status].label}
            </Badge>
          </div>

          <p className="text-white text-sm font-medium mb-1">{delivery.materialName}</p>
          <p className="text-dark-400 text-xs mb-3">
            {delivery.quantity} {delivery.unit} · {delivery.workOrderNo}
          </p>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-dark-400">
              <MapPin className="w-3 h-3" />
              <span>{delivery.fromLocation}</span>
            </div>
            <ArrowRight className="w-3 h-3 text-dark-500" />
            <div className="flex items-center gap-1 text-dark-400">
              <MapPin className="w-3 h-3" />
              <span>{delivery.toLocation}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-600/50">
            {delivery.agvCode && (
              <div className="flex items-center gap-1 text-dark-400 text-xs">
                <Truck className="w-3 h-3" />
                <span>{delivery.agvCode}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-dark-400 text-xs">
              <Clock className="w-3 h-3" />
              <span>{delivery.planTime.slice(11, 16)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InventoryList() {
  const inventory = useMESStore((state) => state.inventory);
  const [searchText, setSearchText] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(inventory.map(inv => {
    if (inv.materialName.includes('钢')) return '钢材';
    if (inv.materialName.includes('轴承') || inv.materialName.includes('螺栓')) return '标准件';
    if (inv.materialName.includes('电机') || inv.materialName.includes('PLC') || inv.materialName.includes('传感器')) return '电气件';
    if (inv.materialName.includes('油漆')) return '化工';
    if (inv.materialName.includes('包装') || inv.materialName.includes('纸箱')) return '包装';
    return '其他';
  })));

  const filteredInventory = inventory.filter(inv =>
    inv.materialName.includes(searchText) || inv.materialCode.includes(searchText)
  );

  const getInventoryStatus = (item: Inventory) => {
    if (item.quantity <= item.safetyStock * 0.5) return { color: 'text-danger-500', bg: 'bg-danger-500', label: '紧缺' };
    if (item.quantity <= item.safetyStock) return { color: 'text-warning-500', bg: 'bg-warning-500', label: '预警' };
    return { color: 'text-success-500', bg: 'bg-success-500', label: '充足' };
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input
          type="text"
          placeholder="搜索物料名称、编码..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-industrial-500 text-sm"
        />
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {categories.map((cat) => {
          const items = filteredInventory.filter(inv => {
            let itemCat = '其他';
            if (inv.materialName.includes('钢')) itemCat = '钢材';
            else if (inv.materialName.includes('轴承') || inv.materialName.includes('螺栓')) itemCat = '标准件';
            else if (inv.materialName.includes('电机') || inv.materialName.includes('PLC') || inv.materialName.includes('传感器')) itemCat = '电气件';
            else if (inv.materialName.includes('油漆')) itemCat = '化工';
            else if (inv.materialName.includes('包装') || inv.materialName.includes('纸箱')) itemCat = '包装';
            return itemCat === cat;
          });
          if (items.length === 0) return null;

          const isExpanded = expandedCategory === cat || expandedCategory === null;

          return (
            <div key={cat} className="border border-dark-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? cat : null)}
                className="w-full px-3 py-2 bg-dark-700/50 flex items-center justify-between hover:bg-dark-700 transition-colors"
              >
                <span className="text-white text-sm font-medium">{cat}</span>
                <div className="flex items-center gap-2">
                  <span className="text-dark-400 text-xs">{items.length}种</span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-dark-400" /> : <ChevronRight className="w-4 h-4 text-dark-400" />}
                </div>
              </button>
              {isExpanded && (
                <div className="divide-y divide-dark-700/50">
                  {items.map((item) => {
                    const status = getInventoryStatus(item);
                    return (
                      <div key={item.id} className="px-3 py-2 hover:bg-dark-700/30 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm">{item.materialName}</span>
                          <Badge size="sm" variant={
                            status.label === '充足' ? 'success' : status.label === '预警' ? 'warning' : 'danger'
                          }>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-dark-400 font-mono">{item.materialCode}</span>
                          <span className={`font-mono font-bold ${status.color}`}>
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <div className="h-1 bg-dark-600 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${status.bg}`}
                            style={{ width: `${Math.min(100, (item.quantity / (item.safetyStock * 3)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Warehouse() {
  const inventory = useMESStore((state) => state.inventory);
  const agvs = useMESStore((state) => state.agvs);
  const jitDeliveries = useMESStore((state) => state.jitDeliveries);

  const totalInventoryValue = inventory.reduce((sum, inv) => {
    return sum + inv.quantity * 50;
  }, 0);

  const lowStockCount = inventory.filter(inv => inv.quantity <= inv.safetyStock).length;

  const stats = [
    { label: '物料种类', value: inventory.length, icon: Package, color: 'text-industrial-400' },
    { label: '库存总价值', value: '¥' + (totalInventoryValue / 1000).toFixed(1) + 'k', icon: TrendingUp, color: 'text-success-500' },
    { label: '库存预警', value: lowStockCount, icon: AlertTriangle, color: 'text-warning-500' },
    { label: 'AGV在线', value: `${agvs.filter(a => a.status !== 'fault').length}/${agvs.length}`, icon: Truck, color: 'text-industrial-400' },
  ];

  return (
    <div className="space-y-6">
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
        title="AGV 调度状态"
        subtitle="自动导引车实时运行状态"
        icon={<Truck className="w-5 h-5 text-industrial-400" />}
      >
        <div className="grid grid-cols-5 gap-4">
          {agvs.map((agv) => (
            <AGVStatusCard key={agv.id} agv={agv} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <Card
            title="JIT 配送任务"
            subtitle={`共 ${jitDeliveries.length} 个配送任务`}
            icon={<Zap className="w-5 h-5 text-warning-500" />}
          >
            <JITDeliveryList />
          </Card>
        </div>

        <div className="col-span-2">
          <Card
            title="库存管理"
            subtitle="实时库存查询与预警"
            icon={<WarehouseIcon className="w-5 h-5" />}
            action={
              <Button size="sm" variant="secondary" icon={<Box className="w-4 h-4" />}>
                库存盘点
              </Button>
            }
          >
            <InventoryList />
          </Card>
        </div>
      </div>
    </div>
  );
}
