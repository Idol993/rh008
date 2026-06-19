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
  ProcessDetail,
  DefectRecord,
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
  mockMaterials,
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
  autoMaintenanceTriggered: Record<string, boolean>;

  login: (userId: string) => boolean;
  logout: () => void;
  hasPermission: (requiredRoles: RoleType[]) => boolean;
  toggleSidebar: () => void;

  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  calculateBOM: (productId: string, quantity: number) => ReturnType<typeof getBOMByProduct>;

  startWorkOrder: (workOrderId: string, operatorId: string, operatorName: string) => void;
  completeWorkOrder: (workOrderId: string) => void;
  pauseWorkOrder: (workOrderId: string) => void;
  addCompletedQty: (workOrderId: string, qty: number, isGood: boolean) => void;
  generateWorkOrders: (orderId: string) => { scheduled: WorkOrder[]; unscheduled: { processName: string; eqType: string; reason: string }[] };
  scheduleAllPendingOrders: () => { totalScheduled: number; totalUnscheduled: number; scheduledOrders: string[]; unscheduledSteps: { orderNo: string; processName: string; eqType: string; reason: string }[] };
  findEquipmentFreeSlot: (equipmentId: string, hours: number, earliestStart?: number) => { start: number; end: number };
  getEquipmentLoad: (equipmentId: string, date: Date) => number;
  getProcessDetails: (workOrderId?: string, filterType?: string) => ProcessDetail[];

  getEquipmentData: (equipmentId: string) => EquipmentData[];
  updateEquipmentData: (equipmentId: string, data: EquipmentData) => void;
  updateEquipmentStatus: (equipmentId: string, status: Equipment['status']) => void;

  addAlert: (alert: Omit<Alert, 'id' | 'isRead'>) => void;
  markAlertRead: (alertId: string) => void;

  addQualityCheck: (check: Omit<QualityCheck, 'id'>) => void;
  lockDefectProducts: (qualityCheckId: string, defectIds: string[]) => void;
  markAlertAsRead: (alertId: string) => void;
  addPurchaseRequest: (pr: Omit<PurchaseRequest, 'id' | 'createdAt'>) => void;
  addMaintenanceOrder: (mo: Omit<MaintenanceOrder, 'id' | 'createTime' | 'maintenanceNo'>) => void;
  addWorkOrderCost: (cost: Omit<WorkOrderCost, 'id'>) => void;
  calculateWorkOrderCost: (workOrderId: string) => WorkOrderCost | null;
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
  autoMaintenanceTriggered: {},

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
    return newOrder;
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

  findEquipmentFreeSlot: (equipmentId, hours, earliestStart) => {
    const state = get();
    const now = Date.now();
    const minStart = earliestStart || now;

    const eqWorkOrders = state.workOrders
      .filter(wo => wo.equipmentId === equipmentId)
      .map(wo => ({
        start: new Date(wo.planStartTime).getTime(),
        end: new Date(wo.planEndTime).getTime(),
      }))
      .sort((a, b) => a.start - b.start);

    const workMinutes = hours * 60 * 60 * 1000;
    let candidateStart = minStart;

    for (let i = 0; i < eqWorkOrders.length; i++) {
      const busy = eqWorkOrders[i];
      const candidateEnd = candidateStart + workMinutes;
      if (candidateEnd <= busy.start) {
        break;
      }
      if (candidateStart < busy.end) {
        candidateStart = busy.end;
      }
    }

    return {
      start: candidateStart,
      end: candidateStart + workMinutes,
    };
  },

  getEquipmentLoad: (equipmentId, date) => {
    const workOrders = get().workOrders.filter(wo => wo.equipmentId === equipmentId);
    const dateStr = date.toISOString().split('T')[0];
    const dayStart = new Date(dateStr).getTime();
    const dayEnd = dayStart + 24 * 3600 * 1000;
    let totalHours = 0;
    workOrders.forEach(wo => {
      const start = Math.max(dayStart, new Date(wo.planStartTime).getTime());
      const end = Math.min(dayEnd, new Date(wo.planEndTime).getTime());
      if (end > start) {
        totalHours += (end - start) / (1000 * 3600);
      }
    });
    return Math.min(100, (totalHours / 24) * 100);
  },

  getProcessDetails: (workOrderId, filterType) => {
    const state = get();
    let workOrders = workOrderId
      ? state.workOrders.filter(wo => wo.id === workOrderId)
      : [...state.workOrders];

    if (filterType === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      workOrders = workOrders.filter(wo =>
        (wo.planStartTime && wo.planStartTime.startsWith(todayStr)) ||
        (wo.startTime && wo.startTime.startsWith(todayStr)) ||
        (wo.endTime && wo.endTime.startsWith(todayStr))
      );
    }

    const processNameMap: Record<string, string> = {
      '数控车床': '数控加工',
      '铣床': '铣削加工',
      '焊接机器人': '焊接工序',
      '喷涂设备': '喷涂工序',
      '组装线': '组装工序',
    };

    const details: Array<ProcessDetail & { oee: number; achievementRate: number; abnormalCount: number }> = workOrders.map((wo, idx) => {
      const alerts = state.alerts.filter(a => a.relatedId === wo.id);
      const eq = state.equipments.find(e => e.id === wo.equipmentId);
      const achievementRate = wo.planQty > 0 ? wo.completedQty / wo.planQty : 0;
      return {
        id: `proc${wo.id}-${idx}`,
        workOrderId: wo.id,
        workOrderNo: wo.workOrderNo,
        processName: processNameMap[wo.equipmentName] || wo.equipmentName,
        equipmentId: wo.equipmentId,
        equipmentName: wo.equipmentName,
        planQty: wo.planQty,
        completedQty: wo.completedQty,
        goodQty: wo.goodQty,
        badQty: wo.badQty,
        status: wo.status,
        startTime: wo.startTime,
        endTime: wo.endTime,
        operatorName: wo.operatorName,
        abnormalRecords: alerts.map(a => `${a.timestamp.slice(11, 16)} ${a.title}`),
        oee: eq?.oee || 85,
        achievementRate,
        abnormalCount: alerts.length,
      };
    });

    if (filterType === 'oee') {
      details.sort((a, b) => {
        if (a.abnormalCount !== b.abnormalCount) return b.abnormalCount - a.abnormalCount;
        return a.oee - b.oee;
      });
    } else if (filterType === 'achievement') {
      details.sort((a, b) => a.achievementRate - b.achievementRate);
    } else if (filterType === 'quality' || filterType === 'defect') {
      const filtered = details.filter(p => p.badQty > 0 || p.abnormalCount > 0);
      if (filtered.length > 0) {
        filtered.sort((a, b) => (b.badQty + b.abnormalCount) - (a.badQty + a.abnormalCount));
        return filtered;
      }
      details.sort((a, b) => (b.badQty + b.abnormalCount) - (a.badQty + a.abnormalCount));
    }

    return details;
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
            ? { ...w, status: 'completed', endTime: now, completedQty: w.planQty, goodQty: Math.max(w.goodQty, w.planQty - w.badQty) }
            : w
        ),
      }));
      const cost = get().calculateWorkOrderCost(workOrderId);
      if (cost) {
        get().addWorkOrderCost(cost);
      }
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
    const state = get();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return { scheduled: [], unscheduled: [] };

    const deliveryTime = new Date(order.deliveryDate).getTime();
    const now = new Date();
    const daysUntilDelivery = Math.max(1, Math.ceil((deliveryTime - now.getTime()) / (24 * 3600 * 1000)));
    const isUrgent = daysUntilDelivery <= 3;

    const allEquipments = state.equipments;
    const availableEquipments = allEquipments.filter(e => e.status !== 'fault' && e.status !== 'maintenance');

    const processSteps = [
      { eqType: '数控车床', processName: '数控加工', durationHours: 4 },
      { eqType: '铣床', processName: '铣削加工', durationHours: 3 },
      { eqType: '焊接机器人', processName: '焊接工序', durationHours: 3 },
      { eqType: '喷涂设备', processName: '喷涂工序', durationHours: 2 },
      { eqType: '组装线', processName: '组装工序', durationHours: 4 },
    ];

    const scheduled: WorkOrder[] = [];
    const unscheduled: { processName: string; eqType: string; reason: string }[] = [];
    let prevStepEndTime = now.getTime();

    processSteps.forEach((step, idx) => {
      const allTypeEquipments = allEquipments.filter(e => e.type === step.eqType);
      if (allTypeEquipments.length === 0) {
        unscheduled.push({
          processName: step.processName,
          eqType: step.eqType,
          reason: `工厂无${step.eqType}类型设备`,
        });
        return;
      }

      const candidates = availableEquipments.filter(e => e.type === step.eqType);
      if (candidates.length === 0) {
        const faultCount = allTypeEquipments.filter(e => e.status === 'fault').length;
        const maintCount = allTypeEquipments.filter(e => e.status === 'maintenance').length;
        unscheduled.push({
          processName: step.processName,
          eqType: step.eqType,
          reason: `${faultCount > 0 ? faultCount + '台故障' : ''}${maintCount > 0 ? '、' + maintCount + '台维护中' : ''}，无可用设备`,
        });
        return;
      }

      const estimatedHours = step.durationHours * Math.max(1, (order.quantity / 20));
      const actualHours = Math.max(2, Math.min(8, estimatedHours));

      const candidateSlots = candidates.map(eq => {
        const slot = state.findEquipmentFreeSlot(eq.id, actualHours, prevStepEndTime);
        const load = state.getEquipmentLoad(eq.id, new Date(slot.start));
        const oee = eq.oee;
        return { eq, slot, load, oee };
      });

      candidateSlots.sort((a, b) => {
        if (a.slot.start !== b.slot.start) return a.slot.start - b.slot.start;
        return a.load - b.load;
      });

      const best = candidateSlots[0];
      const stepStart = new Date(best.slot.start);
      const stepEnd = new Date(best.slot.end);
      prevStepEndTime = stepEnd.getTime();

      const reasons: string[] = [];
      if (isUrgent) reasons.push('交期紧急（≤3天），优先排程');
      if (candidateSlots.length > 1 && best.load < candidateSlots[1].load) {
        reasons.push(`选择${best.eq.name}，负荷${best.load.toFixed(0)}%低于其他设备`);
      }
      if (best.slot.start > prevStepEndTime - actualHours * 3600 * 1000 + 1000 && candidateSlots.length > 1) {
        reasons.push('该设备最早有空档');
      }
      const skippedEquipments = allTypeEquipments.filter(e => e.status === 'fault' || e.status === 'maintenance');
      if (skippedEquipments.length > 0) {
        reasons.push(`已跳过${skippedEquipments.length}台故障/维护设备`);
      }
      if (reasons.length === 0) reasons.push('按EDD最早交期优先规则安排');

      const scheduleReason = reasons.join('；');

      scheduled.push({
        id: `wo${Date.now()}${Math.random().toString(36).slice(2, 6)}-${idx}`,
        workOrderNo: `WO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        orderId: order.id,
        orderNo: order.orderNo,
        productName: order.productName,
        productCode: order.productCode,
        equipmentId: best.eq.id,
        equipmentName: best.eq.name,
        planQty: order.quantity,
        completedQty: 0,
        goodQty: 0,
        badQty: 0,
        planStartTime: stepStart.toISOString().slice(0, 19).replace('T', ' '),
        planEndTime: stepEnd.toISOString().slice(0, 19).replace('T', ' '),
        status: 'pending',
        priority: isUrgent ? 'high' : order.quantity > 30 ? 'medium' : 'low',
        scheduleReason,
        processName: step.processName,
      });
    });

    set(state => ({
      workOrders: [...scheduled, ...state.workOrders],
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, status: 'scheduled' } : o
      ),
    }));

    return { scheduled, unscheduled };
  },

  scheduleAllPendingOrders: () => {
    const state = get();
    const pendingOrders = state.orders
      .filter(o => o.status === 'pending')
      .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

    let totalScheduled = 0;
    const scheduledOrders: string[] = [];
    const unscheduledSteps: { orderNo: string; processName: string; eqType: string; reason: string }[] = [];

    pendingOrders.forEach(o => {
      const result = get().generateWorkOrders(o.id);
      totalScheduled += result.scheduled.length;
      if (result.scheduled.length > 0) scheduledOrders.push(o.orderNo);
      result.unscheduled.forEach(u => {
        unscheduledSteps.push({ orderNo: o.orderNo, ...u });
      });
    });

    return {
      totalScheduled,
      totalUnscheduled: unscheduledSteps.length,
      scheduledOrders,
      unscheduledSteps,
    };
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
    const equipment = get().equipments.find(e => e.id === equipmentId);
    if (!equipment) return;

    const isTempOver = data.temperature > equipment.temperatureThreshold.max;
    const isSpeedOver = data.speed > equipment.speedThreshold.max;
    const isPowerOver = data.power > equipment.powerThreshold.max;
    const isOverThreshold = isTempOver || isSpeedOver || isPowerOver;

    const triggerKey = `${equipmentId}-${new Date().toISOString().slice(0, 13)}`;
    const alreadyTriggered = get().autoMaintenanceTriggered[triggerKey];

    if (isOverThreshold && !alreadyTriggered) {
      let faultType = '';
      let faultDesc = '';
      let alertMessage = '';

      if (isTempOver) {
        faultType = '温度异常';
        faultDesc = `${equipment.name} 温度 ${data.temperature.toFixed(1)}°C 超过阈值 ${equipment.temperatureThreshold.max}°C`;
        alertMessage = faultDesc;
      } else if (isSpeedOver) {
        faultType = '转速异常';
        faultDesc = `${equipment.name} 转速 ${data.speed.toFixed(0)}rpm 超过阈值 ${equipment.speedThreshold.max}rpm`;
        alertMessage = faultDesc;
      } else {
        faultType = '功率异常';
        faultDesc = `${equipment.name} 功率 ${data.power.toFixed(1)}kW 超过阈值 ${equipment.powerThreshold.max}kW`;
        alertMessage = faultDesc;
      }

      get().addMaintenanceOrder({
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        faultType,
        faultDesc,
        status: 'pending',
      });

      get().addAlert({
        type: 'equipment',
        level: 'danger',
        title: `${equipment.name} 参数异常`,
        message: alertMessage,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        relatedId: equipment.id,
      });

      set(state => ({
        autoMaintenanceTriggered: { ...state.autoMaintenanceTriggered, [triggerKey]: true },
        equipments: state.equipments.map(e =>
          e.id === equipmentId ? { ...e, status: 'fault' as const } : e
        ),
      }));
    }

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

  updateEquipmentStatus: (equipmentId, status) => {
    const equipment = get().equipments.find(e => e.id === equipmentId);
    if (!equipment) return;

    if (status === 'fault' && equipment.status !== 'fault') {
      get().addMaintenanceOrder({
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        faultType: '设备故障',
        faultDesc: `${equipment.name} 发生故障，需要紧急维修`,
        status: 'pending',
      });

      get().addAlert({
        type: 'equipment',
        level: 'danger',
        title: `${equipment.name} 故障停机`,
        message: `${equipment.name} 发生故障，已自动创建维修工单`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        relatedId: equipment.id,
      });
    }

    set(state => ({
      equipments: state.equipments.map(e =>
        e.id === equipmentId ? { ...e, status } : e
      ),
    }));
  },

  addAlert: (alert) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      isRead: false,
    };
    set(state => ({ alerts: [newAlert, ...state.alerts].slice(0, 100) }));
  },

  markAlertRead: (alertId) => {
    set(state => ({
      alerts: state.alerts.map(a =>
        a.id === alertId ? { ...a, isRead: true } : a
      ),
    }));
  },

  addQualityCheck: (check) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const defectsWithLock: DefectRecord[] = check.defects.map(d => ({
      ...d,
      isLocked: d.quantity > 0,
      lockTime: d.quantity > 0 ? now : undefined,
      workOrderNo: check.workOrderNo,
    }));

    const newCheck: QualityCheck = {
      ...check,
      id: `qc${Date.now()}`,
      defects: defectsWithLock,
    };

    set(state => ({ qualityChecks: [newCheck, ...state.qualityChecks] }));

    if (check.failQty > 0) {
      get().addAlert({
        type: 'quality',
        level: check.passRate < 85 ? 'danger' : 'warning',
        title: `${check.workOrderNo} 发现不合格品`,
        message: `共检测 ${check.totalQty} 件，不合格 ${check.failQty} 件，合格率 ${check.passRate.toFixed(1)}%，已自动锁定`,
        timestamp: check.checkTime || now,
        relatedId: check.workOrderId,
      });
    }
  },

  lockDefectProducts: (qualityCheckId, defectIds) => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    set(state => ({
      qualityChecks: state.qualityChecks.map(qc => {
        if (qc.id !== qualityCheckId) return qc;
        return {
          ...qc,
          defects: qc.defects.map(d =>
            defectIds.includes(d.id)
              ? { ...d, isLocked: true, lockTime: now }
              : d
          ),
        };
      }),
    }));
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
      id: `pr${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    set(state => ({ purchaseRequests: [newPR, ...state.purchaseRequests] }));
  },

  addMaintenanceOrder: (mo) => {
    const newMO: MaintenanceOrder = {
      ...mo,
      id: `mt${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      maintenanceNo: `MT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    set(state => ({ maintenanceOrders: [newMO, ...state.maintenanceOrders] }));
  },

  addWorkOrderCost: (cost) => {
    const exists = get().workOrderCosts.find(c => c.workOrderNo === cost.workOrderNo);
    if (exists) return;
    const newCost: WorkOrderCost = {
      ...cost,
      id: `cost${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    };
    set(state => ({ workOrderCosts: [newCost, ...state.workOrderCosts] }));
  },

  calculateWorkOrderCost: (workOrderId) => {
    const wo = get().workOrders.find(w => w.id === workOrderId);
    if (!wo) return null;

    const order = get().orders.find(o => o.id === wo.orderId);
    const bom = getBOMByProduct(wo.productName === '输送机A型' ? 'p001' : wo.productName === '货架重型' ? 'p002' : wo.productName === '工作台不锈钢' ? 'p003' : 'p004', wo.planQty);

    let materialCost = 0;
    bom.forEach(item => {
      const mat = mockMaterials.find(m => m.id === item.materialId);
      materialCost += (mat?.unitPrice || 10) * item.totalQuantity;
    });

    const start = wo.startTime ? new Date(wo.startTime).getTime() : Date.now() - 4 * 3600 * 1000;
    const end = wo.endTime ? new Date(wo.endTime).getTime() : Date.now();
    const hours = Math.max(1, (end - start) / (1000 * 3600));
    const laborCost = Math.round(hours * 80);

    const equipment = get().equipments.find(e => e.id === wo.equipmentId);
    const avgPower = equipment?.currentPower || 15;
    const energyCost = Math.round(hours * avgPower * 1.2);

    const otherCost = Math.round((materialCost + laborCost + energyCost) * 0.05);
    const totalCost = materialCost + laborCost + energyCost + otherCost;

    const quantity = wo.completedQty || wo.planQty;
    const unitCost = Math.round(totalCost / quantity * 100) / 100;

    const basePrice = order?.productName.includes('流水线') ? 50000 : order?.productName.includes('工作台') ? 2500 : order?.productName.includes('货架') ? 1800 : 8500;
    const revenue = quantity * basePrice;
    const profit = revenue - totalCost;
    const profitMargin = Math.round((profit / revenue) * 1000) / 10;

    return {
      id: '',
      workOrderNo: wo.workOrderNo,
      orderNo: wo.orderNo,
      productName: wo.productName,
      quantity,
      materialCost: Math.round(materialCost),
      laborCost,
      energyCost,
      otherCost,
      totalCost,
      unitCost,
      revenue,
      profit,
      profitMargin,
    };
  },
}));
