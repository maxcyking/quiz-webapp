import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, DollarSign } from "lucide-react";

interface TopRankingsSectionProps {
  rankings: any[];
  navigate: (path: string) => void;
  user: any;
}

// Create reward badge component
const RewardBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-amber-400 text-white px-2 py-0.5 rounded-full text-xs font-medium">
        <Trophy className="h-3 w-3" />
        <span>1st Place</span>
      </div>
    );
  } else if (rank === 2) {
    return (
      <div className="flex items-center gap-1 bg-gradient-to-r from-gray-400 to-gray-300 text-white px-2 py-0.5 rounded-full text-xs font-medium">
        <Medal className="h-3 w-3" />
        <span>2nd Place</span>
      </div>
    );
  } else if (rank === 3) {
    return (
      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
        <Award className="h-3 w-3" />
        <span>3rd Place</span>
      </div>
    );
  }
  return null;
};

export default function TopRankingsSection({ rankings, navigate, user }: TopRankingsSectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-base font-semibold">Top Rankings</p>
        <Button variant="link" size="sm" onClick={() => navigate('/rankings')}>
          View All
        </Button>
      </div>

      <div className="space-y-2">
        {rankings.slice(0, 5).map((ranking, index) => (
          <div key={index} className="flex items-center justify-between bg-muted/40 px-3 py-2 rounded-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-xs font-medium">
                {ranking.rank}
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={ranking.photoURL} />
                  <AvatarFallback>{ranking.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium line-clamp-1">
                    {ranking.userName}
                    {ranking.userId === user.id && <span className="ml-1 text-primary text-xs">(You)</span>}
                  </p>
                  <div className="flex items-center gap-2">
                    <RewardBadge rank={ranking.rank} />
                    {ranking.reward && (
                      <div className="flex items-center gap-1 text-emerald-600 text-xs">
                        <DollarSign className="h-3 w-3" />
                        <span>₹{ranking.reward}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {ranking.score.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {ranking.earnedMarks} out of {ranking.totalMarks}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}