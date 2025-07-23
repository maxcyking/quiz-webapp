import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";

interface TopPerformersSectionProps {
  topPerformers: any[];
}

export default function TopPerformersSection({ topPerformers }: TopPerformersSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {topPerformers.map((performer, index) => {
        const icons = [
          <Trophy key="trophy" className="h-8 w-8 text-yellow-500" />,
          <Medal key="silver" className="h-8 w-8 text-gray-400" />,
          <Award key="bronze" className="h-8 w-8 text-amber-700" />
        ];
        const colors = [
          "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20",
          "border-gray-200 bg-gray-50 dark:bg-gray-900/20",
          "border-amber-200 bg-amber-50 dark:bg-amber-900/20"
        ];

        return (
          <Card key={performer.userId} className={`border-2 ${colors[index]}`}>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  {icons[index]}
                </div>
                <div className="text-xl font-bold">Rank #{index + 1}</div>
              </div>
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarImage src={performer.photoURL || "/placeholder.svg?height=80&width=80"} alt={performer.userName} />
                  <AvatarFallback className="text-2xl">{performer.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-xl font-bold mb-1">{performer.userName}</div>
                {performer.userId === performer.currentUserId && (
                  <div className="text-sm text-primary font-medium mb-2">You</div>
                )}
                <div className="text-3xl font-bold text-primary mb-2">{performer.score.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">
                  {performer.earnedMarks} out of {performer.totalMarks} marks
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}