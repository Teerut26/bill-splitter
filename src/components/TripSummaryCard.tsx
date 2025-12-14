import { TrendingUp, Crown, Wallet, PieChart } from 'lucide-react';
import { Card } from './ui';
import { formatMoney } from '../utils/formatMoney';

interface TripParticipantStats {
  name: string;
  totalPaid: number;
  totalShare: number;
  net: number;
}

interface TripSummaryCardProps {
  participantStats: TripParticipantStats[];
  totalTripCost: number;
}

// Get top spenders sorted by their share (actual consumption)
const getTopSpenders = (stats: TripParticipantStats[]) => {
  return stats
    .filter(p => p.totalShare > 0)
    .sort((a, b) => b.totalShare - a.totalShare);
};

const TripSummaryCard = ({ participantStats, totalTripCost }: TripSummaryCardProps) => {
  const topSpenders = getTopSpenders(participantStats);
  const maxShare = topSpenders[0]?.totalShare || 0;

  if (topSpenders.length === 0) {
    return null;
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
        <h3 className="font-bold text-amber-700 flex items-center gap-2">
          <TrendingUp size={18} /> ใช้จ่ายเยอะสุดในทริป
        </h3>
        <p className="text-xs text-amber-600 mt-1">
          รวมทุกการหาร • ยอดรวม {formatMoney(totalTripCost)}
        </p>
      </div>
      <div className="p-4 space-y-3">
        {topSpenders.slice(0, 5).map((spender, index) => {
          const percentage = maxShare > 0 ? (spender.totalShare / maxShare) * 100 : 0;
          const isTop = index === 0;
          
          return (
            <div 
              key={spender.name} 
              className={`relative rounded-xl p-4 transition-all ${
                isTop 
                  ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300' 
                  : 'bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${
                    isTop ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    #{index + 1}
                  </span>
                  {isTop && <Crown size={20} className="text-amber-500" />}
                  <span className={`font-bold ${isTop ? 'text-amber-800' : 'text-slate-700'}`}>
                    {spender.name}
                  </span>
                </div>
                <span className={`font-mono font-bold text-lg ${
                  isTop ? 'text-amber-700' : 'text-slate-600'
                }`}>
                  {formatMoney(spender.totalShare)}
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isTop 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400' 
                      : 'bg-slate-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {/* Additional stats */}
              <div className="mt-2 flex gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Wallet size={12} />
                  <span>จ่ายไป {formatMoney(spender.totalPaid)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <PieChart size={12} />
                  <span className={spender.net > 0 ? 'text-emerald-600' : spender.net < 0 ? 'text-red-500' : ''}>
                    สุทธิ {spender.net > 0 ? '+' : ''}{formatMoney(spender.net)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TripSummaryCard;
