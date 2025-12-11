import type { Session } from '../types';
import { TripExportSchema, type TripExport } from '../schemas/tripSchema';

/**
 * Export trip data to JSON file
 */
export const exportTripToJson = (tripName: string, sessions: Session[]): void => {
  const exportData: TripExport = {
    version: 1,
    exportedAt: Date.now(),
    tripName,
    sessions,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${tripName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import and validate trip data from JSON file
 */
export const importTripFromJson = (file: File): Promise<TripExport> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const rawData = JSON.parse(jsonString);
        
        // Validate with Zod
        const result = TripExportSchema.safeParse(rawData);
        
        if (!result.success) {
          const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
          reject(new Error(`ไฟล์ไม่ถูกต้อง:\n${errors}`));
          return;
        }
        
        resolve(result.data);
      } catch {
        reject(new Error('ไม่สามารถอ่านไฟล์ JSON ได้'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Trigger file input dialog for import
 */
export const openImportDialog = (): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      resolve(file || null);
    };
    
    input.click();
  });
};
