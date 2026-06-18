import { useState } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button, Input } from '@/components/ui';
import {
  ClipboardList,
  Play,
  Pause,
  CheckCircle,
  QrCode,
  Search,
  Filter,
  Clock,
  User,
  Cpu,
  Package,
  AlertTriangle,
  Plus,
  TrendingUp,
} from 'lucide-react';
import type { WorkOrder } from '@/types';

const statusMap: Record<WorkOrder['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'industrial' }> = {
  pending: { label: '待开工', variant: 'default' },
  running: { label: '进行中', variant: 'success' },
  paused: { label: '已暂停', variant: 'warning' },
  completed: { label: '已完成', variant: 'industrial' },
  abnormal: { label: '异常', variant: 'danger' },
};

const priorityMap = {
  high: { label: '高', color: 'text-danger-500 bg-danger-500/10' },
  medium: { label: '中', color: 'text-warning-500 bg-warning-500/10' },
  low: { label: '低', color: 'text-dark-400 bg-dark-500' },
};

function WorkOrderCard({ wo, onStart, onPause, onComplete, onReport }: {
  wo: WorkOrder;
  onStart: () => void;
  onPause: () => void;
  onComplete: () => void;
  onReport: () => void;
}) {
  const progress = (wo.completedQty / wo.planQty) * 100;
  const passRate = wo.completedQty > 0 ? (wo.goodQty / wo.completedQty) * 100 : 100;

  return (
    <div className={`bg-dark-700/50 border rounded-xl overflow-hidden transition-all hover:border-dark-400 ${
      wo.status === 'running' ? 'border-success-500/30' :
      wo.status === 'abnormal' ? 'border-danger-500/30' : 'border-dark-600'
    }`}>
      <div className="px-4 py-3 border-b border-dark-600/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-industrial-400 font-mono font-bold">{wo.workOrderNo}</span>
          <Badge variant={statusMap[wo.status].variant} size="sm">
            {statusMap[wo.status].label}
          </Badge>
          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityMap[wo.priority].color}`}>
            {priorityMap[wo.priority].label}优先
          </span>
        </div>
        <span className="text-dark-400 text-sm">{wo.orderNo}</span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">{wo.productName}</span>
          <span className="text-dark-400 text-xs">{wo.productCode}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-dark-400" />
            <span className="text-dark-300 text-sm">{wo.equipmentName}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-dark-400" />
            <span className="text-dark-300 text-sm">{wo.operatorName || '未分配'}</span>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-400">完成进度</span>
            <span className="text-white font-mono">{wo.completedQty} / {wo.planQty}</span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                wo.status === 'completed' ? 'bg-industrial-500' : 'bg-success-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-dark-400">良品: <span className="text-success-500 font-mono">{wo.goodQty}</span></span>
            <span className="text-dark-400">不良: <span className="text-danger-500 font-mono">{wo.badQty}</span></span>
            <span className="text-dark-400">合格率: <span className={passRate >= 95 ? 'text-success-500' : passRate >= 90 ? 'text-warning-500' : 'text-danger-500'}>{passRate.toFixed(1)}%</span></span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dark-600/50">
          <div className="flex items-center gap-1 text-dark-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>{wo.planStartTime.slice(11, 16)} - {wo.planEndTime.slice(11, 16)}</span>
          </div>
          <div className="flex gap-2">
            {wo.status === 'pending' && (
              <Button size="sm" icon={<Play className="w-3.5 h-3.5" />} onClick={onStart}>
                开工
              </Button>
            )}
            {wo.status === 'running' && (
              <>
                <Button size="sm" variant="secondary" icon={<Pause className="w-3.5 h-3.5" />} onClick={onPause}>
                  暂停
                </Button>
                <Button size="sm" variant="primary" icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={onComplete}>
                  完工
                </Button>
              </>
            )}
            {wo.status === 'paused' && (
              <Button size="sm" icon={<Play className="w-3.5 h-3.5" />} onClick={onStart}>
                继续
              </Button>
            )}
            {wo.status === 'running' && (
              <Button size="sm" variant="ghost" icon={<AlertTriangle className="w-3.5 h-3.5" />} onClick={onReport}>
                报工
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanModal({ onClose, onScan }: { onClose: () => void; onScan: (woNo: string) => void }) {
  const [scanCode, setScanCode] = useState('');
  const workOrders = useMESStore((state) => state.workOrders);

  const handleScan = () => {
    if (scanCode) {
      onScan(scanCode);
      onClose();
    }
  };

  const suggested = workOrders.filter(wo => wo.status === 'pending').slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-dark-600">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5 text-industrial-400" />
            扫码开工
          </h2>
          <p className="text-dark-400 text-sm">输入工单号或扫描二维码</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <div className="w-full h-40 bg-dark-700/50 border-2 border-dashed border-dark-500 rounded-xl flex flex-col items-center justify-center">
              <QrCode className="w-16 h-16 text-dark-400 mb-2" />
              <p className="text-dark-400 text-sm">点击扫码或手动输入</p>
            </div>
          </div>

          <Input
            label="工单号"
            placeholder="请输入或扫描工单号"
            value={scanCode}
            onChange={setScanCode}
          />

          <div>
            <p className="text-dark-400 text-xs mb-2">快速选择待开工工单</p>
            <div className="space-y-2">
              {suggested.map((wo) => (
                <button
                  key={wo.id}
                  onClick={() => setScanCode(wo.workOrderNo)}
                  className="w-full p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 border border-dark-600 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-industrial-400 font-mono text-sm">{wo.workOrderNo}</span>
                    <Badge variant="default" size="sm">待开工</Badge>
                  </div>
                  <p className="text-white text-sm mt-1">{wo.productName}</p>
                  <p className="text-dark-400 text-xs mt-0.5">{wo.equipmentName} · {wo.planQty}件</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-dark-600 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleScan} icon={<Play className="w-4 h-4" />}>确认开工</Button>
        </div>
      </div>
    </div>
  );
}

function ReportModal({ wo, onSubmit, onClose }: {
  wo: WorkOrder;
  onSubmit: (qty: number, isGood: boolean) => void;
  onClose: () => void;
}) {
  const [qty, setQty] = useState('1');
  const [isGood, setIsGood] = useState(true);

  const handleSubmit = () => {
    onSubmit(parseInt(qty) || 1, isGood);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-dark-600">
          <h2 className="text-white font-bold text-lg">生产报工</h2>
          <p className="text-dark-400 text-sm">{wo.workOrderNo} - {wo.productName}</p>
        </div>

        <div className="p-6 space-y-4">
          <Input
            label="报工数量"
            type="number"
            value={qty}
            onChange={setQty}
            suffix={<span className="text-dark-400 text-sm">件</span>}
          />

          <div>
            <label className="text-sm text-dark-200 font-medium mb-2 block">产品质量</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsGood(true)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isGood ? 'border-success-500 bg-success-500/10' : 'border-dark-600 bg-dark-700/50'
                }`}
              >
                <CheckCircle className={`w-6 h-6 mx-auto mb-1 ${isGood ? 'text-success-500' : 'text-dark-400'}`} />
                <p className={isGood ? 'text-success-500 font-medium' : 'text-dark-300'}>良品</p>
              </button>
              <button
                onClick={() => setIsGood(false)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  !isGood ? 'border-danger-500 bg-danger-500/10' : 'border-dark-600 bg-dark-700/50'
                }`}
              >
                <AlertTriangle className={`w-6 h-6 mx-auto mb-1 ${!isGood ? 'text-danger-500' : 'text-dark-400'}`} />
                <p className={!isGood ? 'text-danger-500 font-medium' : 'text-dark-300'}>不良品</p>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-dark-600 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} icon={<Plus className="w-4 h-4" />}>确认报工</Button>
        </div>
      </div>
    </div>
  );
}

export default function WorkOrders() {
  const workOrders = useMESStore((state) => state.workOrders);
  const startWorkOrder = useMESStore((state) => state.startWorkOrder);
  const pauseWorkOrder = useMESStore((state) => state.pauseWorkOrder);
  const completeWorkOrder = useMESStore((state) => state.completeWorkOrder);
  const addCompletedQty = useMESStore((state) => state.addCompletedQty);
  const addAlert = useMESStore((state) => state.addAlert);
  const currentUser = useMESStore((state) => state.currentUser);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showScanModal, setShowScanModal] = useState(false);
  const [reportWO, setReportWO] = useState<WorkOrder | null>(null);

  const filtered = workOrders.filter(wo => {
    const matchSearch = wo.workOrderNo.includes(searchText) || wo.productName.includes(searchText) || wo.orderNo.includes(searchText);
    const matchStatus = !statusFilter || wo.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStart = (wo: WorkOrder) => {
    if (currentUser) {
      startWorkOrder(wo.id, currentUser.id, currentUser.name);
      addAlert({
        type: 'equipment',
        level: 'info',
        title: `工单 ${wo.workOrderNo} 已开工`,
        message: `${currentUser.name} 在 ${wo.equipmentName} 开始生产`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        relatedId: wo.id,
      });
    }
  };

  const handleComplete = (wo: WorkOrder) => {
    completeWorkOrder(wo.id);
    addAlert({
      type: 'equipment',
      level: 'info',
      title: `工单 ${wo.workOrderNo} 已完工`,
      message: `共完成 ${wo.planQty} 件，良品 ${wo.goodQty} 件`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      relatedId: wo.id,
    });
  };

  const handleReport = (qty: number, isGood: boolean) => {
    if (reportWO) {
      addCompletedQty(reportWO.id, qty, isGood);
    }
  };

  const stats = [
    { label: '总工单', value: workOrders.length, icon: ClipboardList, color: 'text-industrial-400' },
    { label: '进行中', value: workOrders.filter(w => w.status === 'running').length, icon: Play, color: 'text-success-500' },
    { label: '已完成', value: workOrders.filter(w => w.status === 'completed').length, icon: CheckCircle, color: 'text-dark-300' },
    { label: '今日产量', value: workOrders.reduce((sum, w) => sum + w.completedQty, 0), icon: Package, color: 'text-warning-500' },
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
        title="工单管理"
        subtitle="所有生产工单列表，支持搜索和状态筛选"
        icon={<ClipboardList className="w-5 h-5" />}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<QrCode className="w-4 h-4" />} onClick={() => setShowScanModal(true)}>
              扫码开工
            </Button>
          </div>
        }
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="搜索工单号、产品名称、订单号..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-industrial-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(['', 'pending', 'running', 'paused', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  statusFilter === s
                    ? 'bg-industrial-500 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                }`}
              >
                {s === '' ? '全部' : statusMap[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {filtered.map((wo) => (
            <WorkOrderCard
              key={wo.id}
              wo={wo}
              onStart={() => handleStart(wo)}
              onPause={() => pauseWorkOrder(wo.id)}
              onComplete={() => handleComplete(wo)}
              onReport={() => setReportWO(wo)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">暂无匹配的工单</p>
          </div>
        )}
      </Card>

      {showScanModal && (
        <ScanModal
          onClose={() => setShowScanModal(false)}
          onScan={(woNo) => {
            const wo = workOrders.find(w => w.workOrderNo === woNo);
            if (wo) handleStart(wo);
          }}
        />
      )}

      {reportWO && (
        <ReportModal
          wo={reportWO}
          onSubmit={handleReport}
          onClose={() => setReportWO(null)}
        />
      )}
    </div>
  );
}
