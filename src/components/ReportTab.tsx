import { PieChart, RefreshCw, Check, ArrowRight, CheckCircle2, Circle, Crown, TrendingUp } from 'lucide-react';
import { Card } from './ui';
import { formatMoney } from '../utils/formatMoney';
import type { Participant, Report, Settlement } from '../types';

interface ReportTabProps {
  participants: Participant[];
  report: Report;
  settlements: Settlement[];
  paidSettlements: string[];
  onTogglePaid: (settlementKey: string) => void;
}

// Helper to create a unique key for a settlement
const getSettlementKey = (settlement: Settlement): string => {
  return `${settlement.from}->${settlement.to}->${settlement.amount.toFixed(2)}`;
};

// Get top spenders sorted by their share (actual consumption after splitting)
const getTopSpenders = (participants: Participant[], report: Report) => {
  return participants
    .map(p => ({
      ...p,
      share: report.stats[p.id]?.share || 0
    }))
    .filter(p => p.share > 0)
    .sort((a, b) => b.share - a.share);
};

const ReportTab = ({ participants, report, settlements, paidSettlements, onTogglePaid }: ReportTabProps) => {
  const topSpenders = getTopSpenders(participants, report);
  const maxShare = topSpenders[0]?.share || 0;

  return (
  <div className="space-y-8 animate-fadeIn">

    {/* Top Spenders Card */}
    {topSpenders.length > 0 && (
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
          <h3 className="font-bold text-amber-700 flex items-center gap-2">
            <TrendingUp size={18} /> ใช้จ่ายเยอะสุดในทริป
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {topSpenders.map((spender, index) => {
            const percentage = maxShare > 0 ? (spender.share / maxShare) * 100 : 0;
            const isTop = index === 0;
            
            return (
              <div 
                key={spender.id} 
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
                    {formatMoney(spender.share)}
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
              </div>
            );
          })}
        </div>
      </Card>
    )}
    
    {/* Balances Card */}
    <Card className="p-0">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <PieChart size={18} /> ยอดคงเหลือ
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">ชื่อ</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">จ่ายไป</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">ส่วนที่ต้องออก</th>
              <th className="px-6 py-3 text-right whitespace-nowrap">สุทธิ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.map(p => {
              const stat = report.stats[p.id];
              const isPositive = stat.net > 0;
              const isNegative = stat.net < 0;
              return (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{p.name}</td>
                  <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">
                    {formatMoney(stat.paid)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">
                    {formatMoney(stat.share)}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                    isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    {stat.net > 0 ? '+' : ''}{formatMoney(stat.net)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>

    {/* Settlement Plan */}
    <div className="space-y-4">
      <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
        <RefreshCw size={20} className="text-blue-500" />
        แผนการเคลียร์เงิน
      </h3>
      
      {settlements.length === 0 ? (
        <div className="bg-emerald-50 text-emerald-700 p-6 rounded-xl border border-emerald-100 text-center">
          <Check size={32} className="mx-auto mb-2 opacity-50" />
          <p className="font-medium">เคลียร์ครบหมดแล้ว! ไม่มีใครติดเงินใคร</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {settlements.map((move, idx) => {
            const settlementKey = getSettlementKey(move);
            const isPaid = paidSettlements.includes(settlementKey);
            
            return (
              <div 
                key={idx} 
                className={`bg-white p-4 rounded-xl shadow-sm border-l-4 flex items-center justify-between transition-all duration-200 ${
                  isPaid 
                    ? 'border-emerald-500 bg-emerald-50/50 opacity-75' 
                    : 'border-blue-500'
                }`}
              >
                <button
                  onClick={() => onTogglePaid(settlementKey)}
                  className={`flex-shrink-0 mr-3 p-1 rounded-full transition-all duration-200 hover:scale-110 ${
                    isPaid 
                      ? 'text-emerald-500 hover:text-emerald-600' 
                      : 'text-slate-300 hover:text-blue-500'
                  }`}
                  title={isPaid ? 'คลิกเพื่อยกเลิก' : 'คลิกเพื่อทำเครื่องหมายว่าจ่ายแล้ว'}
                >
                  {isPaid ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className={`font-bold truncate ${isPaid ? 'text-slate-500 line-through' : 'text-red-500'}`}>
                      {move.from}
                    </span>
                    <span className="text-xs text-slate-400">จ่ายให้</span>
                  </div>
                  <ArrowRight size={16} className={isPaid ? 'text-slate-300' : 'text-slate-300'} />
                  <div className="flex flex-col text-right sm:text-left min-w-0">
                    <span className={`font-bold truncate ${isPaid ? 'text-slate-500 line-through' : 'text-emerald-600'}`}>
                      {move.to}
                    </span>
                    <span className="text-xs text-slate-400">รับเงิน</span>
                  </div>
                </div>
                <div className={`font-mono font-bold text-lg ml-3 ${
                  isPaid ? 'text-slate-400 line-through' : 'text-slate-700'
                }`}>
                  {formatMoney(move.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
  );
};

export default ReportTab;
