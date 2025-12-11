import { PieChart, RefreshCw, Check, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
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

const ReportTab = ({ participants, report, settlements, paidSettlements, onTogglePaid }: ReportTabProps) => (
  <div className="space-y-8 animate-fadeIn">
    
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
              <th className="px-6 py-3">ชื่อ</th>
              <th className="px-6 py-3 text-right">จ่ายไป</th>
              <th className="px-6 py-3 text-right">ส่วนที่ต้องออก</th>
              <th className="px-6 py-3 text-right">สุทธิ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.map(p => {
              const stat = report.stats[p.id];
              const isPositive = stat.net > 0;
              const isNegative = stat.net < 0;
              return (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-700">{p.name}</td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {formatMoney(stat.paid)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {formatMoney(stat.share)}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
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
                    <span className="text-xs text-slate-400">รับเงินจาก</span>
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

export default ReportTab;
