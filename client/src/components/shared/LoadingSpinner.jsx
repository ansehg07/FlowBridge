export default function LoadingSpinner({ message = 'Converting...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/80">
          {message}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          This may take 10–20 seconds
        </p>
      </div>
    </div>
  );
}
