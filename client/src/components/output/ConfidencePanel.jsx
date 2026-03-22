import { ChevronDown, ChevronRight } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import { useState, memo } from 'react';

const progressColors = {
  green: '[&_[data-slot=progress-indicator]]:bg-green-500',
  amber: '[&_[data-slot=progress-indicator]]:bg-amber-500',
  red: '[&_[data-slot=progress-indicator]]:bg-red-500',
};

const ScoreCircle = memo(function ScoreCircle({ score, label }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let strokeClass, badgeClassName;
  if (score >= 80) { strokeClass = 'stroke-green-500'; badgeClassName = 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400'; }
  else if (score >= 55) { strokeClass = 'stroke-amber-500'; badgeClassName = 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'; }
  else { strokeClass = 'stroke-red-500'; badgeClassName = 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'; }

  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50">
      <div className="relative w-[72px] h-[72px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeWidth="5" className="text-border" />
          <circle cx="36" cy="36" r={radius} fill="none" strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={cn(strokeClass)} style={{ transition: 'stroke-dashoffset 1000ms ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-foreground tabular-nums">{score}</span>
        </div>
      </div>
      <Badge variant="outline" className={cn("text-xs uppercase tracking-wide", badgeClassName)}>
        {label}
      </Badge>
    </div>
  );
});

const ScoreBar = memo(function ScoreBar({ label, score }) {
  let colorClass;
  if (score >= 80) colorClass = progressColors.green;
  else if (score >= 55) colorClass = progressColors.amber;
  else colorClass = progressColors.red;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground w-20">{label}</span>
      <Progress value={score} className={cn("h-1.5", colorClass)} />
      <span className="text-xs font-bold text-foreground/80 w-7 text-right tabular-nums">{score}</span>
    </div>
  );
});

const ConfidencePanel = memo(function ConfidencePanel({ confidence }) {
  const [expanded, setExpanded] = useState(false);

  if (!confidence) return null;

  const { overall, label, breakdown, penalties } = confidence;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <ScoreCircle score={overall} label={label} />

          <div className="flex-1 min-w-0 py-1">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
              Confidence Score
            </h3>
            {breakdown && (
              <div className="space-y-2.5">
                <ScoreBar label="Parsing" score={breakdown.parsing?.score || 0} />
                <ScoreBar label="Translation" score={breakdown.translation?.score || 0} />
                <ScoreBar label="Validation" score={breakdown.validation?.score || 0} />
              </div>
            )}
          </div>
        </div>

        {penalties && penalties.length > 0 && (
          <>
            <Separator className="my-3" />
            <div className="space-y-1">
              {penalties.map((p, i) => (
                <div key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                  <span className="text-amber-400 dark:text-amber-600">-</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Separator />

      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors cursor-pointer">
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'Why this score?'}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 text-xs text-muted-foreground">
            {breakdown && Object.entries(breakdown).map(([key, val]) => (
              <div key={key}>
                <div className="font-semibold text-foreground capitalize mb-1.5">{key}</div>
                <ul className="space-y-1 pl-3">
                  {val.findings?.map((f, i) => (
                    <li key={i} className="leading-relaxed list-disc list-outside text-muted-foreground/70 ml-1">{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});

export default ConfidencePanel;
