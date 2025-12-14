import { useState } from 'react';
import { TrendingUp, Crown, Wallet, PieChart, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const topSpenders = getTopSpenders(participantStats);
  const maxShare = topSpenders[0]?.totalShare || 0;

  if (topSpenders.length === 0) {
    return null;
  }

  // Show only top 3 when collapsed, all when expanded
  const displaySpenders = isExpanded ? topSpenders : topSpenders.slice(0, 3);
  const hasMore = topSpenders.length > 3;

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header - Clickable to toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between hover:from-amber-100 hover:to-orange-100 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-bold text-amber-700 flex items-center gap-2">
            <TrendingUp size={18} /> สรุปการใช้จ่ายทั้งทริป
          </h3>
          <p className="text-xs text-amber-600 mt-1">
            {participantStats.length} คน • ยอดรวม {formatMoney(totalTripCost)}
          </p>
        </div>
        <div className="text-amber-600">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Content - Collapsible */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 space-y-3">
          {displaySpenders.map((spender, index) => {
            const percentage = maxShare > 0 ? (spender.totalShare / maxShare) * 100 : 0;
            const percentOfTotal = totalTripCost > 0 ? (spender.totalShare / totalTripCost) * 100 : 0;
            const isTop = index === 0;
            
            return (
              <div 
                key={spender.name} 
                className={`relative rounded-xl p-4 transition-all ${
                  isTop 
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300' 
                    : 'bg-slate-50 border border-slate-100'
                }`}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeIn 0.3s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isTop 
                        ? 'bg-amber-500 text-white' 
                        : index === 1 
                          ? 'bg-slate-400 text-white' 
                          : index === 2 
                            ? 'bg-amber-700 text-white' 
                            : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isTop ? <Crown size={16} /> : index + 1}
                    </div>
                    <div>
                      <span className={`font-bold block ${isTop ? 'text-amber-800' : 'text-slate-700'}`}>
                        {spender.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {percentOfTotal.toFixed(1)}% ของทริป
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold text-lg block ${
                      isTop ? 'text-amber-700' : 'text-slate-600'
                    }`}>
                      {formatMoney(spender.totalShare)}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      isTop 
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400' 
                        : index === 1
                          ? 'bg-gradient-to-r from-slate-400 to-slate-500'
                          : 'bg-slate-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                {/* Additional Stats */}
                <div className="mt-3 flex gap-4 text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Wallet size={12} />
                    <span>จ่ายไป {formatMoney(spender.totalPaid)}</span>
                  </div>
                  <div className={`flex items-center gap-1 font-medium ${
                    spender.net > 0 ? 'text-emerald-600' : spender.net < 0 ? 'text-red-500' : 'text-slate-500'
                  }`}>
                    <PieChart size={12} />
                    <span>
                      {spender.net > 0 ? 'ได้คืน ' : spender.net < 0 ? 'ต้องจ่ายอีก ' : 'พอดี '}
                      {formatMoney(Math.abs(spender.net))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Show more/less button */}
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-center text-sm text-amber-600 hover:text-amber-700 py-2 hover:bg-amber-50 rounded-lg transition-colors"
            >
              {isExpanded ? `ซ่อน (แสดง 3 อันดับแรก)` : `ดูทั้งหมด (${topSpenders.length} คน)`}
            </button>
          )}
        </div>
      </div>
      
      {/* Collapsed Preview */}
      {!isExpanded && topSpenders.length > 0 && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-amber-500" />
              <span className="font-medium text-slate-700">{topSpenders[0].name}</span>
            </div>
            <span className="font-mono font-bold text-amber-700">
              {formatMoney(topSpenders[0].totalShare)}
            </span>
          </div>
          {topSpenders.length > 1 && (
            <p className="text-xs text-slate-400 mt-1">
              และอีก {topSpenders.length - 1} คน...
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default TripSummaryCard;
