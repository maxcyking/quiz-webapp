import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle, MinusCircle, CheckCircle2, XCircle, BookmarkIcon, EyeOff, BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
// Removed MathJax components - using simple text conversion instead
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuestionAnalysisSectionProps {
  subjects: any[];
  questions: any[];
  result: any;
}

export default function QuestionAnalysisSection({ subjects, questions, result }: QuestionAnalysisSectionProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects.length > 0 ? subjects[0].id : "");
  const [showChapterAnalysis, setShowChapterAnalysis] = useState(false);

  const getQuestionStatus = (question: any, userAnswer: any) => {
    // Get status directly from the answer object or from questionStatus
    const status = userAnswer?.status || result.questionStatus?.[question.id] || 'not-attempted';
    
    // Handle different status values
    if (status === 'marked-review') {
      return {
        status: "review",
        label: "Marked for Review",
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
        icon: BookmarkIcon,
        buttonColor: "bg-orange-100 hover:bg-orange-200 text-orange-600 dark:bg-orange-900/30 dark:hover:bg-orange-900/40 dark:text-orange-400"
      };
    }
    
    if (status === 'visited') {
      return {
        status: "visited",
        label: "Visited",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
        icon: AlertCircle,
        buttonColor: "bg-purple-100 hover:bg-purple-200 text-purple-600 dark:bg-purple-900/30 dark:hover:bg-purple-900/40 dark:text-purple-400"
      };
    }
    
    if (status === 'not-attempted' || status === 'not-visited' || (!userAnswer || !userAnswer.answer || userAnswer.answer.length === 0)) {
      return {
        status: "not-attempted",
        label: "Not Attempted",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
        icon: EyeOff,
        buttonColor: "bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400"
      };
    }

    // For answered questions, check if correct, partially correct, or incorrect
    if (userAnswer && userAnswer.answer && userAnswer.answer.length > 0) {
      // Check for partially correct answers in multiple choice questions
      if (question.type === "multiple" && userAnswer.marksEarned > 0 && userAnswer.answer.length < question.correctAnswers.length) {
        return {
          status: "partial",
          label: "Partially Correct",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
          icon: CheckCircle2,
          buttonColor: "bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/40 dark:text-blue-400"
        };
      }

      // Fully correct or incorrect answers
      const isCorrect = userAnswer.marksEarned > 0;
      return isCorrect
        ? {
            status: "correct",
            label: "Correct",
            color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
            icon: Check,
            buttonColor: "bg-green-100 hover:bg-green-200 text-green-600 dark:bg-green-900/30 dark:hover:bg-green-900/40 dark:text-green-400"
          }
        : {
            status: "incorrect",
            label: "Incorrect",
            color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
            icon: XCircle,
            buttonColor: "bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/40 dark:text-red-400"
          };
    }

    // Default case (should not reach here if all states are properly handled)
    return {
      status: "not-attempted",
      label: "Not Attempted",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      icon: MinusCircle,
      buttonColor: "bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400"
    };
  };

  const formatAnswer = (question: any, answer: number[]) => {
    if (!answer || !answer.length) return "Not attempted";

    switch (question.type) {
      case "integer": 
        return answer[0]?.toString() || "No answer";
      case "single": 
        return question.options[answer[0]] || "No answer";
      case "multiple": 
        return answer.map(i => question.options[i]).join(", ");
      default: 
        return "No answer";
    }
  };

  const getAnswerStyle = (question: any, optionIndex: number, userAnswer: any) => {
    if (!userAnswer || !userAnswer.answer) return "bg-muted border-transparent";
    
    const isCorrect = question.type === "single"
      ? question.correctAnswer === optionIndex
      : question.correctAnswers?.includes(optionIndex);
    const isSelected = userAnswer.answer.includes(optionIndex);
    const isPartiallyCorrect = question.type === "multiple" && 
      userAnswer.marksEarned > 0 && 
      userAnswer.answer.length < question.correctAnswers.length;

    if (isSelected && isCorrect) {
      return "bg-green-200 dark:bg-green-900/40 border-green-300 dark:border-green-700";
    }
    if (isSelected && !isCorrect) {
      return isPartiallyCorrect
        ? "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        : "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    }
    if (!isSelected && isCorrect) {
      return "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900";
    }
    return "bg-muted border-transparent";
  };

  const getMarksDisplay = (question: any, userAnswer: any) => {
    if (!userAnswer || !userAnswer.answer || userAnswer.answer.length === 0) {
      return { text: `0 out of ${question.marks}`, color: "text-muted-foreground" };
    }

    const marks = userAnswer.marksEarned;
    const total = question.marks;

    if (marks > 0) {
      const formattedMarks = question.type === "multiple" && 
        marks < total ? marks.toFixed(2) : marks.toString();
      return { 
        text: `${formattedMarks} out of ${total}`, 
        color: "text-green-600 dark:text-green-400 font-medium" 
      };
    }
    if (marks < 0) {
      return { 
        text: `${marks} out of ${total}`, 
        color: "text-red-600 dark:text-red-400 font-medium" 
      };
    }
    return { text: `0 out of ${total}`, color: "text-muted-foreground" };
  };

  // Calculate question status counts for the summary section
  const getQuestionStatusCounts = () => {
    const counts = {
      correct: 0,
      incorrect: 0,
      partial: 0,
      visited: 0,
      review: 0,
      notAttempted: 0
    };
    
    questions.forEach(question => {
      const userAnswer = result.answers.find((a: any) => a.questionId === question.id);
      const status = getQuestionStatus(question, userAnswer);
      
      switch (status.status) {
        case "correct":
          counts.correct++;
          break;
        case "incorrect":
          counts.incorrect++;
          break;
        case "partial":
          counts.partial++;
          break;
        case "visited":
          counts.visited++;
          break;
        case "review":
          counts.review++;
          break;
        case "not-attempted":
          counts.notAttempted++;
          break;
      }
    });
    
    return counts;
  };

  const statusCounts = getQuestionStatusCounts();

  // Chapter/Topic analysis function
  const getChapterAnalysis = () => {
    const chapterStats: {[topic: string]: {
      totalQuestions: number;
      totalMarks: number;
      earnedMarks: number;
      correctAnswers: number;
      incorrectAnswers: number;
      notAttempted: number;
      questionNumbers: number[];
      weakQuestionNumbers: number[];
      goodQuestionNumbers: number[];
      averageMarks: number;
      performance: 'weak' | 'good' | 'average';
    }} = {};

    questions.forEach((question, globalIndex) => {
      const topic = question.topic || question.chapter || 'Uncategorized';
      const userAnswer = result.answers.find((a: any) => a.questionId === question.id);
      const marksEarned = userAnswer?.marksEarned || 0;
      
      if (!chapterStats[topic]) {
        chapterStats[topic] = {
          totalQuestions: 0,
          totalMarks: 0,
          earnedMarks: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          notAttempted: 0,
          questionNumbers: [],
          weakQuestionNumbers: [],
          goodQuestionNumbers: [],
          averageMarks: 0,
          performance: 'average'
        };
      }

      chapterStats[topic].totalQuestions++;
      chapterStats[topic].totalMarks += question.marks;
      chapterStats[topic].earnedMarks += marksEarned;
      chapterStats[topic].questionNumbers.push(globalIndex + 1);

      // Categorize performance
      if (marksEarned <= 0) {
        chapterStats[topic].weakQuestionNumbers.push(globalIndex + 1);
        if (marksEarned < 0) {
          chapterStats[topic].incorrectAnswers++;
        } else {
          chapterStats[topic].notAttempted++;
        }
      } else {
        chapterStats[topic].goodQuestionNumbers.push(globalIndex + 1);
        chapterStats[topic].correctAnswers++;
      }
    });

    // Calculate averages and determine overall performance
    Object.keys(chapterStats).forEach(topic => {
      const stats = chapterStats[topic];
      stats.averageMarks = stats.totalMarks > 0 ? (stats.earnedMarks / stats.totalMarks) * 100 : 0;
      
      if (stats.averageMarks >= 70) {
        stats.performance = 'good';
      } else if (stats.averageMarks <= 30 || stats.earnedMarks <= 0) {
        stats.performance = 'weak';
      } else {
        stats.performance = 'average';
      }
    });

    // Separate weak and good chapters
    const weakChapters = Object.entries(chapterStats).filter(([_, stats]) => stats.performance === 'weak');
    const goodChapters = Object.entries(chapterStats).filter(([_, stats]) => stats.performance === 'good');
    const averageChapters = Object.entries(chapterStats).filter(([_, stats]) => stats.performance === 'average');

    return {
      all: chapterStats,
      weak: weakChapters,
      good: goodChapters,
      average: averageChapters
    };
  };

  const chapterAnalysis = getChapterAnalysis();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Detailed Question Analysis</h2>
        <Button 
          onClick={() => setShowChapterAnalysis(true)}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Chapter Analysis
        </Button>
      </div>
      
      {/* Summary section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Question Summary</CardTitle>
          <CardDescription>Overview of your performance on all questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <div className="font-medium text-green-600 dark:text-green-400">{statusCounts.correct}</div>
              <div className="text-muted-foreground text-sm">Correct</div>
            </div>
            <div className="text-center p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <div className="font-medium text-red-600 dark:text-red-400">{statusCounts.incorrect}</div>
              <div className="text-muted-foreground text-sm">Incorrect</div>
            </div>
            <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <div className="font-medium text-blue-600 dark:text-blue-400">{statusCounts.partial}</div>
              <div className="text-muted-foreground text-sm">Partially Correct</div>
            </div>
            <div className="text-center p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <div className="font-medium text-purple-600 dark:text-purple-400">{statusCounts.visited}</div>
              <div className="text-muted-foreground text-sm">Visited Only</div>
            </div>
            <div className="text-center p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <div className="font-medium text-orange-600 dark:text-orange-400">{statusCounts.review}</div>
              <div className="text-muted-foreground text-sm">Marked for Review</div>
            </div>
            <div className="text-center p-3 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
              <div className="font-medium text-gray-600 dark:text-gray-400">{statusCounts.notAttempted}</div>
              <div className="text-muted-foreground text-sm">Not Attempted</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
        <TabsList className="mb-4">
          {subjects.map(subject => (
            <TabsTrigger key={subject.id} value={subject.id}>
              {subject.name}
              <Badge variant="outline" className="ml-2">
                {questions.filter(q => q.subjectId === subject.id).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {subjects.map(subject => {
          const subjectQuestions = questions.filter(q => q.subjectId === subject.id);
          
          return (
            <TabsContent key={subject.id} value={subject.id}>
              <div className="mb-6 flex flex-wrap gap-2">
                {subjectQuestions.map((question, index) => {
                  const userAnswer = result.answers.find((a: any) => a.questionId === question.id);
                  const status = getQuestionStatus(question, userAnswer);
                  
                  return (
                    <Button
                      key={question.id}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-12 h-12 font-medium",
                        status.buttonColor
                      )}
                      onClick={() => {
                        const element = document.getElementById(`question-${question.id}`);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>

              <div className="space-y-4">
                {subjectQuestions.map((question, index) => {
                  const userAnswer = result.answers.find((a: any) => a.questionId === question.id);
                  const status = getQuestionStatus(question, userAnswer);
                  const StatusIcon = status.icon;
                  const marksDisplay = getMarksDisplay(question, userAnswer);

                  return (
                    <Card key={question.id} id={`question-${question.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="w-full">
                            <CardTitle className="flex items-center justify-between gap-2">
                              Question {index + 1}
                              <Badge className={status.color}>
                                <StatusIcon className="h-3.5 w-3.5 mr-1" />
                                {status.label}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-2 flex justify-between">
                              <span>Marks: {question.marks} | Negative Marks: {question.negativeMark}</span>
                              <span className={cn("ml-4", marksDisplay.color)}>
                                Obtained: {marksDisplay.text}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div 
                            className="text-lg mb-4 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: question.question || '' }}
                          />
                          {question.imageUrl && (
                            <img
                              src={question.imageUrl}
                              alt="Question"
                              className="max-w-full h-auto rounded-lg mb-4"
                            />
                          )}
                        </div>

                        {question.type !== "integer" && (
                          <div className="space-y-2">
                            {question.options.map((option: string, i: number) => {
                              const isCorrect = question.type === "single"
                                ? question.correctAnswer === i
                                : question.correctAnswers?.includes(i);
                              const isSelected = userAnswer?.answer?.includes(i);
                              const style = getAnswerStyle(question, i, userAnswer);

                              return (
                                <div
                                  key={i}
                                  className={`p-3 rounded-md border flex items-center justify-between ${style}`}
                                >
                                  <div 
                                    className="leading-relaxed flex-1"
                                    dangerouslySetInnerHTML={{ __html: option || '' }}
                                  />
                                  {isSelected && (
                                    isCorrect ? (
                                      <Check className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <X className="h-5 w-5 text-red-600" />
                                    )
                                  )}
                                  {!isSelected && isCorrect && (
                                    <Check className="h-5 w-5 text-green-600/50" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {question.type === "integer" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-md border bg-muted">
                              <div>
                                <p className="text-sm text-muted-foreground">Your Answer</p>
                                <p className="font-medium">
                                  {userAnswer && userAnswer.answer ? formatAnswer(question, userAnswer.answer) : "Not attempted"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Correct Answer</p>
                                <p className="font-medium">{question.correctAnswer}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {(question.explanation || question.solution) && (
                          <div className="mt-4 p-4 rounded-md border bg-muted/50">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium mb-1">Explanation</p>
                                <div 
                                  className="text-muted-foreground leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: question.explanation || question.solution || '' }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Chapter Analysis Modal */}
      <Dialog open={showChapterAnalysis} onOpenChange={setShowChapterAnalysis}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Chapter Analysis
            </DialogTitle>
            <DialogDescription>
              Detailed analysis of your performance by topics/chapters. Review weak areas and strengths.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="weak" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weak" className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Weak Areas ({chapterAnalysis.weak.length})
                </TabsTrigger>
                <TabsTrigger value="good" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Strong Areas ({chapterAnalysis.good.length})
                </TabsTrigger>
                <TabsTrigger value="average">
                  Average ({chapterAnalysis.average.length})
                </TabsTrigger>
              </TabsList>

              {/* Weak Areas Tab */}
              <TabsContent value="weak" className="space-y-4 mt-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Focus Areas - Need Improvement
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    These topics need more practice. Focus on understanding concepts and solving more problems.
                  </p>
                </div>

                {chapterAnalysis.weak.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h3 className="font-medium text-green-600 mb-2">Great Performance!</h3>
                      <p className="text-muted-foreground">
                        You don't have any weak areas. Keep up the excellent work!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {chapterAnalysis.weak.map(([topic, stats]) => (
                      <Card key={topic} className="border-red-200 dark:border-red-800">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-red-600 dark:text-red-400">{topic}</CardTitle>
                              <CardDescription>
                                {stats.totalQuestions} questions • {stats.averageMarks.toFixed(1)}% score
                              </CardDescription>
                            </div>
                            <Badge variant="destructive">
                              {stats.earnedMarks}/{stats.totalMarks} marks
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-2 bg-red-100 dark:bg-red-900/20 rounded">
                              <div className="font-medium text-red-600 dark:text-red-400">{stats.incorrectAnswers}</div>
                              <div className="text-xs text-muted-foreground">Incorrect</div>
                            </div>
                            <div className="text-center p-2 bg-gray-100 dark:bg-gray-900/20 rounded">
                              <div className="font-medium text-gray-600 dark:text-gray-400">{stats.notAttempted}</div>
                              <div className="text-xs text-muted-foreground">Not Attempted</div>
                            </div>
                            <div className="text-center p-2 bg-green-100 dark:bg-green-900/20 rounded">
                              <div className="font-medium text-green-600 dark:text-green-400">{stats.correctAnswers}</div>
                              <div className="text-xs text-muted-foreground">Correct</div>
                            </div>
                            <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                              <div className="font-medium text-blue-600 dark:text-blue-400">{stats.totalQuestions}</div>
                              <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                          </div>
                          
                          {stats.weakQuestionNumbers.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 text-red-600 dark:text-red-400">
                                Questions needing attention:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {stats.weakQuestionNumbers.map(qNum => (
                                  <Badge key={qNum} variant="destructive" className="text-xs">
                                    Q{qNum}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Strong Areas Tab */}
              <TabsContent value="good" className="space-y-4 mt-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                    Strong Areas - Well Done!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Excellent performance in these topics. Maintain your understanding and help others.
                  </p>
                </div>

                {chapterAnalysis.good.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <TrendingDown className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                      <h3 className="font-medium text-orange-600 mb-2">Room for Improvement</h3>
                      <p className="text-muted-foreground">
                        Focus on understanding concepts better to achieve strong performance in topics.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {chapterAnalysis.good.map(([topic, stats]) => (
                      <Card key={topic} className="border-green-200 dark:border-green-800">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-green-600 dark:text-green-400">{topic}</CardTitle>
                              <CardDescription>
                                {stats.totalQuestions} questions • {stats.averageMarks.toFixed(1)}% score
                              </CardDescription>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {stats.earnedMarks}/{stats.totalMarks} marks
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-2 bg-green-100 dark:bg-green-900/20 rounded">
                              <div className="font-medium text-green-600 dark:text-green-400">{stats.correctAnswers}</div>
                              <div className="text-xs text-muted-foreground">Correct</div>
                            </div>
                            <div className="text-center p-2 bg-red-100 dark:bg-red-900/20 rounded">
                              <div className="font-medium text-red-600 dark:text-red-400">{stats.incorrectAnswers}</div>
                              <div className="text-xs text-muted-foreground">Incorrect</div>
                            </div>
                            <div className="text-center p-2 bg-gray-100 dark:bg-gray-900/20 rounded">
                              <div className="font-medium text-gray-600 dark:text-gray-400">{stats.notAttempted}</div>
                              <div className="text-xs text-muted-foreground">Not Attempted</div>
                            </div>
                            <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                              <div className="font-medium text-blue-600 dark:text-blue-400">{stats.totalQuestions}</div>
                              <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                          </div>
                          
                          {stats.goodQuestionNumbers.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 text-green-600 dark:text-green-400">
                                Questions answered correctly:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {stats.goodQuestionNumbers.map(qNum => (
                                  <Badge key={qNum} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                    Q{qNum}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Average Areas Tab */}
              <TabsContent value="average" className="space-y-4 mt-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Average Performance Areas
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Good foundation but can be improved with more practice and focused study.
                  </p>
                </div>

                {chapterAnalysis.average.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                      <h3 className="font-medium text-blue-600 mb-2">Clear Performance Pattern</h3>
                      <p className="text-muted-foreground">
                        Your performance is clearly divided between strong and weak areas.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {chapterAnalysis.average.map(([topic, stats]) => (
                      <Card key={topic} className="border-blue-200 dark:border-blue-800">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-blue-600 dark:text-blue-400">{topic}</CardTitle>
                              <CardDescription>
                                {stats.totalQuestions} questions • {stats.averageMarks.toFixed(1)}% score
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">
                              {stats.earnedMarks}/{stats.totalMarks} marks
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-2 bg-green-100 dark:bg-green-900/20 rounded">
                              <div className="font-medium text-green-600 dark:text-green-400">{stats.correctAnswers}</div>
                              <div className="text-xs text-muted-foreground">Correct</div>
                            </div>
                            <div className="text-center p-2 bg-red-100 dark:bg-red-900/20 rounded">
                              <div className="font-medium text-red-600 dark:text-red-400">{stats.incorrectAnswers}</div>
                              <div className="text-xs text-muted-foreground">Incorrect</div>
                            </div>
                            <div className="text-center p-2 bg-gray-100 dark:bg-gray-900/20 rounded">
                              <div className="font-medium text-gray-600 dark:text-gray-400">{stats.notAttempted}</div>
                              <div className="text-xs text-muted-foreground">Not Attempted</div>
                            </div>
                            <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                              <div className="font-medium text-blue-600 dark:text-blue-400">{stats.totalQuestions}</div>
                              <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}