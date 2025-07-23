"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Users } from "lucide-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function formatDate(date: Date | null): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Date not available';
  }
  
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export default function DashboardPage() {
  const { user, exams, loading, authInitialized } = useExam();
  const router = useRouter();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/login");
    }
  }, [user, authInitialized, router]);

  // Show loading state while checking authentication
  if (!authInitialized || loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated
  if (!user) {
    return null;
  }

  const upcomingExams = exams.filter((exam) => exam.isActive && !exam.isCompleted);
  const completedExams = exams.filter((exam) => exam.isCompleted);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatsCard
          title="Upcoming Exams"
          value={upcomingExams.length.toString()}
          description="Exams scheduled for you"
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatsCard
          title="Completed Exams"
          value={completedExams.length.toString()}
          description="Exams you have taken"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatsCard 
          title="Your Rank" 
          value="#2" 
          description="Among 120 students" 
          icon={<Users className="h-6 w-6" />} 
        />
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Exams</h2>
          <Button variant="outline" asChild>
            <Link href="/exams">View All</Link>
          </Button>
        </div>

        {upcomingExams.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No upcoming exams scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingExams.map((exam) => (
              <Card key={exam.id} className="overflow-hidden flex flex-col h-full">
                {exam.thumbnailUrl && (
                  <div className="h-40 overflow-hidden">
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
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{formatDate(exam.startDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{exam.duration} minutes</span>
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
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Results</h2>
          <Button variant="outline" asChild>
            <Link href="/results">View All</Link>
          </Button>
        </div>

        {completedExams.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No exam results available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedExams.map((exam) => (
              <Card key={exam.id} className="overflow-hidden flex flex-col h-full">
                {exam.thumbnailUrl && (
                  <div className="h-40 overflow-hidden">
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
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-4">
                    {exam.isResultReleased
                      ? "Check your score and see where you rank among your peers."
                      : "Results will be released soon."}
                  </p>
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
      </div>
    </div>
  );
}