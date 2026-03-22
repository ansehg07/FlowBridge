import { useState, memo } from 'react';
import { ChevronDown, ChevronRight, Flag } from 'lucide-react';
import { formatValue, isNegative } from '../../utils/formatAccounting';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { cn } from '../../lib/utils';

function SectionGroup({ title, section, currency }) {
  const [expanded, setExpanded] = useState(true);
  const items = section?.items || [];

  return (
    <>
      <tr>
        <td colSpan={3} className="p-0">
          <button
            className="w-full flex items-center gap-2 px-4 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wide hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />}
            <span className="truncate">{title}</span>
          </button>
        </td>
      </tr>
      {expanded && items.map((item, idx) => (
        <ItemRow key={idx} item={item} currency={currency} />
      ))}
      {expanded && (
        <tr className="border-t border-border">
          <td className="px-4 py-2.5 pl-10 text-xs font-bold text-foreground">
            Net cash from {title.toLowerCase()}
          </td>
          <td className={cn(
            'px-4 py-2.5 text-xs font-bold text-right tabular-nums',
            isNegative(section?.subtotal) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
          )}>
            {formatValue(section?.subtotal, currency)}
          </td>
          <td className="px-4 py-2.5" />
        </tr>
      )}
    </>
  );
}

function ItemRow({ item, currency }) {
  const [showNote, setShowNote] = useState(false);

  return (
    <>
      <tr className={cn(
        'hover:bg-muted/30 transition-colors',
        item.flagged && 'bg-amber-50/40 dark:bg-amber-900/5'
      )}>
        <td className="px-4 py-1.5 pl-10 text-xs text-foreground/80 max-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate">{item.label}</span>
            {item.flagged && (
              <button
                onClick={() => setShowNote(!showNote)}
                className="shrink-0 text-amber-500 hover:text-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                aria-label={item.flagReason || 'Uncertain classification'}
                aria-expanded={showNote}
              >
                <Flag className="w-3 h-3" />
              </button>
            )}
          </div>
        </td>
        <td className={cn(
          'px-4 py-1.5 text-xs text-right tabular-nums',
          isNegative(item.convertedValue) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
        )}>
          {formatValue(item.convertedValue, currency)}
        </td>
        <td className="px-4 py-1.5 text-xs text-muted-foreground/60 max-w-[180px] truncate" title={item.notes}>
          {item.notes || ''}
        </td>
      </tr>
      {showNote && item.flagReason && (
        <tr>
          <td colSpan={3} className="px-4 py-1.5 pl-12">
            <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/15 rounded-lg px-3 py-1.5">
              {item.flagReason}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ReconciliationRow({ label, orig, conv, currency }) {
  const diff = orig != null && conv != null ? conv - orig : null;
  return (
    <tr>
      <td className="py-1.5 text-muted-foreground">{label}</td>
      <td className={cn(
        'py-1.5 px-3 text-right tabular-nums',
        isNegative(orig) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
      )}>
        {formatValue(orig, currency)}
      </td>
      <td className={cn(
        'py-1.5 px-3 text-right tabular-nums',
        isNegative(conv) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
      )}>
        {formatValue(conv, currency)}
      </td>
      <td className={cn(
        'py-1.5 px-3 text-right tabular-nums',
        diff != null && diff !== 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground/30'
      )}>
        {diff != null ? (diff === 0 ? '\u2014' : formatValue(diff, currency)) : '\u2014'}
      </td>
    </tr>
  );
}

const CashFlowTable = memo(function CashFlowTable({ conversion, currency }) {
  if (!conversion?.convertedSections) return null;

  const { convertedSections, originalSections, reconciliation, metadata } = conversion;

  const origOp = originalSections?.operating?.subtotal;
  const origInv = originalSections?.investing?.subtotal;
  const origFin = originalSections?.financing?.subtotal;
  const origNet = originalSections?.netChange;

  const convOp = convertedSections.operating?.subtotal;
  const convInv = convertedSections.investing?.subtotal;
  const convFin = convertedSections.financing?.subtotal;
  const convNet = reconciliation?.netChangeInCash;

  return (
    <div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wide">
              <div>
                Cash Flow Statement ({metadata?.targetStandard || 'Converted'})
              </div>
              {metadata?.companyName && metadata.companyName !== 'Unknown' && (
                <div className="text-xs font-normal text-muted-foreground/60 mt-0.5 normal-case tracking-normal">
                  {metadata.companyName} {metadata.period ? `\u2014 ${metadata.period}` : ''}
                </div>
              )}
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-foreground text-right w-32 uppercase tracking-wide">
              Amount
            </th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground/60 w-44 uppercase tracking-wide">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          <SectionGroup title="Operating Activities" section={convertedSections.operating} currency={currency} />
          <tr><td colSpan={3} className="py-1" /></tr>
          <SectionGroup title="Investing Activities" section={convertedSections.investing} currency={currency} />
          <tr><td colSpan={3} className="py-1" /></tr>
          <SectionGroup title="Financing Activities" section={convertedSections.financing} currency={currency} />
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/50">
            <td className="px-4 py-3.5 text-xs font-bold text-foreground uppercase tracking-wide">
              Net Change in Cash
            </td>
            <td className={cn(
              'px-4 py-3.5 text-xs font-bold text-right tabular-nums',
              isNegative(convNet) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
            )}>
              {formatValue(convNet, currency)}
            </td>
            <td className="px-4 py-3.5 text-xs text-muted-foreground/60">
              {reconciliation?.balances ? 'Reconciled' : 'May not reconcile'}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Reconciliation */}
      {originalSections && (
        <div className="mx-4 my-4 rounded-xl border border-border bg-muted/60 p-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Net Change in Cash Reconciliation
          </h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-semibold" />
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold w-28">
                  {metadata?.sourceStandard || 'Original'}
                </th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold w-28">
                  {metadata?.targetStandard || 'Converted'}
                </th>
                <th className="text-right py-2 px-3 text-muted-foreground font-semibold w-24">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody>
              <ReconciliationRow label="Cash from Operating" orig={origOp} conv={convOp} currency={currency} />
              <ReconciliationRow label="Cash from Investing" orig={origInv} conv={convInv} currency={currency} />
              <ReconciliationRow label="Cash from Financing" orig={origFin} conv={convFin} currency={currency} />
              <tr className="border-t border-border">
                <td className="py-2.5 font-bold text-foreground uppercase text-xs tracking-wide">
                  Net Change in Cash
                </td>
                <td className={cn(
                  'py-2.5 px-3 text-right font-bold tabular-nums',
                  isNegative(origNet) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                )}>
                  {formatValue(origNet, currency)}
                </td>
                <td className={cn(
                  'py-2.5 px-3 text-right font-bold tabular-nums',
                  isNegative(convNet) ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                )}>
                  {formatValue(convNet, currency)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                  {origNet != null && convNet != null
                    ? Math.abs(convNet - origNet) < 1
                      ? <Badge variant="outline" className="gap-1 text-xs border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Match
                        </Badge>
                      : <span className="text-red-600 dark:text-red-400">{formatValue(convNet - origNet, currency)}</span>
                    : '\u2014'}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground/60 leading-relaxed">
            Net change in cash should be identical under both {metadata?.sourceStandard} and {metadata?.targetStandard}. Only the classification across Operating, Investing, and Financing differs.
          </p>
        </div>
      )}
    </div>
  );
});

export default CashFlowTable;
