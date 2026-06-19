import type {
  User,
  Order,
  BOMItem,
  PurchaseRequest,
  Equipment,
  EquipmentData,
  WorkOrder,
  MaintenanceOrder,
  QualityCheck,
  DefectRecord,
  Material,
  Inventory,
  AGV,
  JITDelivery,
  EnergyRecord,
  WorkOrderCost,
  Alert,
  ProductionStats,
} from '@/types';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const formatDateTime = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');

export const mockUsers: User[] = [
  { id: 'u001', name: '张伟', roleId: 'operator' },
  { id: 'u002', name: '李强', roleId: 'operator' },
  { id: 'u003', name: '王芳', roleId: 'operator' },
  { id: 'u004', name: '赵明', roleId: 'teamLeader' },
  { id: 'u005', name: '陈涛', roleId: 'teamLeader' },
  { id: 'u006', name: '刘军', roleId: 'workshopDirector' },
  { id: 'u007', name: '孙华', roleId: 'factoryManager' },
];

export const mockMaterials: Material[] = [
  { id: 'm001', name: '钢板A3', code: 'ST-A3-001', unit: '张', unitPrice: 120, category: '钢材' },
  { id: 'm002', name: '钢管φ50', code: 'ST-P-050', unit: '根', unitPrice: 85, category: '钢材' },
  { id: 'm003', name: '不锈钢板304', code: 'SS-304-002', unit: '张', unitPrice: 380, category: '不锈钢' },
  { id: 'm004', name: '轴承6205', code: 'BRG-6205', unit: '个', unitPrice: 45, category: '标准件' },
  { id: 'm005', name: '螺栓M10', code: 'BLT-M10-50', unit: '套', unitPrice: 2.5, category: '紧固件' },
  { id: 'm006', name: '电机1.5kW', code: 'MOT-1.5K', unit: '台', unitPrice: 680, category: '电气件' },
  { id: 'm007', name: 'PLC控制器', code: 'PLC-S7-1200', unit: '台', unitPrice: 2800, category: '电气件' },
  { id: 'm008', name: '传感器', code: 'SEN-T-001', unit: '个', unitPrice: 156, category: '电气件' },
  { id: 'm009', name: '油漆红色', code: 'PNT-RED-5L', unit: '桶', unitPrice: 280, category: '化工' },
  { id: 'm010', name: '包装纸箱', code: 'PKG-BOX-01', unit: '个', unitPrice: 8.5, category: '包装' },
];

export const mockInventory: Inventory[] = [
  { id: 'inv001', materialId: 'm001', materialName: '钢板A3', materialCode: 'ST-A3-001', quantity: 156, unit: '张', warehouse: '原料库A区', location: 'A-01-01', safetyStock: 50 },
  { id: 'inv002', materialId: 'm002', materialName: '钢管φ50', materialCode: 'ST-P-050', quantity: 89, unit: '根', warehouse: '原料库A区', location: 'A-02-03', safetyStock: 30 },
  { id: 'inv003', materialId: 'm003', materialName: '不锈钢板304', materialCode: 'SS-304-002', quantity: 42, unit: '张', warehouse: '原料库B区', location: 'B-01-02', safetyStock: 20 },
  { id: 'inv004', materialId: 'm004', materialName: '轴承6205', materialCode: 'BRG-6205', quantity: 320, unit: '个', warehouse: '配件库', location: 'C-03-05', safetyStock: 100 },
  { id: 'inv005', materialId: 'm005', materialName: '螺栓M10', materialCode: 'BLT-M10-50', quantity: 1250, unit: '套', warehouse: '配件库', location: 'C-05-01', safetyStock: 500 },
  { id: 'inv006', materialId: 'm006', materialName: '电机1.5kW', materialCode: 'MOT-1.5K', quantity: 18, unit: '台', warehouse: '电气库', location: 'D-02-01', safetyStock: 10 },
  { id: 'inv007', materialId: 'm007', materialName: 'PLC控制器', materialCode: 'PLC-S7-1200', quantity: 8, unit: '台', warehouse: '电气库', location: 'D-03-02', safetyStock: 5 },
  { id: 'inv008', materialId: 'm008', materialName: '传感器', materialCode: 'SEN-T-001', quantity: 56, unit: '个', warehouse: '电气库', location: 'D-04-01', safetyStock: 20 },
  { id: 'inv009', materialId: 'm009', materialName: '油漆红色', materialCode: 'PNT-RED-5L', quantity: 24, unit: '桶', warehouse: '化工库', location: 'E-01-01', safetyStock: 15 },
  { id: 'inv010', materialId: 'm010', materialName: '包装纸箱', materialCode: 'PKG-BOX-01', quantity: 580, unit: '个', warehouse: '包装库', location: 'F-01-01', safetyStock: 200 },
];

export const mockOrders: Order[] = [
  { id: 'o001', orderNo: 'PO20260619001', productId: 'p001', productName: '输送机A型', productCode: 'CONV-A-001', quantity: 10, deliveryDate: formatDate(new Date(today.getTime() + 7 * 24 * 3600 * 1000)), status: 'producing', createdAt: formatDateTime(new Date(today.getTime() - 2 * 24 * 3600 * 1000)), customerName: '顺丰物流' },
  { id: 'o002', orderNo: 'PO20260619002', productId: 'p002', productName: '货架重型', productCode: 'RACK-H-002', quantity: 50, deliveryDate: formatDate(new Date(today.getTime() + 10 * 24 * 3600 * 1000)), status: 'scheduled', createdAt: formatDateTime(new Date(today.getTime() - 1 * 24 * 3600 * 1000)), customerName: '京东仓储' },
  { id: 'o003', orderNo: 'PO20260619003', productId: 'p003', productName: '工作台不锈钢', productCode: 'BENCH-SS-003', quantity: 30, deliveryDate: formatDate(new Date(today.getTime() + 5 * 24 * 3600 * 1000)), status: 'pending', createdAt: formatDateTime(new Date(today.getTime() - 0.5 * 24 * 3600 * 1000)), customerName: '美的电器' },
  { id: 'o004', orderNo: 'PO20260618001', productId: 'p001', productName: '输送机A型', productCode: 'CONV-A-001', quantity: 5, deliveryDate: formatDate(new Date(today.getTime() - 2 * 24 * 3600 * 1000)), status: 'completed', createdAt: formatDateTime(new Date(today.getTime() - 10 * 24 * 3600 * 1000)), customerName: '圆通速递' },
  { id: 'o005', orderNo: 'PO20260617001', productId: 'p004', productName: '自动化流水线', productCode: 'LINE-AUTO-004', quantity: 2, deliveryDate: formatDate(new Date(today.getTime() + 15 * 24 * 3600 * 1000)), status: 'producing', createdAt: formatDateTime(new Date(today.getTime() - 5 * 24 * 3600 * 1000)), customerName: '富士康科技' },
  { id: 'o006', orderNo: 'PO20260616001', productId: 'p002', productName: '货架重型', productCode: 'RACK-H-002', quantity: 20, deliveryDate: formatDate(new Date(today.getTime() - 1 * 24 * 3600 * 1000)), status: 'completed', createdAt: formatDateTime(new Date(today.getTime() - 12 * 24 * 3600 * 1000)), customerName: '菜鸟网络' },
];

export const getBOMByProduct = (productId: string, quantity: number): BOMItem[] => {
  const bomData: Record<string, { materialId: string; quantityPerUnit: number }[]> = {
    'p001': [
      { materialId: 'm001', quantityPerUnit: 8 },
      { materialId: 'm002', quantityPerUnit: 12 },
      { materialId: 'm004', quantityPerUnit: 4 },
      { materialId: 'm006', quantityPerUnit: 1 },
      { materialId: 'm005', quantityPerUnit: 40 },
      { materialId: 'm009', quantityPerUnit: 0.5 },
      { materialId: 'm010', quantityPerUnit: 1 },
    ],
    'p002': [
      { materialId: 'm001', quantityPerUnit: 4 },
      { materialId: 'm002', quantityPerUnit: 8 },
      { materialId: 'm005', quantityPerUnit: 24 },
      { materialId: 'm009', quantityPerUnit: 0.3 },
    ],
    'p003': [
      { materialId: 'm003', quantityPerUnit: 3 },
      { materialId: 'm002', quantityPerUnit: 4 },
      { materialId: 'm005', quantityPerUnit: 16 },
    ],
    'p004': [
      { materialId: 'm001', quantityPerUnit: 20 },
      { materialId: 'm002', quantityPerUnit: 30 },
      { materialId: 'm003', quantityPerUnit: 5 },
      { materialId: 'm004', quantityPerUnit: 12 },
      { materialId: 'm006', quantityPerUnit: 3 },
      { materialId: 'm007', quantityPerUnit: 1 },
      { materialId: 'm008', quantityPerUnit: 8 },
      { materialId: 'm005', quantityPerUnit: 100 },
      { materialId: 'm009', quantityPerUnit: 2 },
    ],
  };

  const productBOM = bomData[productId] || [];
  return productBOM.map((item, index) => {
    const material = mockMaterials.find(m => m.id === item.materialId);
    const inv = mockInventory.find(i => i.materialId === item.materialId);
    const totalQty = item.quantityPerUnit * quantity;
    const invQty = inv?.quantity || 0;
    const shortage = Math.max(0, totalQty - invQty);
    return {
      id: `bom-${index}`,
      materialId: item.materialId,
      materialName: material?.name || '',
      materialCode: material?.code || '',
      unit: material?.unit || '',
      quantityPerUnit: item.quantityPerUnit,
      totalQuantity: totalQty,
      inventoryQty: invQty,
      shortageQty: shortage,
      unitPrice: material?.unitPrice || 0,
    };
  });
};

export const mockPurchaseRequests: PurchaseRequest[] = [
  { id: 'pr001', prNo: 'PR20260619001', orderId: 'o003', orderNo: 'PO20260619003', materialId: 'm003', materialName: '不锈钢板304', quantity: 48, unit: '张', status: 'pending', createdAt: formatDateTime(new Date(today.getTime() - 0.5 * 24 * 3600 * 1000)) },
  { id: 'pr002', prNo: 'PR20260619002', orderId: 'o005', orderNo: 'PO20260617001', materialId: 'm007', materialName: 'PLC控制器', quantity: 2, unit: '台', status: 'approved', createdAt: formatDateTime(new Date(today.getTime() - 2 * 24 * 3600 * 1000)) },
  { id: 'pr003', prNo: 'PR20260618001', orderId: 'o002', orderNo: 'PO20260619002', materialId: 'm009', materialName: '油漆红色', quantity: 5, unit: '桶', status: 'purchased', createdAt: formatDateTime(new Date(today.getTime() - 3 * 24 * 3600 * 1000)) },
];

export const mockEquipments: Equipment[] = [
  { id: 'e001', name: '数控车床1号', code: 'CNC-L-001', type: '数控车床', status: 'running', currentTemperature: 45, currentSpeed: 1200, currentPower: 8.5, oee: 85.6, capacityPerHour: 15, temperatureThreshold: { min: 20, max: 70 }, speedThreshold: { min: 0, max: 2000 }, powerThreshold: { max: 15 } },
  { id: 'e002', name: '数控车床2号', code: 'CNC-L-002', type: '数控车床', status: 'running', currentTemperature: 52, currentSpeed: 1500, currentPower: 10.2, oee: 91.2, capacityPerHour: 15, temperatureThreshold: { min: 20, max: 70 }, speedThreshold: { min: 0, max: 2000 }, powerThreshold: { max: 15 } },
  { id: 'e003', name: '铣床1号', code: 'MIL-001', type: '铣床', status: 'idle', currentTemperature: 28, currentSpeed: 0, currentPower: 0.5, oee: 72.4, capacityPerHour: 10, temperatureThreshold: { min: 20, max: 60 }, speedThreshold: { min: 0, max: 800 }, powerThreshold: { max: 12 } },
  { id: 'e004', name: '铣床2号', code: 'MIL-002', type: '铣床', status: 'maintenance', currentTemperature: 25, currentSpeed: 0, currentPower: 0, oee: 68.8, capacityPerHour: 10, temperatureThreshold: { min: 20, max: 60 }, speedThreshold: { min: 0, max: 800 }, powerThreshold: { max: 12 } },
  { id: 'e005', name: '焊接机器人1号', code: 'WELD-001', type: '焊接机器人', status: 'running', currentTemperature: 38, currentSpeed: 60, currentPower: 15.8, oee: 78.5, capacityPerHour: 20, temperatureThreshold: { min: 20, max: 80 }, speedThreshold: { min: 0, max: 120 }, powerThreshold: { max: 25 } },
  { id: 'e006', name: '焊接机器人2号', code: 'WELD-002', type: '焊接机器人', status: 'fault', currentTemperature: 65, currentSpeed: 0, currentPower: 0, oee: 0, capacityPerHour: 20, temperatureThreshold: { min: 20, max: 80 }, speedThreshold: { min: 0, max: 120 }, powerThreshold: { max: 25 } },
  { id: 'e007', name: '喷涂线1号', code: 'PAINT-001', type: '喷涂设备', status: 'running', currentTemperature: 32, currentSpeed: 3, currentPower: 5.5, oee: 82.3, capacityPerHour: 30, temperatureThreshold: { min: 20, max: 50 }, speedThreshold: { min: 0, max: 10 }, powerThreshold: { max: 10 } },
  { id: 'e008', name: '组装流水线', code: 'ASM-001', type: '组装线', status: 'running', currentTemperature: 26, currentSpeed: 12, currentPower: 22.5, oee: 88.9, capacityPerHour: 50, temperatureThreshold: { min: 20, max: 40 }, speedThreshold: { min: 0, max: 20 }, powerThreshold: { max: 35 } },
];

export const generateEquipmentHistoryData = (equipmentId: string, hours: number = 6): EquipmentData[] => {
  const data: EquipmentData[] = [];
  const now = new Date();
  const eq = mockEquipments.find(e => e.id === equipmentId);
  const baseTemp = eq?.currentTemperature || 40;
  const baseSpeed = eq?.currentSpeed || 1000;
  const basePower = eq?.currentPower || 8;

  for (let i = hours * 60; i >= 0; i -= 5) {
    const time = new Date(now.getTime() - i * 60 * 1000);
    data.push({
      timestamp: formatDateTime(time),
      temperature: baseTemp + (Math.random() - 0.5) * 10,
      speed: Math.max(0, baseSpeed + (Math.random() - 0.5) * 200),
      power: Math.max(0, basePower + (Math.random() - 0.5) * 3),
    });
  }
  return data;
};

export const mockWorkOrders: WorkOrder[] = [
  { id: 'wo001', workOrderNo: 'WO20260619001', orderId: 'o001', orderNo: 'PO20260619001', productName: '输送机A型', productCode: 'CONV-A-001', equipmentId: 'e001', equipmentName: '数控车床1号', operatorId: 'u001', operatorName: '张伟', teamId: 't001', teamName: '数控一班', planQty: 10, completedQty: 6, goodQty: 6, badQty: 0, startTime: formatDateTime(new Date(today.getTime() - 4 * 3600 * 1000)), planStartTime: formatDateTime(new Date(today.getTime() - 5 * 3600 * 1000)), planEndTime: formatDateTime(new Date(today.getTime() + 3 * 3600 * 1000)), status: 'running', priority: 'high' },
  { id: 'wo002', workOrderNo: 'WO20260619002', orderId: 'o001', orderNo: 'PO20260619001', productName: '输送机A型', productCode: 'CONV-A-001', equipmentId: 'e005', equipmentName: '焊接机器人1号', operatorId: 'u002', operatorName: '李强', teamId: 't001', teamName: '数控一班', planQty: 10, completedQty: 8, goodQty: 7, badQty: 1, startTime: formatDateTime(new Date(today.getTime() - 6 * 3600 * 1000)), planStartTime: formatDateTime(new Date(today.getTime() - 7 * 3600 * 1000)), planEndTime: formatDateTime(new Date(today.getTime() + 1 * 3600 * 1000)), status: 'running', priority: 'high' },
  { id: 'wo003', workOrderNo: 'WO20260619003', orderId: 'o005', orderNo: 'PO20260617001', productName: '自动化流水线', productCode: 'LINE-AUTO-004', equipmentId: 'e002', equipmentName: '数控车床2号', operatorId: 'u003', operatorName: '王芳', teamId: 't002', teamName: '数控二班', planQty: 2, completedQty: 1, goodQty: 1, badQty: 0, startTime: formatDateTime(new Date(today.getTime() - 8 * 3600 * 1000)), planStartTime: formatDateTime(new Date(today.getTime() - 10 * 3600 * 1000)), planEndTime: formatDateTime(new Date(today.getTime() + 20 * 3600 * 1000)), status: 'running', priority: 'medium' },
  { id: 'wo004', workOrderNo: 'WO20260619004', orderId: 'o005', orderNo: 'PO20260617001', productName: '自动化流水线', productCode: 'LINE-AUTO-004', equipmentId: 'e008', equipmentName: '组装流水线', planQty: 2, completedQty: 0, goodQty: 0, badQty: 0, planStartTime: formatDateTime(new Date(today.getTime() + 5 * 3600 * 1000)), planEndTime: formatDateTime(new Date(today.getTime() + 15 * 3600 * 1000)), status: 'pending', priority: 'medium' },
  { id: 'wo005', workOrderNo: 'WO20260619005', orderId: 'o002', orderNo: 'PO20260619002', productName: '货架重型', productCode: 'RACK-H-002', equipmentId: 'e003', equipmentName: '铣床1号', planQty: 50, completedQty: 0, goodQty: 0, badQty: 0, planStartTime: formatDateTime(new Date(today.getTime() + 8 * 3600 * 1000)), planEndTime: formatDateTime(new Date(today.getTime() + 32 * 3600 * 1000)), status: 'pending', priority: 'low' },
  { id: 'wo006', workOrderNo: 'WO20260618001', orderId: 'o004', orderNo: 'PO20260618001', productName: '输送机A型', productCode: 'CONV-A-001', equipmentId: 'e007', equipmentName: '喷涂线1号', operatorId: 'u001', operatorName: '张伟', planQty: 5, completedQty: 5, goodQty: 5, badQty: 0, startTime: formatDateTime(new Date(today.getTime() - 30 * 3600 * 1000)), endTime: formatDateTime(new Date(today.getTime() - 22 * 3600 * 1000)), planStartTime: formatDateTime(new Date(today.getTime() - 32 * 3600 * 1000)), planEndTime: formatDateTime(new Date(today.getTime() - 20 * 3600 * 1000)), status: 'completed', priority: 'high' },
];

export const mockMaintenanceOrders: MaintenanceOrder[] = [
  { id: 'mt001', maintenanceNo: 'MT20260619001', equipmentId: 'e006', equipmentName: '焊接机器人2号', faultType: '电气故障', faultDesc: '焊接机器人2号温度异常升高，触发超温保护停机', status: 'processing', reporterId: 'u002', reporterName: '李强', assigneeId: 'u004', assigneeName: '赵明', createTime: formatDateTime(new Date(today.getTime() - 1 * 3600 * 1000)), startTime: formatDateTime(new Date(today.getTime() - 0.5 * 3600 * 1000)) },
  { id: 'mt002', maintenanceNo: 'MT20260619002', equipmentId: 'e004', equipmentName: '铣床2号', faultType: '机械故障', faultDesc: '主轴异响，需检查轴承', status: 'pending', reporterId: 'u003', reporterName: '王芳', createTime: formatDateTime(new Date(today.getTime() - 2 * 3600 * 1000)) },
  { id: 'mt003', maintenanceNo: 'MT20260618001', equipmentId: 'e003', equipmentName: '铣床1号', faultType: '润滑系统', faultDesc: '润滑油泵压力不足', status: 'completed', reporterId: 'u001', reporterName: '张伟', assigneeId: 'u005', assigneeName: '陈涛', createTime: formatDateTime(new Date(today.getTime() - 28 * 3600 * 1000)), startTime: formatDateTime(new Date(today.getTime() - 26 * 3600 * 1000)), endTime: formatDateTime(new Date(today.getTime() - 24 * 3600 * 1000)) },
];

const defectTypes = [
  { type: 'surface_scratch', name: '表面划伤', severity: 'minor' as const },
  { type: 'dimension_error', name: '尺寸超差', severity: 'major' as const },
  { type: 'welding_defect', name: '焊接缺陷', severity: 'major' as const },
  { type: 'paint_defect', name: '喷漆不良', severity: 'minor' as const },
  { type: 'assembly_error', name: '装配错误', severity: 'critical' as const },
  { type: 'material_defect', name: '材质缺陷', severity: 'critical' as const },
];

export const mockQualityChecks: QualityCheck[] = [
  {
    id: 'qc001', workOrderId: 'wo002', workOrderNo: 'WO20260619002', productName: '输送机A型', totalQty: 8, passQty: 7, failQty: 1, passRate: 87.5,
    checkTime: formatDateTime(new Date(today.getTime() - 2 * 3600 * 1000)), inspector: '质检-李娜',
    defects: [
      { id: 'd001', qualityCheckId: 'qc001', defectType: 'welding_defect', defectName: '焊接缺陷', quantity: 1, severity: 'major', description: '焊缝有气孔', isLocked: true, lockTime: formatDateTime(new Date(today.getTime() - 2 * 3600 * 1000)), workOrderNo: 'WO20260619002' },
    ],
  },
  {
    id: 'qc002', workOrderId: 'wo006', workOrderNo: 'WO20260618001', productName: '输送机A型', totalQty: 5, passQty: 5, failQty: 0, passRate: 100,
    checkTime: formatDateTime(new Date(today.getTime() - 22 * 3600 * 1000)), inspector: '质检-李娜',
    defects: [],
  },
  {
    id: 'qc003', workOrderId: 'wo001', workOrderNo: 'WO20260619001', productName: '输送机A型', totalQty: 6, passQty: 6, failQty: 0, passRate: 100,
    checkTime: formatDateTime(new Date(today.getTime() - 1 * 3600 * 1000)), inspector: '质检-王强',
    defects: [],
  },
];

export const mockAGVs: AGV[] = [
  { id: 'agv001', code: 'AGV-001', name: '搬运机器人1号', status: 'working', battery: 78, currentLocation: '原料库A区', currentTaskId: 'jit001' },
  { id: 'agv002', code: 'AGV-002', name: '搬运机器人2号', status: 'idle', battery: 95, currentLocation: '充电区1' },
  { id: 'agv003', code: 'AGV-003', name: '搬运机器人3号', status: 'charging', battery: 32, currentLocation: '充电区2' },
  { id: 'agv004', code: 'AGV-004', name: '搬运机器人4号', status: 'working', battery: 65, currentLocation: '组装车间', currentTaskId: 'jit002' },
  { id: 'agv005', code: 'AGV-005', name: '搬运机器人5号', status: 'fault', battery: 45, currentLocation: '维修区' },
];

export const mockJITDeliveries: JITDelivery[] = [
  { id: 'jit001', deliveryNo: 'JIT20260619001', workOrderId: 'wo001', workOrderNo: 'WO20260619001', agvId: 'agv001', agvCode: 'AGV-001', materialId: 'm001', materialName: '钢板A3', quantity: 8, unit: '张', fromLocation: '原料库A区', toLocation: '数控车床1号工位', status: 'delivering', planTime: formatDateTime(new Date(today.getTime() + 0.5 * 3600 * 1000)) },
  { id: 'jit002', deliveryNo: 'JIT20260619002', workOrderId: 'wo002', workOrderNo: 'WO20260619002', agvId: 'agv004', agvCode: 'AGV-004', materialId: 'm004', materialName: '轴承6205', quantity: 4, unit: '个', fromLocation: '配件库', toLocation: '焊接机器人1号工位', status: 'delivering', planTime: formatDateTime(new Date(today.getTime() + 1 * 3600 * 1000)) },
  { id: 'jit003', deliveryNo: 'JIT20260619003', workOrderId: 'wo003', workOrderNo: 'WO20260619003', materialId: 'm003', materialName: '不锈钢板304', quantity: 3, unit: '张', fromLocation: '原料库B区', toLocation: '数控车床2号工位', status: 'pending', planTime: formatDateTime(new Date(today.getTime() + 3 * 3600 * 1000)) },
  { id: 'jit004', deliveryNo: 'JIT20260618001', workOrderId: 'wo006', workOrderNo: 'WO20260618001', agvId: 'agv002', agvCode: 'AGV-002', materialId: 'm009', materialName: '油漆红色', quantity: 0.5, unit: '桶', fromLocation: '化工库', toLocation: '喷涂线1号工位', status: 'delivered', planTime: formatDateTime(new Date(today.getTime() - 28 * 3600 * 1000)), actualTime: formatDateTime(new Date(today.getTime() - 27.5 * 3600 * 1000)) },
];

export const mockEnergyRecords: EnergyRecord[] = [
  { id: 'en001', equipmentId: 'e001', equipmentName: '数控车床1号', date: formatDate(today), powerConsumption: 68.5, standardConsumption: 72, isOverLimit: false },
  { id: 'en002', equipmentId: 'e002', equipmentName: '数控车床2号', date: formatDate(today), powerConsumption: 81.2, standardConsumption: 72, isOverLimit: true },
  { id: 'en003', equipmentId: 'e003', equipmentName: '铣床1号', date: formatDate(today), powerConsumption: 24.3, standardConsumption: 48, isOverLimit: false },
  { id: 'en004', equipmentId: 'e005', equipmentName: '焊接机器人1号', date: formatDate(today), powerConsumption: 125.6, standardConsumption: 120, isOverLimit: true },
  { id: 'en005', equipmentId: 'e007', equipmentName: '喷涂线1号', date: formatDate(today), powerConsumption: 44.8, standardConsumption: 50, isOverLimit: false },
  { id: 'en006', equipmentId: 'e008', equipmentName: '组装流水线', date: formatDate(today), powerConsumption: 180.2, standardConsumption: 200, isOverLimit: false },
];

export const generateEnergyHourlyData = (equipmentId: string): { hour: number; consumption: number }[] => {
  const data: { hour: number; consumption: number }[] = [];
  const eq = mockEquipments.find(e => e.id === equipmentId);
  const basePower = eq?.currentPower || 8;
  for (let h = 0; h < 24; h++) {
    const isWorking = h >= 8 && h <= 18;
    const consumption = isWorking ? basePower * (0.8 + Math.random() * 0.4) : basePower * 0.1 * Math.random();
    data.push({ hour: h, consumption: parseFloat(consumption.toFixed(1)) });
  }
  return data;
};

export const mockWorkOrderCosts: WorkOrderCost[] = [
  { id: 'cost001', workOrderId: 'wo006', workOrderNo: 'WO20260618001', orderId: 'order002', orderNo: 'PO20260618001', productName: '输送机A型', productCode: 'P001', quantity: 5, materialCost: 4520, laborCost: 1280, energyCost: 356, otherCost: 150, totalCost: 6306, unitCost: 1261.2, revenue: 8500, profit: 2194, profitMargin: 25.8, completedMonth: '2026-06', completedDate: '2026-06-18 16:30:00', isCostAbnormal: false },
  { id: 'cost002', workOrderId: 'wo007', workOrderNo: 'WO20260617001', orderId: 'order003', orderNo: 'PO20260616001', productName: '货架重型', productCode: 'P002', quantity: 20, materialCost: 12800, laborCost: 3600, energyCost: 890, otherCost: 420, totalCost: 17710, unitCost: 885.5, revenue: 24000, profit: 6290, profitMargin: 26.2, completedMonth: '2026-06', completedDate: '2026-06-17 14:20:00', isCostAbnormal: false },
  { id: 'cost003', workOrderId: 'wo008', workOrderNo: 'WO20260616001', orderId: 'order004', orderNo: 'PO20260615001', productName: '工作台不锈钢', productCode: 'P003', quantity: 15, materialCost: 18500, laborCost: 2800, energyCost: 520, otherCost: 280, totalCost: 22100, unitCost: 1473.3, revenue: 30000, profit: 7900, profitMargin: 26.3, completedMonth: '2026-06', completedDate: '2026-06-16 11:45:00', isCostAbnormal: false },
  { id: 'cost004', workOrderId: 'wo009', workOrderNo: 'WO20260615001', orderId: 'order005', orderNo: 'PO20260614001', productName: '输送机A型', productCode: 'P001', quantity: 8, materialCost: 7232, laborCost: 2048, energyCost: 568, otherCost: 240, totalCost: 10088, unitCost: 1261.0, revenue: 13600, profit: 3512, profitMargin: 25.8, completedMonth: '2026-06', completedDate: '2026-06-15 09:10:00', isCostAbnormal: false },
];

export const mockAlerts: Alert[] = [
  { id: 'a001', type: 'equipment', level: 'danger', title: '焊接机器人2号故障停机', message: '温度异常升高至65°C，触发超温保护', timestamp: formatDateTime(new Date(today.getTime() - 1 * 3600 * 1000)), isRead: false, relatedId: 'e006' },
  { id: 'a002', type: 'energy', level: 'warning', title: '数控车床2号电耗超标', message: '今日累计电耗81.2kWh，超过标准值12.8%', timestamp: formatDateTime(new Date(today.getTime() - 2 * 3600 * 1000)), isRead: false, relatedId: 'e002' },
  { id: 'a003', type: 'quality', level: 'warning', title: '焊接工序发现1件不良品', message: 'WO20260619002批次发现焊接缺陷1件', timestamp: formatDateTime(new Date(today.getTime() - 2.5 * 3600 * 1000)), isRead: true, relatedId: 'wo002' },
  { id: 'a004', type: 'inventory', level: 'warning', title: '不锈钢板304库存不足', message: '库存42张，安全库存20张，订单需求48张，缺口6张', timestamp: formatDateTime(new Date(today.getTime() - 3 * 3600 * 1000)), isRead: true, relatedId: 'm003' },
  { id: 'a005', type: 'equipment', level: 'info', title: '铣床2号开始维护', message: '计划维护：主轴轴承检查', timestamp: formatDateTime(new Date(today.getTime() - 4 * 3600 * 1000)), isRead: true, relatedId: 'e004' },
];

export const mockProductionStats: ProductionStats[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today.getTime() - (6 - i) * 24 * 3600 * 1000);
  const plan = 500 + Math.floor(Math.random() * 100);
  const actual = Math.floor(plan * (0.85 + Math.random() * 0.15));
  return {
    date: formatDate(d),
    planOutput: plan,
    actualOutput: actual,
    achievementRate: parseFloat(((actual / plan) * 100).toFixed(1)),
    oee: parseFloat((75 + Math.random() * 15).toFixed(1)),
    passRate: parseFloat((92 + Math.random() * 6).toFixed(1)),
    defectRate: parseFloat((1 + Math.random() * 4).toFixed(1)),
  };
});

export const defectTypeStats = defectTypes.map(dt => ({
  name: dt.name,
  value: Math.floor(Math.random() * 20) + 5,
  severity: dt.severity,
}));
