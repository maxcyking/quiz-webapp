import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ResultsNotReleasedProps {
  examTitle: string;
  navigate: (path: string) => void;
}

export default function ResultsNotReleased({ examTitle, navigate }: ResultsNotReleasedProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{examTitle} - Results Not Released</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded shadow-md inline-block">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-500 mr-3 mt-0.5" />
            <div>
              <p className="text-yellow-700">
                Results for this exam have not been released yet. Please check back later.
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate("/results")}>Back to Results</Button>
      </div>
    </div>
  );
}