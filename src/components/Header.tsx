import { DollarSign } from 'lucide-react';
import { Input } from './ui';

interface HeaderProps {
  eventName: string;
  onEventNameChange: (name: string) => void;
}

const Header = ({ eventName, onEventNameChange }: HeaderProps) => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
    <div className="max-w-xl mx-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
          <DollarSign size={16} strokeWidth={3} />
        </div>
        <h1 className="font-bold text-xl tracking-tight text-slate-800">
          Equality<span className="text-blue-600">Split</span>
        </h1>
      </div>
      <Input 
        value={eventName}
        onChange={(e) => onEventNameChange(e.target.value)}
        className="text-sm border-none bg-transparent p-0 font-medium text-slate-500 focus:ring-0 placeholder-slate-400 w-full"
        placeholder="ตั้งชื่อทริป..."
      />
    </div>
  </header>
);

export default Header;
