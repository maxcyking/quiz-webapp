import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RewardsSectionProps {
  showRewards: boolean;
  userRank: any;
  rankings: any[];
  navigate: (path: string) => void;
}

export default function RewardsSection({ showRewards, userRank, rankings, navigate }: RewardsSectionProps) {
  if (!showRewards || userRank?.reward) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-5 w-5 text-primary" />
        <p className="text-lg font-semibold">Exam Rewards</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rankings.slice(0, 3).filter(rank => rank.reward).map((ranking, idx) => (
          <Card key={idx} className={`border-${idx === 0 ? 'yellow' : idx === 1 ? 'gray' : 'amber'}-200 dark:border-${idx === 0 ? 'yellow' : idx === 1 ? 'gray' : 'amber'}-800 bg-${idx === 0 ? 'yellow' : idx === 1 ? 'gray' : 'amber'}-50 dark:bg-${idx === 0 ? 'yellow' : idx === 1 ? 'gray' : 'amber'}-900/20`}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-full bg-${idx === 0 ? 'yellow' : idx === 1 ? 'gray' : 'amber'}-100 dark:bg-${idx === 0 ? 'yellow' : idx === 1 ? 'gray' : 'amber'}-800/50 flex items-center justify-center`}>
                  {idx === 0 ? (
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  ) : idx === 1 ? (
                    <Medal className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Award className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : 'rd'} Place
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reward: ₹{ranking.reward}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={ranking.photoURL} />
                  <AvatarFallback>{ranking.userName?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">{ranking.userName}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {userRank && userRank.rank > 3 && (
        <div className="mt-4 text-center bg-muted/40 p-4 rounded-lg">
          <p className="text-sm">
            You ranked #{userRank.rank} in this exam. Aim for the top 3 positions to win rewards in future exams!
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/exams')}>
            Try More Exams
          </Button>
        </div>
      )}
    </div>
  );
}