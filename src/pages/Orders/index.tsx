import { useState } from 'react';
import { useMESStore } from '@/store/useMESStore';
import { Card, Badge, Button, Input, Select, ProgressBar } from '@/components/ui';
import {
  ShoppingCart,
  Plus,
  Search,
  FileText,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import type { Order, BOMItem } from '@/types';

const statusMap: Record<Order['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'industrial' | 'info' }> = {
  pending: { label: '待排程', variant: 'warning' },
  scheduled: { label: '已排程', variant: 'info' },
  producing: { label: '生产中', variant: 'success' },
  completed: { label: '已完成', variant: 'industrial' },
  closed: { label: '已关闭', variant: 'default' },
};

function OrderForm({ onSubmit, onCancel, products }: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  products: { value: string; label: string }[];
}) {
  const [formData, setFormData] = useState({
    orderNo: '',
    productId: '',
    productName: '',
    quantity: '',
    deliveryDate: '',
    customerName: '',
  });
  const [bomPreview, setBomPreview] = useState<BOMItem[]>([]);
  const calculateBOM = useMESStore((state) => state.calculateBOM);

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.value === productId);
    setFormData(prev => ({ ...prev, productId, productName: product?.label || '' }));
    if (productId && formData.quantity) {
      setBomPreview(calculateBOM(productId, parseInt(formData.quantity) || 0));
    }
  };

  const handleQuantityChange = (qty: string) => {
    setFormData(prev => ({ ...prev, quantity: qty }));
    if (formData.productId && qty) {
      setBomPreview(calculateBOM(formData.productId, parseInt(qty) || 0));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      productCode: 'P-' + formData.productId,
    });
  };

  const hasShortage = bomPreview.some(item => item.shortageQty > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="订单编号"
          placeholder="自动生成"
          value={formData.orderNo}
          onChange={(v) => setFormData(prev => ({ ...prev, orderNo: v }))}
        />
        <Input
          label="客户名称"
          placeholder="请输入客户名称"
          value={formData.customerName}
          onChange={(v) => setFormData(prev => ({ ...prev, customerName: v }))}
        />
        <Select
          label="产品型号"
          value={formData.productId}
          onChange={handleProductChange}
          options={products}
          placeholder="请选择产品"
        />
        <Input
          label="订单数量"
          type="number"
          placeholder="请输入数量"
          value={formData.quantity}
          onChange={handleQuantityChange}
          suffix={<span className="text-dark-400 text-sm">件</span>}
        />
        <Input
          label="交货日期"
          type="date"
          value={formData.deliveryDate}
          onChange={(v) => setFormData(prev => ({ ...prev, deliveryDate: v }))}
        />
      </div>

      {bomPreview.length > 0 && (
        <div className={hasShortage ? 'border border-warning-500/30 bg-warning-500/5' : 'border border-dark-500 bg-dark-700/50'}>
          <div className="px-4 py-3 border-b border-dark-600/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-industrial-400" />
              <span className="text-white font-medium">BOM物料需求预览</span>
            </div>
            {hasShortage && (
              <Badge variant="warning" size="sm">
                <AlertTriangle className="w-3 h-3 mr-1" />
                库存不足
              </Badge>
            )}
          </div>
          <div className="p-4 space-y-2">
            <div className="grid grid-cols-5 text-xs text-dark-400 pb-2 border-b border-dark-600/50">
              <span>物料名称</span>
              <span className="text-center">单耗</span>
              <span className="text-center">总需求</span>
              <span className="text-center">库存</span>
              <span className="text-right">缺口</span>
            </div>
            {bomPreview.map((item) => (
              <div key={item.id} className="grid grid-cols-5 text-sm py-2 items-center">
                <span className="text-white">{item.materialName}</span>
                <span className="text-dark-300 text-center font-mono">{item.quantityPerUnit} {item.unit}</span>
                <span className="text-white text-center font-mono">{item.totalQuantity} {item.unit}</span>
                <span className={`text-center font-mono ${item.inventoryQty >= item.totalQuantity ? 'text-success-500' : 'text-danger-500'}`}>
                  {item.inventoryQty} {item.unit}
                </span>
                <span className={`text-right font-mono font-bold ${item.shortageQty > 0 ? 'text-danger-500' : 'text-success-500'}`}>
                  {item.shortageQty > 0 ? `-${item.shortageQty}` : '充足'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
        <Button variant="ghost" onClick={onCancel}>取消</Button>
        <Button type="submit" icon={<Plus className="w-4 h-4" />}>创建订单</Button>
      </div>
    </form>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const calculateBOM = useMESStore((state) => state.calculateBOM);
  const purchaseRequests = useMESStore((state) => state.purchaseRequests);
  const [expanded, setExpanded] = useState(false);

  const bomItems = calculateBOM(order.productId, order.quantity);
  const orderPRs = purchaseRequests.filter(pr => pr.orderId === order.id);
  const hasShortage = bomItems.some(item => item.shortageQty > 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">{order.orderNo}</h2>
            <p className="text-dark-400 text-sm">{order.productName} - {order.customerName}</p>
          </div>
          <Badge variant={statusMap[order.status].variant}>{statusMap[order.status].label}</Badge>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-dark-700/50 rounded-lg p-3">
              <p className="text-dark-400 text-xs mb-1">订单数量</p>
              <p className="text-white font-bold text-xl font-mono">{order.quantity} 件</p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-3">
              <p className="text-dark-400 text-xs mb-1">交货日期</p>
              <p className="text-white font-bold text-xl font-mono">{order.deliveryDate}</p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-3">
              <p className="text-dark-400 text-xs mb-1">创建时间</p>
              <p className="text-white text-sm font-mono">{order.createdAt}</p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-3">
              <p className="text-dark-400 text-xs mb-1">产品编码</p>
              <p className="text-industrial-400 font-mono text-sm">{order.productCode}</p>
            </div>
          </div>

          <div className="border border-dark-600 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full px-4 py-3 bg-dark-700/30 flex items-center justify-between hover:bg-dark-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-industrial-400" />
                <span className="text-white font-medium">BOM物料清单</span>
                {hasShortage && <Badge variant="warning" size="sm">库存不足</Badge>}
              </div>
              {expanded ? <ChevronDown className="w-4 h-4 text-dark-400" /> : <ChevronRight className="w-4 h-4 text-dark-400" />}
            </button>

            {expanded && (
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-dark-400 border-b border-dark-600">
                      <th className="text-left py-2 font-medium">物料名称</th>
                      <th className="text-center py-2 font-medium">规格型号</th>
                      <th className="text-center py-2 font-medium">单耗</th>
                      <th className="text-center py-2 font-medium">总需求</th>
                      <th className="text-center py-2 font-medium">库存</th>
                      <th className="text-right py-2 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bomItems.map((item) => (
                      <tr key={item.id} className="border-b border-dark-700/50">
                        <td className="py-2.5 text-white">{item.materialName}</td>
                        <td className="py-2.5 text-center text-dark-300 font-mono">{item.materialCode}</td>
                        <td className="py-2.5 text-center text-dark-300 font-mono">{item.quantityPerUnit} {item.unit}</td>
                        <td className="py-2.5 text-center text-white font-mono">{item.totalQuantity} {item.unit}</td>
                        <td className={`py-2.5 text-center font-mono ${item.shortageQty > 0 ? 'text-danger-500' : 'text-success-500'}`}>
                          {item.inventoryQty} {item.unit}
                        </td>
                        <td className="py-2.5 text-right">
                          {item.shortageQty > 0 ? (
                            <span className="text-danger-500 text-xs flex items-center justify-end gap-1">
                              <XCircle className="w-3 h-3" />
                              缺 {item.shortageQty} {item.unit}
                            </span>
                          ) : (
                            <span className="text-success-500 text-xs flex items-center justify-end gap-1">
                              <CheckCircle className="w-3 h-3" />
                              充足
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {orderPRs.length > 0 && (
            <div className="border border-dark-600 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-dark-700/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-warning-500" />
                  <span className="text-white font-medium">关联采购申请</span>
                  <Badge variant="warning" size="sm">{orderPRs.length} 条</Badge>
                </div>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-dark-400 border-b border-dark-600">
                      <th className="text-left py-2 font-medium">申请单号</th>
                      <th className="text-left py-2 font-medium">对应订单</th>
                      <th className="text-left py-2 font-medium">物料名称</th>
                      <th className="text-center py-2 font-medium">缺口数量</th>
                      <th className="text-right py-2 font-medium">审批状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderPRs.map((pr) => (
                      <tr key={pr.id} className="border-b border-dark-700/50">
                        <td className="py-2.5 text-industrial-400 font-mono">{pr.prNo}</td>
                        <td className="py-2.5 text-dark-300 font-mono text-xs">{pr.orderNo}</td>
                        <td className="py-2.5 text-white">{pr.materialName}</td>
                        <td className="py-2.5 text-center text-danger-500 font-mono font-bold">{pr.quantity} {pr.unit}</td>
                        <td className="py-2.5 text-right">
                          <Badge
                            variant={pr.status === 'approved' ? 'success' : pr.status === 'received' ? 'industrial' : pr.status === 'purchased' ? 'info' : 'warning'}
                            size="sm"
                          >
                            {pr.status === 'pending' ? '待审批' : pr.status === 'approved' ? '已批准' : pr.status === 'purchased' ? '已采购' : '已入库'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-dark-600 flex justify-end">
          <Button variant="ghost" onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const orders = useMESStore((state) => state.orders);
  const addOrder = useMESStore((state) => state.addOrder);
  const generateWorkOrders = useMESStore((state) => state.generateWorkOrders);
  const addPurchaseRequest = useMESStore((state) => state.addPurchaseRequest);
  const calculateBOM = useMESStore((state) => state.calculateBOM);
  const addAlert = useMESStore((state) => state.addAlert);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const products = [
    { value: 'p001', label: '输送机A型' },
    { value: 'p002', label: '货架重型' },
    { value: 'p003', label: '工作台不锈钢' },
    { value: 'p004', label: '自动化流水线' },
  ];

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.orderNo.includes(searchText) || o.productName.includes(searchText) || o.customerName?.includes(searchText);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateOrder = (data: any) => {
    const orderNo = data.orderNo || `PO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const newOrder = addOrder({
      ...data,
      orderNo,
      status: 'pending',
    });

    const bom = calculateBOM(data.productId, data.quantity);
    bom.forEach(item => {
      if (item.shortageQty > 0) {
        addPurchaseRequest({
          prNo: `PR${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          orderId: newOrder.id,
          orderNo: orderNo,
          materialId: item.materialId,
          materialName: item.materialName,
          quantity: item.shortageQty,
          unit: item.unit,
          status: 'pending',
        });
        addAlert({
          type: 'inventory',
          level: 'warning',
          title: `${item.materialName} 库存不足`,
          message: `库存${item.inventoryQty}${item.unit}，订单需求${item.totalQuantity}${item.unit}，缺口${item.shortageQty}${item.unit}`,
          timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          relatedId: newOrder.id,
        });
      }
    });

    setShowNewOrder(false);
  };

  const handleScheduleOrder = (order: Order) => {
    const result = generateWorkOrders(order.id);
    if (result.scheduled.length > 0) {
      addAlert({
        type: 'equipment',
        level: 'info',
        title: `订单 ${order.orderNo} 排程完成`,
        message: `成功排程 ${result.scheduled.length} 道工序${result.unscheduled.length > 0 ? `，${result.unscheduled.length} 道未排` : ''}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        relatedId: order.id,
      });
    }
    if (result.unscheduled.length > 0) {
      addAlert({
        type: 'equipment',
        level: 'warning',
        title: `订单 ${order.orderNo} 存在未排工序`,
        message: result.unscheduled.map(u => `${u.processName}: ${u.reason}`).join('；'),
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        relatedId: order.id,
      });
    }
    setSelectedOrder(null);
  };

  const stats = [
    { label: '总订单数', value: orders.length, icon: ShoppingCart, color: 'text-industrial-400' },
    { label: '生产中', value: orders.filter(o => o.status === 'producing').length, icon: TrendingUp, color: 'text-success-500' },
    { label: '待排程', value: orders.filter(o => o.status === 'pending').length, icon: Calendar, color: 'text-warning-500' },
    { label: '已完成', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle, color: 'text-dark-300' },
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
        title="订单管理"
        subtitle="所有订单列表，支持搜索和状态筛选"
        icon={<ShoppingCart className="w-5 h-5" />}
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowNewOrder(true)}>
            新建订单
          </Button>
        }
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="搜索订单号、产品名称、客户..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-industrial-500 transition-colors"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'pending', label: '待排程' },
              { value: 'scheduled', label: '已排程' },
              { value: 'producing', label: '生产中' },
              { value: 'completed', label: '已完成' },
            ]}
            placeholder="全部状态"
            className="w-36"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">订单号</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">产品名称</th>
                <th className="text-left py-3 px-4 text-dark-400 font-medium text-sm">客户</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">数量</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">交货日期</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">库存状态</th>
                <th className="text-center py-3 px-4 text-dark-400 font-medium text-sm">状态</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const bom = calculateBOM(order.productId, order.quantity);
                const hasShortage = bom.some(item => item.shortageQty > 0);
                return (
                  <tr key={order.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-industrial-400 hover:text-industrial-300 font-mono text-sm"
                      >
                        {order.orderNo}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-white text-sm">{order.productName}</td>
                    <td className="py-3 px-4 text-dark-300 text-sm">{order.customerName || '-'}</td>
                    <td className="py-3 px-4 text-center text-white font-mono text-sm">{order.quantity}</td>
                    <td className="py-3 px-4 text-center text-dark-300 text-sm font-mono">{order.deliveryDate}</td>
                    <td className="py-3 px-4 text-center">
                      {hasShortage ? (
                        <Badge variant="warning" size="sm">库存不足</Badge>
                      ) : (
                        <Badge variant="success" size="sm">库存充足</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={statusMap[order.status].variant} size="sm">
                        {statusMap[order.status].label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-dark-400 hover:text-white text-xs flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          详情
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleScheduleOrder(order)}
                            className="text-industrial-400 hover:text-industrial-300 text-xs flex items-center gap-1"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            排程
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showNewOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-dark-600">
              <h2 className="text-white font-bold text-lg">新建订单</h2>
              <p className="text-dark-400 text-sm">录入订单信息，系统自动计算BOM和检查库存</p>
            </div>
            <div className="p-6">
              <OrderForm
                products={products}
                onSubmit={handleCreateOrder}
                onCancel={() => setShowNewOrder(false)}
              />
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
