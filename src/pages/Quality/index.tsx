import { useState } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button } from '@/components/ui';
import {
  ShieldCheck,
  Camera,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Clock,
  User,
  Package,
} from 'lucide-react';
import {
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
  LineChart,
  Line,
} from 'recharts';
import { defectTypeStats } from '@/mock';

const COLORS = ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#86909C'];

function DefectImage({ defectType, imageUrl }: { defectType: string; imageUrl?: string }) {
  return (
    <div className="relative w-full h-32 bg-dark-700 rounded-lg overflow-hidden flex items-center justify-center">
      <Camera className="w-10 h-10 text-dark-500" />
      <div className="absolute inset-0 border-2 border-dashed border-dark-600 rounded-lg m-2" />
      <div className="absolute top-2 left-2">
        <Badge variant="danger" size="sm">
          <XCircle className="w-3 h-3 mr-1" />
          {defectType}
        </Badge>
      </div>
      <div className="absolute bottom-2 right-2 text-dark-400 text-xs font-mono">
        AI检测
      </div>
    </div>
  );
}

function QualityDetailModal({ check, onClose }: { check: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">质检详情</h2>
            <p className="text-dark-400 text-sm">{check.workOrderNo} - {check.productName}</p>
          </div>
          <Badge variant={check.passRate >= 95 ? 'success' : check.passRate >= 90 ? 'warning' : 'danger'}>
            合格率 {check.passRate.toFixed(1)}%
          </Badge>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-dark-700/50 rounded-xl p-4 text-center">
              <p className="text-dark-400 text-sm mb-1">总检数</p>
              <p className="text-white text-2xl font-bold font-mono">{check.totalQty}</p>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-4 text-center">
              <p className="text-dark-400 text-sm mb-1">良品数</p>
              <p className="text-success-500 text-2xl font-bold font-mono">{check.passQty}</p>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-4 text-center">
              <p className="text-dark-400 text-sm mb-1">不良品数</p>
              <p className="text-danger-500 text-2xl font-bold font-mono">{check.failQty}</p>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-4 text-center">
              <p className="text-dark-400 text-sm mb-1">合格率</p>
              <p className={`text-2xl font-bold font-mono ${
                check.passRate >= 95 ? 'text-success-500' : check.passRate >= 90 ? 'text-warning-500' : 'text-danger-500'
              }`}>
                {check.passRate.toFixed(1)}%
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-industrial-400" />
              机器视觉检测结果
            </h3>
            {check.defects && check.defects.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {check.defects.map((defect: any, idx: number) => (
                  <div key={defect.id} className="bg-dark-700/30 border border-dark-600 rounded-xl overflow-hidden">
                    <DefectImage defectType={defect.defectName} />
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">{defect.defectName}</span>
                        <Badge
                          size="sm"
                          variant={
                            defect.severity === 'critical' ? 'danger' :
                            defect.severity === 'major' ? 'warning' : 'default'
                          }
                        >
                          {defect.severity === 'critical' ? '严重' : defect.severity === 'major' ? '主要' : '轻微'}
                        </Badge>
                      </div>
                      <p className="text-dark-400 text-xs mb-2">{defect.description || 'AI自动检测识别'}</p>
                      <p className="text-danger-500 font-mono text-sm">{defect.quantity} 件</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-success-500/10 border border-success-500/30 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto mb-2" />
                <p className="text-success-500 font-medium">全部合格</p>
                <p className="text-dark-400 text-sm mt-1">机器视觉检测未发现任何缺陷</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-dark-600">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-dark-400">
                <User className="w-4 h-4" />
                <span>{check.inspector}</span>
              </div>
              <div className="flex items-center gap-1 text-dark-400">
                <Clock className="w-4 h-4" />
                <span>{check.checkTime}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              打印质检报告
            </Button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-dark-600 flex justify-end">
          <Button variant="ghost" onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  );
}

function UnqualifiedProducts() {
  const qualityChecks = useMESStore((state) => state.qualityChecks);
  const [selectedCheck, setSelectedCheck] = useState<any>(null);

  const failChecks = qualityChecks.filter(qc => qc.failQty > 0);

  return (
    <div className="space-y-3">
      {failChecks.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-10 h-10 text-success-500 mx-auto mb-2" />
          <p className="text-dark-400 text-sm">暂无不合格品</p>
        </div>
      ) : (
        failChecks.map((qc) => (
          <div
            key={qc.id}
            className="bg-dark-700/50 border border-danger-500/30 rounded-xl p-4 hover:bg-dark-700 transition-colors cursor-pointer"
            onClick={() => setSelectedCheck(qc)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-industrial-400 font-mono text-sm">{qc.workOrderNo}</span>
              <Badge variant="danger" size="sm">不良 {qc.failQty}件</Badge>
            </div>
            <p className="text-white text-sm">{qc.productName}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-600/50">
              <span className="text-dark-400 text-xs">{qc.checkTime}</span>
              <button className="text-industrial-400 text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                查看详情
              </button>
            </div>
            {selectedCheck && selectedCheck.id === qc.id && (
              <QualityDetailModal check={selectedCheck} onClose={() => setSelectedCheck(null)} />
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default function Quality() {
  const qualityChecks = useMESStore((state) => state.qualityChecks);
  const [selectedCheck, setSelectedCheck] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  const totalChecked = qualityChecks.reduce((sum, qc) => sum + qc.totalQty, 0);
  const totalPassed = qualityChecks.reduce((sum, qc) => sum + qc.passQty, 0);
  const totalFailed = qualityChecks.reduce((sum, qc) => sum + qc.failQty, 0);
  const overallPassRate = totalChecked > 0 ? (totalPassed / totalChecked) * 100 : 0;

  const dailyQuality = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      passRate: 92 + Math.random() * 6,
      defectRate: 2 + Math.random() * 4,
    };
  });

  const filteredChecks = qualityChecks.filter(qc =>
    qc.workOrderNo.includes(searchText) || qc.productName.includes(searchText)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-dark-700 text-industrial-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-dark-400 text-sm">总检验数</p>
            <p className="text-white text-2xl font-bold font-mono">{totalChecked}</p>
          </div>
        </div>
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-dark-700 text-success-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-dark-400 text-sm">良品数</p>
            <p className="text-success-500 text-2xl font-bold font-mono">{totalPassed}</p>
          </div>
        </div>
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-dark-700 text-danger-500">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-dark-400 text-sm">不良品数</p>
            <p className="text-danger-500 text-2xl font-bold font-mono">{totalFailed}</p>
          </div>
        </div>
        <div className="bg-dark-800/50 border border-dark-600 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-dark-700 text-warning-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-dark-400 text-sm">综合合格率</p>
            <p className={`text-2xl font-bold font-mono ${
              overallPassRate >= 95 ? 'text-success-500' : overallPassRate >= 90 ? 'text-warning-500' : 'text-danger-500'
            }`}>
              {overallPassRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card title="合格率趋势" subtitle="近7天产品合格率变化" icon={<TrendingUp className="w-5 h-5 text-success-500" />}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyQuality}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272e3b" />
                  <XAxis dataKey="date" stroke="#4e5969" fontSize={12} />
                  <YAxis stroke="#4e5969" fontSize={12} domain={[80, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1d2129', border: '1px solid #272e3b', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="passRate" stroke="#00B42A" strokeWidth={2} dot={{ fill: '#00B42A', r: 4 }} name="合格率(%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card title="缺陷类型分布" subtitle="各类型缺陷数量统计" icon={<AlertTriangle className="w-5 h-5 text-warning-500" />}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defectTypeStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {defectTypeStats.map((_, index) => (
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
            <div className="grid grid-cols-2 gap-1 mt-2">
              {defectTypeStats.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-dark-300 flex-1 truncate">{item.name}</span>
                  <span className="text-white font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card
            title="质检记录"
            subtitle="所有质量检验记录列表"
            icon={<ShieldCheck className="w-5 h-5" />}
            action={
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  placeholder="搜索..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-white text-sm placeholder-dark-400 focus:outline-none focus:border-industrial-500"
                />
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">工单号</th>
                    <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">产品</th>
                    <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">总数</th>
                    <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">良品</th>
                    <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">不良</th>
                    <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">合格率</th>
                    <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">检验时间</th>
                    <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChecks.map((qc) => (
                    <tr key={qc.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                      <td className="py-3 px-4 text-industrial-400 font-mono text-sm">{qc.workOrderNo}</td>
                      <td className="py-3 px-4 text-white text-sm">{qc.productName}</td>
                      <td className="py-3 px-4 text-center text-white font-mono text-sm">{qc.totalQty}</td>
                      <td className="py-3 px-4 text-center text-success-500 font-mono text-sm">{qc.passQty}</td>
                      <td className="py-3 px-4 text-center text-danger-500 font-mono text-sm">{qc.failQty}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          size="sm"
                          variant={
                            qc.passRate >= 95 ? 'success' : qc.passRate >= 90 ? 'warning' : 'danger'
                          }
                        >
                          {qc.passRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-dark-300 text-sm font-mono text-xs">
                        {qc.checkTime.slice(5, 16)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedCheck(qc)}
                          className="text-industrial-400 hover:text-industrial-300 text-xs flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card
            title="不合格品跟踪"
            subtitle="需要处理的不合格品"
            icon={<XCircle className="w-5 h-5 text-danger-500" />}
          >
            <UnqualifiedProducts />
          </Card>
        </div>
      </div>

      {selectedCheck && (
        <QualityDetailModal check={selectedCheck} onClose={() => setSelectedCheck(null)} />
      )}
    </div>
  );
}
