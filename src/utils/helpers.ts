/**
 * Format date to Vietnamese locale (dd/MM/yyyy)
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format date time to Vietnamese locale
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get color code based on symptom severity (for 3D visualization)
 */
export const getColorBySeverity = (severity: 'mild' | 'moderate' | 'severe'): string => {
  const colorMap: Record<string, string> = {
    mild: '#10b981',      // green-500
    moderate: '#f59e0b',  // amber-500
    severe: '#ef4444',    // red-500
  };
  return colorMap[severity] ?? '#6b7280';
};

/**
 * Generate a simple unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};