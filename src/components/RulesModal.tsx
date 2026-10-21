import React from 'react';
import { BookOpen, X, Star, Shield, Trophy, RotateCcw } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">How to Play Ludo</h2>
            <p className="text-xs text-slate-400">Official rules & championship guidelines</p>
          </div>
        </div>

        {/* Rules Sections */}
        <div className="space-y-3.5 text-xs text-slate-300">
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <h3 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
              <Trophy className="w-4 h-4" /> 1. Objective of the Game
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Navigate all 4 of your colored tokens around the 52-cell track and into your home column. The first player to bring all 4 tokens into the central Home Goal wins the championship!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <h3 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
              <span>🎲</span> 2. Starting Out (Opening Tokens)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              All tokens start in your corner Home Yard. You must roll a <strong>6</strong> on the dice to move a token from your yard onto your color's starting square on the track.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <h3 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
              <Shield className="w-4 h-4 text-blue-400" /> 3. Capturing & Safe Zones
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Landing on a square occupied by an opponent's token sends that opponent back to their yard. You also receive an <strong>Extra Turn</strong> bonus!
            </p>
            <p className="mt-1 text-slate-400">
              ⭐ <strong>Safe Squares</strong>: Squares marked with a Star and each player's starting arrow square are Safe Zones. Tokens on safe squares cannot be captured.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <h3 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
              <RotateCcw className="w-4 h-4 text-emerald-400" /> 4. Extra Turns & 3-Sixes Rule
            </h3>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300 leading-relaxed">
              <li>Rolling a 6 grants another roll.</li>
              <li>Capturing an opponent token awards an extra roll.</li>
              <li>Successfully moving a token into Home awards an extra roll.</li>
              <li><strong>Fair-Play Rule</strong>: Rolling 3 consecutive sixes cancels the 3rd roll and passes the turn to the next player.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <h3 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
              <span>👑</span> 5. Ranking & Elo Ratings
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Win matches to climb through Bronze, Silver, Gold, Platinum, Diamond, Master, and Grandmaster divisions on the global leaderboard!
            </p>
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl transition cursor-pointer"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
