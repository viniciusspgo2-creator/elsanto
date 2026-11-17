/** Regras puras da operação logística. Mantidas separadas da interface e dos endpoints. */
export const DELIVERY_TRANSITIONS = {
  ASSIGNED: ['ACCEPTED', 'FAILED'],
  ACCEPTED: ['PICKED_UP', 'FAILED'],
  PICKED_UP: ['ON_ROUTE', 'FAILED'],
  ON_ROUTE: ['ARRIVED', 'DELIVERED', 'FAILED'],
  ARRIVED: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: [],
} as const;

export type DeliveryState = keyof typeof DELIVERY_TRANSITIONS;
export function canChangeDelivery(from: DeliveryState, to: DeliveryState): boolean {
  return (DELIVERY_TRANSITIONS[from] as readonly string[]).includes(to);
}
export function mayReassignDelivery(state: DeliveryState): boolean {
  return state === 'ASSIGNED' || state === 'ACCEPTED';
}
export function isClosedDelivery(state: DeliveryState): boolean {
  return state === 'DELIVERED' || state === 'FAILED';
}
