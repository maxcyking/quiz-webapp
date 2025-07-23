import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface ClaimedRewardCardProps {
  userRank: any;
  navigate: (path: string) => void;
}

export default function ClaimedRewardCard({ userRank, navigate }: ClaimedRewardCardProps) {
  return (
    <div className="mb-8">
      <div className="rounded-lg border-primary/30 bg-green-50 dark:bg-green-950/20">
        <div className="p-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
              Reward Claimed Successfully!
            </h3>
            <p className="text-green-600 dark:text-green-500">
              ₹{userRank.reward} has been added to your wallet. You can view your balance in your profile.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/profile?tab=rewards')}
            className="px-4 py-2 rounded border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 text-sm font-medium
              hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            View Wallet
          </button>
        </div>
      </div>
    </div>
  );
}