import { Button } from "@/components/ui/button";

interface ResultsNotFoundProps {
  message: string;
  navigate: (path: string) => void;
}

export default function ResultsNotFound({ message, navigate }: ResultsNotFoundProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Result Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {message}
        </p>
        <Button onClick={() => navigate("/exams")}>View Available Exams</Button>
      </div>
    </div>
  );
}