import { writable } from "svelte/store";

export type NotificationType = "share" | "favorite" | "export" | "error";

export interface Notification {
  id: number;
  type: NotificationType;
  text: string;
  timeout: number;
}

export const notificationStore = writable<Notification[]>([]);

export function showNotification(
  type: NotificationType,
  text: string,
  timeout = 2500,
) {
  const id = Date.now();
  notificationStore.update((notifications) => [
    ...notifications,
    { id, type, text, timeout },
  ]);
}

export function hideNotification(id: number) {
  notificationStore.update((notifications) =>
    notifications.filter((n) => n.id !== id),
  );
}
