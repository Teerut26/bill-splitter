import { useRegisterSW } from 'virtual:pwa-register/react';
import { useState } from 'react';

// Hook สำหรับใช้ในหน้า settings เพื่อตรวจสอบและอัปเดต PWA
export function usePWAUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  const checkAndUpdate = async () => {
    setIsUpdating(true);
    try {
      // Force update the service worker
      await updateServiceWorker(true);
    } catch (error) {
      console.error('Failed to update:', error);
    }
    setIsUpdating(false);
  };

  return {
    needRefresh,
    isUpdating,
    checkAndUpdate,
  };
}

// Component ว่างเปล่าเพื่อ register service worker โดยไม่แสดง UI
export function PWAUpdatePrompt() {
  useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  return null;
}
