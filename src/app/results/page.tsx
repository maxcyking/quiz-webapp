"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Award } from "lucide-react";
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

export default function ResultsPage() {
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

  const completedExams = exams.filter((exam) => exam.isCompleted);
  const availableResults = completedExams.filter((exam) => exam.isResultReleased);
  const pendingResults = completedExams.filter((exam) => !exam.isResultReleased);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Results</h1>

      {completedExams.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">You haven't completed any exams yet.</p>
          <Button onClick={() => router.push("/exams")}>View Available Exams</Button>
        </div>
      ) : (
        <>
          {availableResults.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Available Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {availableResults.map((exam) => (
                  <Card key={exam.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{exam.title}</CardTitle>
                        <Badge className="bg-green-600 hover:bg-green-700">Results Available</Badge>
                      </div>
                      <CardDescription>{exam.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-sm">Completed on {formatDate(convertFirebaseTimestamp(exam.endDate))}</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">Results and rankings are now available</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => router.push(`/results/${exam.id}`)}>
                        View Results
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}

          {pendingResults.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Pending Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingResults.map((exam) => (
                  <Card key={exam.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{exam.title}</CardTitle>
                        <Badge variant="outline">Pending Results</Badge>
                      </div>
                      <CardDescription>{exam.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-sm">Completed on {formatDate(convertFirebaseTimestamp(exam.endDate))}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Results will be available soon</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" disabled>
                        Results Pending
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}