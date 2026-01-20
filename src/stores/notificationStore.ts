import { writable } from 'svelte/store';

export type NotificationType = 'share' | 'favorite';

export interface NotificationData {
  type: NotificationType;
  show: boolean;
  props?: any;
}

export const notificationStore = writable<NotificationData>({ type: 'share', show: false });

export function showNotification(type: NotificationType, props?: any) {
  notificationStore.set({ type, show: true, props });
}

export function hideNotification() {
  notificationStore.update(n => ({ ...n, show: false }));
}