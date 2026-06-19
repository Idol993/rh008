export type RoleType = 'operator' | 'teamLeader' | 'workshopDirector' | 'factoryManager';

export interface User {
  id: string;
  name: string;
  roleId: RoleType;
  avatar?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  deliveryDate: string;
  status: 'pending' | 'scheduled' | 'producing' | 'completed' | 'closed';
  createdAt: string;
  customerName?: string;
}

export interface BOMItem {
  id: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  unit: string;
  quantityPerUnit: number;
  totalQuantity: number;
  inventoryQty: number;
  shortageQty: number;
  unitPrice: number;
}

export interface PurchaseRequest {
  id: string;
  prNo: string;
  orderId: string;
  orderNo: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'approved' | 'purchased' | 'received';
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  code: string;
  type: string;
  status: 'running' | 'idle' | 'maintenance' | 'fault';
  currentTemperature: number;
  currentSpeed: number;
  currentPower: number;
  oee: number;
  capacityPerHour: number;
  temperatureThreshold: { min: number; max: number };
  speedThreshold: { min: number; max: number };
  powerThreshold: { max: number };
}

export interface EquipmentData {
  timestamp: string;
  temperature: number;
  speed: number;
  power: number;
}

export interface WorkOrder {
  id: string;
  workOrderNo: string;
  orderId: string;
  orderNo: string;
  productName: string;
  productCode: string;
  equipmentId: string;
  equipmentName: string;
  operatorId?: string;
  operatorName?: string;
  teamId?: string;
  teamName?: string;
  planQty: number;
  completedQty: number;
  goodQty: number;
  badQty: number;
  startTime?: string;
  endTime?: string;
  planStartTime: string;
  planEndTime: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'abnormal';
  priority: 'high' | 'medium' | 'low';
  scheduleReason?: string;
  processName?: string;
}

export interface ScheduleResult {
  workOrder: WorkOrder;
  reasons: string[];
}

export interface UnscheduledStep {
  orderId: string;
  orderNo: string;
  processName: string;
  eqType: string;
  reason: string;
}

export interface MaintenanceOrder {
  id: string;
  maintenanceNo: string;
  equipmentId: string;
  equipmentName: string;
  faultType: string;
  faultDesc: string;
  status: 'pending' | 'processing' | 'completed';
  reporterId?: string;
  reporterName?: string;
  assigneeId?: string;
  assigneeName?: string;
  createTime: string;
  startTime?: string;
  endTime?: string;
}

export interface QualityCheck {
  id: string;
  workOrderId: string;
  workOrderNo: string;
  productName: string;
  totalQty: number;
  passQty: number;
  failQty: number;
  passRate: number;
  checkTime: string;
  inspector?: string;
  defects: DefectRecord[];
}

export interface DefectRecord {
  id: string;
  qualityCheckId: string;
  defectType: string;
  defectName: string;
  quantity: number;
  severity: 'minor' | 'major' | 'critical';
  description?: string;
  imageUrl?: string;
  isLocked?: boolean;
  lockTime?: string;
  workOrderNo?: string;
}

export interface Material {
  id: string;
  name: string;
  code: string;
  unit: string;
  unitPrice: number;
  category: string;
}

export interface Inventory {
  id: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  quantity: number;
  unit: string;
  warehouse: string;
  location: string;
  safetyStock: number;
}

export interface AGV {
  id: string;
  code: string;
  name: string;
  status: 'idle' | 'working' | 'charging' | 'fault';
  battery: number;
  currentLocation: string;
  currentTaskId?: string;
}

export interface JITDelivery {
  id: string;
  deliveryNo: string;
  workOrderId: string;
  workOrderNo: string;
  agvId?: string;
  agvCode?: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  fromLocation: string;
  toLocation: string;
  status: 'pending' | 'delivering' | 'delivered' | 'failed';
  planTime: string;
  actualTime?: string;
}

export interface EnergyRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: string;
  hour?: number;
  powerConsumption: number;
  standardConsumption: number;
  isOverLimit: boolean;
}

export interface WorkOrderCost {
  id: string;
  workOrderNo: string;
  orderNo: string;
  productName: string;
  quantity: number;
  materialCost: number;
  laborCost: number;
  energyCost: number;
  otherCost: number;
  totalCost: number;
  unitCost: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

export interface Alert {
  id: string;
  type: 'equipment' | 'quality' | 'energy' | 'inventory' | 'delivery';
  level: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedId?: string;
}

export interface ProductionStats {
  date: string;
  planOutput: number;
  actualOutput: number;
  achievementRate: number;
  oee: number;
  passRate: number;
  defectRate: number;
}

export interface EquipmentLoad {
  equipmentId: string;
  equipmentName: string;
  date: string;
  loadHours: number;
  totalHours: number;
  loadRate: number;
  workOrders: { workOrderId: string; workOrderNo: string; startHour: number; endHour: number }[];
}

export interface ProcessDetail {
  id: string;
  workOrderId: string;
  workOrderNo: string;
  processName: string;
  equipmentId: string;
  equipmentName: string;
  planQty: number;
  completedQty: number;
  goodQty: number;
  badQty: number;
  status: string;
  startTime?: string;
  endTime?: string;
  operatorName?: string;
  abnormalRecords?: string[];
}
