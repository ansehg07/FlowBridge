import { Columns, Clock, FileText, ArrowRight, Play } from 'lucide-react';
import { useConversion } from '../../context/ConversionContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import CashFlowTable from './CashFlowTable';
import DiffView from './DiffView';
import ConfidencePanel from './ConfidencePanel';
import ExportBar from './ExportBar';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorBanner from '../shared/ErrorBanner';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export default function OutputPanel({ onTrySample }) {
  const { result, loading, error, setError, currency } = useConversion();
  const conversion = result?.conversion;
  const confidence = result?.confidence;
  const processingTime = result?.processingTime;

  return (
    <Card className="flex flex-col py-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle>Output</CardTitle>
              {processingTime && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {(processingTime / 1000).toFixed(1)}s
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1">Converted statement with confidence scoring and reconciliation</CardDescription>
          </div>
          {conversion && (
            <ExportBar conversion={conversion} confidence={confidence} currency={currency} />
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <LoadingSpinner message="Converting cash flow statement via Gemini AI..." />
        )}

        {error && (
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        )}

        {!loading && !error && !result && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            {/* Document transformation icon */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="size-14 rounded-xl bg-muted flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <ArrowRight className="w-4 h-4 text-primary shrink-0" />
              <div className="size-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-base font-semibold text-foreground text-lg mb-2">
              No statement converted yet
            </p>
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed mb-6">
             Run the sample below to see an example output.
            </p>

            <Button
              variant="default"
              size="lg"
              onClick={onTrySample}
              className="gap-2 mb-6"
            >
              <Play className="w-3.5 h-3.5" />
              Run sample IFRS → US GAAP
            </Button>

            <Separator className="w-full max-w-[200px] mb-5" />

            {/*<div className="grid grid-cols-3 gap-4 w-full max-w-[520px]">*/}
            {/*  {[*/}
            {/*    { label: 'Reclassification', desc: 'Operating · Investing · Financing' },*/}
            {/*    { label: 'Reconciliation', desc: 'Net cash verified both standards' },*/}
            {/*    { label: 'Confidence score', desc: 'AI parsing & translation quality' },*/}
            {/*  ].map(({ label, desc }) => (*/}
            {/*    <div key={label} className="text-center">*/}
            {/*      <p className="text-sm font-semibold text-foreground/70 mb-1">{label}</p>*/}
            {/*      <p className="text-xs text-muted-foreground leading-snug">{desc}</p>*/}
            {/*    </div>*/}
            {/*  ))}*/}
            {/*</div>*/}
          </div>
        )}

        {!loading && !error && result && (
          <div className="space-y-6">
            <ConfidencePanel confidence={confidence} />

            <Tabs defaultValue="table">
              <TabsList>
                <TabsTrigger value="table">
                  Converted Statement
                </TabsTrigger>
                <TabsTrigger value="diff">
                  <Columns className="w-3.5 h-3.5" />
                  Side-by-Side Diff
                </TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="mt-4">
                <div className="rounded-xl border border-border overflow-hidden">
                  <CashFlowTable conversion={conversion} currency={currency} />
                </div>
              </TabsContent>

              <TabsContent value="diff" className="mt-4">
                <div className="rounded-xl border border-border overflow-hidden">
                  <DiffView conversion={conversion} currency={currency} />
                </div>
              </TabsContent>
            </Tabs>

            {conversion.keyDifferences?.length > 0 && (
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                  Key Reclassifications
                </h3>
                <div className="space-y-2.5">
                  {conversion.keyDifferences.map((diff, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="text-xs font-medium text-muted-foreground/40 tabular-nums shrink-0 w-4 text-right mt-0.5">
                        {i + 1}.
                      </span>
                      <div className="leading-relaxed">
                        <span className="font-semibold text-foreground">{diff.item}:</span>{' '}
                        <span className="text-muted-foreground">
                          {diff.sourceClassification} {'\u2192'} {diff.targetClassification}
                        </span>
                        {diff.explanation && (
                          <span className="text-muted-foreground/60"> — {diff.explanation}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conversion.assumptions?.length > 0 && (
              <Alert variant="default" className="border-border bg-muted/60 text-muted-foreground">
                <AlertTitle className="text-sm font-semibold uppercase tracking-wide text-foreground/70">
                  Assumptions Made
                </AlertTitle>
                <AlertDescription>
                  <ul className="space-y-1.5 mt-2 text-sm">
                    {conversion.assumptions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="shrink-0 text-muted-foreground/40 mt-0.5">–</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
