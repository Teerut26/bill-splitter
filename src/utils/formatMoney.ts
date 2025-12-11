/**
 * Format a number as Thai Baht currency
 */
export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', { 
    style: 'currency', 
    currency: 'THB' 
  }).format(amount);
};
