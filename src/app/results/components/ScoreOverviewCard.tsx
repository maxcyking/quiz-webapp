import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Target } from "lucide-react";

interface ScoreOverviewCardProps {
  result: any;
  questions: any[];
  userRank: any;
  rankings: any[];
}

export default function ScoreOverviewCard({ result, questions, userRank, rankings }: ScoreOverviewCardProps) {
  // Calculate total possible marks for the exam
  const totalPossibleMarks = questions.reduce((total, q) => total + q.marks, 0);
  
  return (
    <Card className="mb-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold">Your Performance</h2>
                <p className="text-slate-300">Overall exam performance summary</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Total Score</span>
                <span className="text-2xl font-bold">{result.score.toFixed(1)}%</span>
              </div>
              <Progress value={result.score} className="h-2 bg-slate-700" />
              <div className="flex justify-between text-sm text-slate-300">
                <span>Marks Obtained</span>
                <span>{result.totalMarks} out of {totalPossibleMarks}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold">Your Ranking</h2>
                <p className="text-slate-300">Position among all participants</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold">#{userRank?.rank || "-"}</div>
                <div className="text-sm text-slate-300">Your Rank</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{rankings.length}</div>
                <div className="text-sm text-slate-300">Total Participants</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {rankings.length > 0 ? Math.round((rankings.length - (userRank?.rank || 0)) / rankings.length * 100) : 0}%
                </div>
                <div className="text-sm text-slate-300">Percentile</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}