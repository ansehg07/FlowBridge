import { History, Trash2, Clock, ArrowRight } from 'lucide-react';
import { formatConfidence } from '../../utils/formatAccounting';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

export default function Sidebar({ history, onSelect, onRemove, onClear, open, onClose }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <History className="w-3.5 h-3.5 text-primary" />
              </div>
              <SheetTitle>Conversion History</SheetTitle>
            </div>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="h-7 w-7 text-muted-foreground/60 hover:text-destructive"
                aria-label="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <SheetDescription>
            {`${history.length} conversion${history.length !== 1 ? 's' : ''}`}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="h-[calc(100vh-120px)]">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No conversions yet
              </p>
              <p className="text-xs text-muted-foreground/60">
                Previous conversions will appear here
              </p>
            </div>
          )}

          <div className="space-y-2 p-3">
            {history.map(entry => {
              const conf = entry.confidence;
              const confStyle = conf ? formatConfidence(conf.overall) : null;

              return (
                <button
                  key={entry.id}
                  onClick={() => onSelect(entry)}
                  className="group w-full text-left p-3.5 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" className="gap-1">
                      {entry.direction === 'ifrs-to-gaap' ? 'IFRS' : 'GAAP'}
                      <ArrowRight className="w-3 h-3" />
                      {entry.direction === 'ifrs-to-gaap' ? 'GAAP' : 'IFRS'}
                    </Badge>
                    {conf && (
                      <span className={`text-xs font-bold ${confStyle.color}`}>
                        {conf.overall}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {entry.inputPreview || 'No preview'}
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-2">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
