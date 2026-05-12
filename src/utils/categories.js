export const CATEGORIES = [
  { id: 'alimentacion', name: 'Alimentación', icon: '🍔', color: '#f97316' },
  { id: 'vivienda', name: 'Vivienda', icon: '🏠', color: '#6366f1' },
  { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#3b82f6' },
  { id: 'salud', name: 'Salud', icon: '💊', color: '#10b981' },
  { id: 'educacion', name: 'Educación', icon: '🎓', color: '#8b5cf6' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎮', color: '#ec4899' },
  { id: 'ropa', name: 'Ropa', icon: '👕', color: '#14b8a6' },
  { id: 'servicios', name: 'Servicios', icon: '📱', color: '#f59e0b' },
  { id: 'compras', name: 'Compras', icon: '🛒', color: '#84cc16' },
  { id: 'deudas', name: 'Deudas', icon: '💳', color: '#ef4444' },
  { id: 'otros', name: 'Otros', icon: '🎁', color: '#64748b' },
];

export const PAYMENT_METHODS = [
  { id: 'efectivo', name: 'Efectivo', icon: '💵' },
  { id: 'tarjeta', name: 'Tarjeta', icon: '💳' },
  { id: 'transferencia', name: 'Transferencia', icon: '🏦' },
  { id: 'yape', name: 'Yape/Plin', icon: '📲' },
];

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function getPaymentById(id) {
  return PAYMENT_METHODS.find(p => p.id === id) || PAYMENT_METHODS[0];
}
