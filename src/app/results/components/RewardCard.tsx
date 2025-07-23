import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Medal, Award, Loader2, PartyPopper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface RewardCardProps {
  userRank: any;
  rewardStatus: {[rewardId: string]: 'pending' | 'claimed' | 'processing'};
  userRewardId: string | null;
  claimReward: () => Promise<void>;
  claimingReward: boolean;
  loadingAnimation: boolean;
  navigate: (path: string) => void;
}

export default function RewardCard({
  userRank,
  rewardStatus,
  userRewardId,
  claimReward,
  claimingReward,
  loadingAnimation,
  navigate
}: RewardCardProps) {
  const rewardCardRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="mb-8" ref={rewardCardRef}>
      <div className="rounded-lg border-2 border-primary overflow-hidden bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/30">
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left side - Rank trophy */}
          <div className="md:col-span-3 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10">
              {userRank.rank === 1 ? (
                <Trophy className="h-10 w-10 text-yellow-500" />
              ) : userRank.rank === 2 ? (
                <Medal className="h-10 w-10 text-gray-400" />
              ) : (
                <Award className="h-10 w-10 text-amber-600" />
              )}
            </div>
            <p className="mt-2 text-lg font-bold">
              {userRank.rank}
              {userRank.rank === 1 ? 'st' : userRank.rank === 2 ? 'nd' : userRank.rank === 3 ? 'rd' : 'th'} Place
            </p>
          </div>
          
          {/* Middle - Congrats text */}
          <div className="md:col-span-5 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> 
              Congratulations!
            </h3>
            <p className="text-lg font-medium text-primary mb-2">{userRank.userName}</p>
            <p className="text-muted-foreground mb-3">
              You've earned a reward for your performance!
            </p>
            
            <div className="inline-block bg-white dark:bg-black/20 p-3 rounded-md border border-primary/20">
              <p className="text-sm mb-1">Reward Amount:</p>
              <p className="text-3xl font-bold text-primary">₹{userRank.reward}</p>
            </div>
          </div>
          
          {/* Right - Action button */}
          <div className="md:col-span-4 flex flex-col items-center md:items-end gap-3">
            {loadingAnimation ? (
              <div className="flex flex-col items-center gap-2 p-3">
                <div className="h-12 w-12 rounded-full border-4 border-t-primary border-primary/20 animate-spin"></div>
                <p className="text-sm font-medium text-primary">Processing...</p>
              </div>
            ) : (
              <button 
                onClick={claimReward}
                disabled={claimingReward}
                className="relative px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 min-w-[180px] transition-all
                  focus:outline-none focus:ring-4 focus:ring-green-500/50
                  shadow-[0_0_0_2px_#22c55e,0_10px_20px_-5px_rgba(34,197,94,0.4)]
                  bg-gradient-to-r from-green-500 to-emerald-600
                  hover:from-green-600 hover:to-emerald-700
                  active:shadow-[0_0_0_2px_#22c55e,0_5px_10px_-5px_rgba(34,197,94,0.4)]
                  hover:shadow-[0_0_0_2px_#16a34a,0_12px_25px_-5px_rgba(22,163,74,0.6)]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  disabled:shadow-[0_0_0_2px_rgba(34,197,94,0.4),0_5px_10px_-5px_rgba(34,197,94,0.2)]"
              >
                <PartyPopper className="h-5 w-5" />
                <span>Claim Now</span>
              </button>
            )}
            <p className="text-xs text-center text-muted-foreground">
              Rewards can be withdrawn from your profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}