interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton = ({ active, onClick, icon, label }: NavButtonProps) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-xl transition-all ${
      active 
        ? 'text-blue-600 bg-blue-50' 
        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

export default NavButton;
