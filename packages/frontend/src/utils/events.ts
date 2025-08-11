const bus = new EventTarget();

export function emit(name: string, detail?: any) {
  bus.dispatchEvent(new CustomEvent(name, { detail }));
}
export function on(name: string, handler: (e: CustomEvent) => void) {
  const wrapped = handler as EventListener;
  bus.addEventListener(name, wrapped);
  return () => bus.removeEventListener(name, wrapped);
}

export const EVENTS = {
  BONUS_CHANGED: 'bonus:changed',
  SALARY_CHANGED: 'salary:changed',
  MEALTICKET_CHANGED: 'mealticket:changed',
};
