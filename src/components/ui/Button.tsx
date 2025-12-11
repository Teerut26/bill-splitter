interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  className?: string;
  disabled?: boolean;
}

const Button = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false 
}: ButtonProps) => {
  const baseStyle = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 disabled:opacity-50',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-50'
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
