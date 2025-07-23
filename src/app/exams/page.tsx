"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FileText } from "lucide-react";
import { convertFirebaseTimestamp } from "@/lib/utils";

function formatDate(date: Date | null): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "Date not available";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "Date not available";
  }
}

export default function ExamsPage() {
  const router = useRouter();
  const { user, exams } = useExam();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const upcomingExams = exams.filter((exam) => exam.isActive && !exam.isCompleted);
  const completedExams = exams.filter((exam) => exam.isCompleted);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Available Exams</h1>

      <Tabs defaultValue="upcoming" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
          <TabsTrigger value="completed">Completed Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingExams.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No upcoming exams scheduled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingExams.map((exam) => (
                <Card key={exam.id} className="overflow-hidden flex flex-col h-full">
                  {exam.thumbnailUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={exam.thumbnailUrl}
                        alt={exam.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{exam.title}</CardTitle>
                      <Badge>{exam.totalQuestions} Questions</Badge>
                    </div>
                    <CardDescription>{exam.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(convertFirebaseTimestamp(exam.startDate))}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{exam.duration} minutes</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{exam.totalQuestions} questions total</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => router.push(`/exams/${exam.id}`)}>
                      Start Exam
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedExams.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No completed exams.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedExams.map((exam) => (
                <Card key={exam.id} className="overflow-hidden flex flex-col h-full">
                  {exam.thumbnailUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={exam.thumbnailUrl}
                        alt={exam.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{exam.title}</CardTitle>
                      {exam.isResultReleased ? (
                        <Badge className="bg-green-600 hover:bg-green-700">Results Available</Badge>
                      ) : (
                        <Badge variant="outline">Pending Results</Badge>
                      )}
                    </div>
                    <CardDescription>{exam.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Completed on {formatDate(convertFirebaseTimestamp(exam.endDate))}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{exam.totalQuestions} questions total</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={exam.isResultReleased ? "default" : "outline"}
                      disabled={!exam.isResultReleased}
                      onClick={() => router.push(`/results/${exam.id}`)}
                    >
                      {exam.isResultReleased ? "View Results" : "Results Pending"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}