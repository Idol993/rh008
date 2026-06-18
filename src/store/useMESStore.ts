import { create } from 'zustand';
import type {
  User,
  RoleType,
  Order,
  WorkOrder,
  Equipment,
  EquipmentData,
  Alert,
  QualityCheck,
  Inventory,
  PurchaseRequest,
  MaintenanceOrder,
  JITDelivery,
  AGV,
  EnergyRecord,
  WorkOrderCost,
  ProductionStats,
} from '@/types';
import {
  mockUsers,
  mockOrders,
  mockWorkOrders,
  mockEquipments,
  mockAlerts,
  mockQualityChecks,
  mockInventory,
  mockPurchaseRequests,
  mockMaintenanceOrders,
  mockJITDeliveries,
  mockAGVs,
  mockEnergyRecords,
  mockWorkOrderCosts,
  mockProductionStats,
  getBOMByProduct,
  generateEquipmentHistoryData,
} from '@/mock';

interface MESState {
  currentUser: User | null;
  users: User[];
  orders: Order[];
  workOrders: WorkOrder[];
  equipments: Equipment[];
  equipmentDataMap: Record<string, EquipmentData[]>;
  alerts: Alert[];
  qualityChecks: QualityCheck[];
  inventory: Inventory[];
  purchaseRequests: PurchaseRequest[];
  maintenanceOrders: MaintenanceOrder[];
  jitDeliveries: JITDelivery[];
  agvs: AGV[];
  energyRecords: EnergyRecord[];
  workOrderCosts: WorkOrderCost[];
  productionStats: ProductionStats[];
  sidebarCollapsed: boolean;

  login: (userId: string) => boolean;
  logout: () => void;
  hasPermission: (requiredRoles: RoleType[]) => boolean;
  toggleSidebar: () => void;

  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  calculateBOM: (productId: string, quantity: number) => ReturnType<typeof getBOMByProduct>;

  startWorkOrder: (workOrderId: string, operatorId: string, operatorName: string) => void;
  completeWorkOrder: (workOrderId: string) => void;
  pauseWorkOrder: (workOrderId: string) => void;
  addCompletedQty: (workOrderId: string, qty: number, isGood: boolean) => void;
  generateWorkOrders: (orderId: string) => WorkOrder[];

  getEquipmentData: (equipmentId: string) => EquipmentData[];
  updateEquipmentData: (equipmentId: string, data: EquipmentData) => void;

  addAlert: (alert: Omit<Alert, 'id' | 'isRead'>) => void;
  markAlertRead: (alertId: string) => void;

  addQualityCheck: (check: Omit<QualityCheck, 'id'>) => void;
  markAlertAsRead: (alertId: string) => void;
  addPurchaseRequest: (pr: Omit<PurchaseRequest, 'id' | 'createdAt'>) => void;
  addMaintenanceOrder: (mo: Omit<MaintenanceOrder, 'id' | 'createTime' | 'maintenanceNo'>) => void;
}

export const useMESStore = create<MESState>((set, get) => ({
  currentUser: null,
  users: mockUsers,
  orders: mockOrders,
  workOrders: mockWorkOrders,
  equipments: mockEquipments,
  equipmentDataMap: {},
  alerts: mockAlerts,
  qualityChecks: mockQualityChecks,
  inventory: mockInventory,
  purchaseRequests: mockPurchaseRequests,
  maintenanceOrders: mockMaintenanceOrders,
  jitDeliveries: mockJITDeliveries,
  agvs: mockAGVs,
  energyRecords: mockEnergyRecords,
  workOrderCosts: mockWorkOrderCosts,
  productionStats: mockProductionStats,
  sidebarCollapsed: false,

  login: (userId: string) => {
    const user = get().users.find(u => u.id === userId);
    if (user) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentUser: null });
  },

  hasPermission: (requiredRoles: RoleType[]) => {
    const user = get().currentUser;
    if (!user) return false;
    return requiredRoles.includes(user.roleId);
  },

  toggleSidebar: () => {
    set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  addOrder: (order) => {
    const newOrder: Order = {
      ...order,
      id: `o${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    set(state => ({ orders: [newOrder, ...state.orders] }));
  },

  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, status } : o
      ),
    }));
  },

  calculateBOM: (productId, quantity) => {
    return getBOMByProduct(productId, quantity);
  },

  startWorkOrder: (workOrderId, operatorId, operatorName) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.id === workOrderId
          ? { ...wo, status: 'running', startTime: now, operatorId, operatorName }
          : wo
      ),
    }));
  },

  completeWorkOrder: (workOrderId) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const wo = get().workOrders.find(w => w.id === workOrderId);
    if (wo) {
      set(state => ({
        workOrders: state.workOrders.map(w =>
          w.id === workOrderId
            ? { ...w, status: 'completed', endTime: now, completedQty: w.planQty, goodQty: w.planQty - w.badQty }
            : w
        ),
      }));
    }
  },

  pauseWorkOrder: (workOrderId) => {
    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.id === workOrderId ? { ...wo, status: 'paused' } : wo
      ),
    }));
  },

  addCompletedQty: (workOrderId, qty, isGood) => {
    set(state => ({
      workOrders: state.workOrders.map(wo => {
        if (wo.id !== workOrderId) return wo;
        const newCompleted = wo.completedQty + qty;
        const newGood = isGood ? wo.goodQty + qty : wo.goodQty;
        const newBad = isGood ? wo.badQty : wo.badQty + qty;
        return { ...wo, completedQty: newCompleted, goodQty: newGood, badQty: newBad };
      }),
    }));
  },

  generateWorkOrders: (orderId) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return [];

    const availableEquipments = get().equipments.filter(e => e.status !== 'fault');
    const newWorkOrders: WorkOrder[] = [];

    const processSteps = [
      { eqType: '数控车床', eqPrefix: '数控车' },
      { eqType: '铣床', eqPrefix: '铣' },
      { eqType: '焊接机器人', eqPrefix: '焊接' },
      { eqType: '喷涂设备', eqPrefix: '喷涂' },
      { eqType: '组装线', eqPrefix: '组装' },
    ];

    const now = new Date();
    processSteps.forEach((step, idx) => {
      const eq = availableEquipments.find(e => e.type === step.eqType);
      if (eq) {
        const startOffset = idx * 4;
        const endOffset = (idx + 1) * 4;
        newWorkOrders.push({
          id: `wo${Date.now()}-${idx}`,
          workOrderNo: `WO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          orderId: order.id,
          orderNo: order.orderNo,
          productName: order.productName,
          productCode: order.productCode,
          equipmentId: eq.id,
          equipmentName: eq.name,
          planQty: order.quantity,
          completedQty: 0,
          goodQty: 0,
          badQty: 0,
          planStartTime: new Date(now.getTime() + startOffset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          planEndTime: new Date(now.getTime() + endOffset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          status: 'pending',
          priority: order.quantity > 30 ? 'high' : order.quantity > 10 ? 'medium' : 'low',
        });
      }
    });

    set(state => ({
      workOrders: [...newWorkOrders, ...state.workOrders],
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, status: 'scheduled' } : o
      ),
    }));

    return newWorkOrders;
  },

  getEquipmentData: (equipmentId) => {
    const cached = get().equipmentDataMap[equipmentId];
    if (cached && cached.length > 0) return cached;
    const data = generateEquipmentHistoryData(equipmentId, 6);
    set(state => ({
      equipmentDataMap: { ...state.equipmentDataMap, [equipmentId]: data },
    }));
    return data;
  },

  updateEquipmentData: (equipmentId, data) => {
    set(state => {
      const existing = state.equipmentDataMap[equipmentId] || [];
      const updated = [...existing, data].slice(-200);
      return {
        equipmentDataMap: { ...state.equipmentDataMap, [equipmentId]: updated },
        equipments: state.equipments.map(e =>
          e.id === equipmentId
            ? { ...e, currentTemperature: data.temperature, currentSpeed: data.speed, currentPower: data.power }
            : e
        ),
      };
    });
  },

  addAlert: (alert) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert${Date.now()}`,
      isRead: false,
    };
    set(state => ({ alerts: [newAlert, ...state.alerts] }));
  },

  markAlertRead: (alertId) => {
    set(state => ({
      alerts: state.alerts.map(a =>
        a.id === alertId ? { ...a, isRead: true } : a
      ),
    }));
  },

  addQualityCheck: (check) => {
    const newCheck: QualityCheck = {
      ...check,
      id: `qc${Date.now()}`,
    };
    set(state => ({ qualityChecks: [newCheck, ...state.qualityChecks] }));
  },

  markAlertAsRead: (alertId) => {
    set(state => ({
      alerts: state.alerts.map(a =>
        a.id === alertId ? { ...a, isRead: true } : a
      ),
    }));
  },

  addPurchaseRequest: (pr) => {
    const newPR: PurchaseRequest = {
      ...pr,
      id: `pr${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    set(state => ({ purchaseRequests: [newPR, ...state.purchaseRequests] }));
  },

  addMaintenanceOrder: (mo) => {
    const newMO: MaintenanceOrder = {
      ...mo,
      id: `mt${Date.now()}`,
      maintenanceNo: `MT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    set(state => ({ maintenanceOrders: [newMO, ...state.maintenanceOrders] }));
  },
}));
