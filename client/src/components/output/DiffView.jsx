import { Fragment, memo } from 'react';
import { formatValue, isNegative } from '../../utils/formatAccounting';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

const DiffView = memo(function DiffView({ conversion, currency }) {
  if (!conversion?.originalSections || !conversion?.convertedSections) return null;

  const original = conversion.originalSections;
  const converted = conversion.convertedSections;
  const meta = conversion.metadata || {};

  const sections = ['operating', 'investing', 'financing'];
  const sectionLabels = {
    operating: 'Operating Activities',
    investing: 'Investing Activities',
    financing: 'Financing Activities',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2.5 text-muted-foreground/60 w-8 font-medium">#</th>
            <th className="px-3 py-2.5 font-semibold text-foreground uppercase tracking-wide">
              Original ({meta.sourceStandard})
            </th>
            <th className="px-3 py-2.5 text-right font-semibold text-foreground w-24 uppercase tracking-wide">Amt</th>
            <th className="px-3 py-2.5 font-semibold text-primary uppercase tracking-wide">
              Converted ({meta.targetStandard})
            </th>
            <th className="px-3 py-2.5 text-right font-semibold text-primary w-24 uppercase tracking-wide">Amt</th>
            <th className="px-3 py-2.5 text-muted-foreground/60 w-20 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(sectionKey => {
            const origItems = original[sectionKey]?.items || [];
            const convItems = converted[sectionKey]?.items || [];
            const maxLen = Math.max(origItems.length, convItems.length);

            return (
              <Fragment key={sectionKey}>
                <tr className="bg-muted/50">
                  <td colSpan={6} className="px-3 py-2 font-semibold text-foreground uppercase tracking-wide text-xs">
                    {sectionLabels[sectionKey]}
                  </td>
                </tr>
                {Array.from({ length: maxLen }).map((_, idx) => {
                  const orig = origItems[idx];
                  const conv = convItems[idx];
                  const moved = conv?.originalSection && conv.originalSection !== sectionKey;
                  const changed = conv?.flagged || moved;

                  return (
                    <tr
                      key={idx}
                      className={cn(
                        'transition-colors',
                        changed && 'bg-amber-50/30 dark:bg-amber-900/5'
                      )}
                    >
                      <td className="px-3 py-1.5 text-xs text-muted-foreground/30 tabular-nums">{idx + 1}</td>
                      <td className="px-3 py-1.5 text-foreground/80 max-w-[180px]">
                        <span className="block truncate" title={orig?.label}>{orig?.label || ''}</span>
                      </td>
                      <td className={cn(
                        'px-3 py-1.5 text-right tabular-nums',
                        orig && isNegative(orig.value) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                      )}>
                        {orig ? formatValue(orig.value, currency) : ''}
                      </td>
                      <td className="px-3 py-1.5 text-foreground/80 max-w-[180px]">
                        <span className="block truncate" title={conv?.label}>{conv?.label || ''}</span>
                      </td>
                      <td className={cn(
                        'px-3 py-1.5 text-right tabular-nums',
                        conv && isNegative(conv.convertedValue) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                      )}>
                        {conv ? formatValue(conv.convertedValue, currency) : ''}
                      </td>
                      <td className="px-3 py-1.5">
                        {moved && (
                          <Badge variant="default" className="text-xs py-0">
                            moved
                          </Badge>
                        )}
                        {conv?.flagged && !moved && (
                          <Badge variant="outline" className="text-xs py-0 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                            *
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t border-border">
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 font-bold text-foreground">Subtotal</td>
                  <td className={cn(
                    'px-3 py-2 text-right font-bold tabular-nums',
                    isNegative(original[sectionKey]?.subtotal) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                  )}>
                    {formatValue(original[sectionKey]?.subtotal, currency)}
                  </td>
                  <td className="px-3 py-2 font-bold text-foreground">Subtotal</td>
                  <td className={cn(
                    'px-3 py-2 text-right font-bold tabular-nums',
                    isNegative(converted[sectionKey]?.subtotal) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                  )}>
                    {formatValue(converted[sectionKey]?.subtotal, currency)}
                  </td>
                  <td />
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default DiffView;
