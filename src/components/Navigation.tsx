import { Users, DollarSign, PieChart } from 'lucide-react';
import { NavButton } from './ui';
import type { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => (
  <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-2xl safe-area-pb">
    <div className="max-w-xl mx-auto flex justify-around p-2">
      <NavButton 
        active={activeTab === 'people'} 
        onClick={() => onTabChange('people')} 
        icon={<Users size={20} />} 
        label="สมาชิก" 
      />
      <NavButton 
        active={activeTab === 'expenses'} 
        onClick={() => onTabChange('expenses')} 
        icon={<DollarSign size={20} />} 
        label="จดรายการ" 
      />
      <NavButton 
        active={activeTab === 'report'} 
        onClick={() => onTabChange('report')} 
        icon={<PieChart size={20} />} 
        label="สรุปผล" 
      />
    </div>
  </nav>
);

export default Navigation;
