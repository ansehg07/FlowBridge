import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="relative">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Conversion Failed</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="absolute right-2 top-2 h-7 w-7 text-red-400 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}
