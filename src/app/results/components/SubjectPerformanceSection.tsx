import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SubjectPerformanceSectionProps {
  subjects: any[];
  subjectResults: Map<string, {
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    partialAnswers: number;
    totalMarks: number;
    earnedMarks: number;
    score: number;
    visitedQuestions?: number;
    reviewQuestions?: number;
    notVisitedQuestions?: number;
  }>;
}

export default function SubjectPerformanceSection({ subjects, subjectResults }: SubjectPerformanceSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Subject-wise Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map(subject => {
          const stats = subjectResults.get(subject.id);
          if (!stats) return null;

          return (
            <Card key={subject.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{subject.name}</span>
                  <Badge className={cn(
                    stats.score >= 75 ? "bg-green-600" :
                    stats.score >= 50 ? "bg-blue-600" :
                    "bg-red-600"
                  )}>
                    {stats.score.toFixed(1)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Score</span>
                      <span className="text-sm font-medium">{stats.earnedMarks} out of {stats.totalMarks} marks</span>
                    </div>
                    <Progress value={stats.score} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="text-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <div className="font-medium text-green-600 dark:text-green-400">{stats.correctAnswers}</div>
                      <div className="text-muted-foreground">Correct</div>
                    </div>
                    <div className="text-center p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <div className="font-medium text-red-600 dark:text-red-400">{stats.incorrectAnswers}</div>
                      <div className="text-muted-foreground">Incorrect</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <div className="font-medium text-purple-600 dark:text-purple-400">
                        {stats.visitedQuestions || 0}
                      </div>
                      <div className="text-muted-foreground text-xs">Visited Only</div>
                    </div>
                    <div className="text-center p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <div className="font-medium text-orange-600 dark:text-orange-400">
                        {stats.reviewQuestions || 0}
                      </div>
                      <div className="text-muted-foreground text-xs">Marked for Review</div>
                    </div>
                    <div className="text-center p-3 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                      <div className="font-medium text-gray-600 dark:text-gray-400">
                        {stats.notVisitedQuestions || 0}
                      </div>
                      <div className="text-muted-foreground text-xs">Not Visited</div>
                    </div>
                  </div>
                  
                  {stats.partialAnswers > 0 && (
                    <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg mt-4">
                      <div className="font-medium text-blue-600 dark:text-blue-400">{stats.partialAnswers}</div>
                      <div className="text-muted-foreground">Partially Correct</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}