import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface NotificationType {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceId: string;
  read: boolean;
  createdAt: string;
  _link: {
    self: { href: string };
    reference: { href: string };
  };
}

interface NotificationResponse {
  data: { items: NotificationType[] } | null;
  error: { message: string } | null;
  status: string;
}

export const useNotifications = (params: Record<string, string> = {}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params);
      const response = await fetch(`/api/notifications?${query.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result: NotificationResponse = await response.json();

      if (result.status === "success" && result.data) {
        const sortedItems = [...result.data.items].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setNotifications(sortedItems);
      } else if (result.error) {
        toast.error(result.error.message);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      toast.error(err.message || "Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // Stringifying params ensures the effect only re-runs if the object values actually change
  }, [JSON.stringify(params)]);

  return { notifications, loading, refetch: fetchResources };
};