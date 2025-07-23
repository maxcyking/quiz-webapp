interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading result..." }: LoadingStateProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <p className="text-center text-muted-foreground">{message}</p>
    </div>
  );
}