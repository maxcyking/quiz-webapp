"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal, Trophy, Award } from "lucide-react";
import { ScoreBar } from "@/components/ui/score-bar";

type Ranking = {
  userId: string;
  userName: string;
  examId: string;
  score: number;
  rank: number;
  photoURL?: string;
};

function TopRankedCard({
  rank,
  student,
  icon,
  iconColor,
  borderColor,
}: {
  rank: number;
  student: any;
  icon: React.ReactNode;
  iconColor: string;
  borderColor: string;
}) {
  return (
    <Card className={`border-2 ${borderColor}`}>
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <div className={`w-16 h-16 rounded-full ${iconColor} flex items-center justify-center mx-auto mb-3`}>
            {icon}
          </div>
          <div className="text-xl font-bold">Rank #{rank}</div>
        </div>

        <div className="flex flex-col items-center">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarImage src={student.photoURL || "/placeholder.svg?height=80&width=80"} alt={student.userName} />
            <AvatarFallback className="text-2xl">{student.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-xl font-bold mb-1">{student.userName}</div>
          <div className="text-sm text-muted-foreground mb-3">Student ID: {student.userId}</div>
          <div className="text-3xl font-bold text-primary">{student.score}%</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RankingsPage() {
  const router = useRouter();
  const { user, exams, getRankings } = useExam();
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [displayRankings, setDisplayRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (exams.length > 0) {
      const completedExams = exams.filter((e) => e.isCompleted && e.isResultReleased);
      if (completedExams.length > 0 && !selectedExam) {
        setSelectedExam(completedExams[0].id);
      }
    }
  }, [exams, selectedExam]);

  useEffect(() => {
    if (selectedExam) {
      const fetchRankings = async () => {
        try {
          setLoading(true);
          const examRankings = await getRankings(selectedExam);
          setDisplayRankings(examRankings);
        } catch (error) {
          console.error("Error fetching rankings:", error);
          setDisplayRankings([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRankings();
    }
  }, [selectedExam, getRankings]);

  if (!user) {
    return null;
  }

  const completedExams = exams.filter((e) => e.isCompleted && e.isResultReleased);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Student Rankings</h1>

      {completedExams.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">No exams with published results available.</p>
          <p className="text-sm text-muted-foreground">Rankings will be available once exam results are released.</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <Select value={selectedExam || ""} onValueChange={(value) => setSelectedExam(value)}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select an exam" />
              </SelectTrigger>
              <SelectContent>
                {completedExams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayRankings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <TopRankedCard
                rank={1}
                student={displayRankings[0]}
                icon={<Trophy className="h-8 w-8 text-amber-500" />}
                iconColor="bg-amber-100 dark:bg-amber-900/20"
                borderColor="border-amber-200 dark:border-amber-800"
              />

              {displayRankings.length > 1 && (
                <TopRankedCard
                  rank={2}
                  student={displayRankings[1]}
                  icon={<Medal className="h-8 w-8 text-slate-400" />}
                  iconColor="bg-slate-100 dark:bg-slate-900/20"
                  borderColor="border-slate-200 dark:border-slate-800"
                />
              )}

              {displayRankings.length > 2 && (
                <TopRankedCard
                  rank={3}
                  student={displayRankings[2]}
                  icon={<Award className="h-8 w-8 text-amber-700" />}
                  iconColor="bg-amber-50 dark:bg-amber-900/10"
                  borderColor="border-amber-100 dark:border-amber-900"
                />
              )}
            </div>
          ) : null}

          {!loading && displayRankings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Complete Rankings</CardTitle>
                <CardDescription>All students ranked by their performance on this exam</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 py-3 px-4 border-b bg-muted/50">
                    <div className="col-span-1 font-medium">Rank</div>
                    <div className="col-span-6 font-medium">Student</div>
                    <div className="col-span-3 font-medium">Score</div>
                    <div className="col-span-2 font-medium text-right">Percentile</div>
                  </div>

                  <div className="divide-y">
                    {displayRankings.map((student) => {
                      const percentile = Math.round(
                        ((displayRankings.length - student.rank) / displayRankings.length) * 100
                      );

                      return (
                        <div
                          key={student.userId}
                          className={`grid grid-cols-12 py-3 px-4 items-center ${
                            student.userId === user?.id ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="col-span-1 font-medium">#{student.rank}</div>
                          <div className="col-span-6 flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.photoURL || "/placeholder.svg?height=32&width=32"} alt={student.userName} />
                              <AvatarFallback>{student.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.userName}</div>
                              {student.userId === user?.id && <div className="text-xs text-primary font-medium">You</div>}
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{student.score}%</div>
                              <ScoreBar score={student.score} />
                            </div>
                          </div>
                          <div className="col-span-2 text-right font-medium">{percentile}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && selectedExam && displayRankings.length === 0 && (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">No rankings available for this exam yet.</p>
              <p className="text-sm text-muted-foreground">Rankings will appear once students complete the exam.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}