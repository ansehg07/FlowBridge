import { useState } from 'react';
import { FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';
import { exportExcel } from '../../api/client';
import { formatValue } from '../../utils/formatAccounting';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export default function ExportBar({ conversion, confidence, currency }) {
  const [exportError, setExportError] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);

  if (!conversion) return null;

  const handleExcelExport = async () => {
    if (excelLoading) return;
    setExportError(null);
    setExcelLoading(true);
    try {
      const blob = await exportExcel(conversion, confidence);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowbridge-conversion.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError('Excel export failed. Please try again.');
    } finally {
      setExcelLoading(false);
    }
  };

  const handlePdfExport = async () => {
    setExportError(null);
    try {
      const jspdfModule = await import('jspdf');
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default;
      await import('jspdf-autotable');

      const doc = new jsPDF();
      const meta = conversion.metadata || {};

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FlowBridge — Cash Flow Conversion Report', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${meta.sourceStandard || ''} → ${meta.targetStandard || ''}`, 14, 28);
      doc.text(`Company: ${meta.companyName || 'N/A'}  |  Period: ${meta.period || 'N/A'}  |  Currency: ${currency}`, 14, 34);

      if (confidence) {
        doc.text(`Confidence: ${confidence.overall}% (${confidence.label})`, 14, 40);
      }

      let startY = 48;

      const sections = conversion.convertedSections;
      for (const [sectionName, section] of Object.entries(sections)) {
        const title = sectionName.charAt(0).toUpperCase() + sectionName.slice(1) + ' Activities';
        const items = section.items || [];

        const body = items.map(item => [
          item.flagged ? `${item.label} *` : item.label,
          formatValue(item.convertedValue, currency),
          item.notes || '',
        ]);

        body.push([
          { content: `Net cash from ${title.toLowerCase()}`, styles: { fontStyle: 'bold' } },
          { content: formatValue(section.subtotal, currency), styles: { fontStyle: 'bold', halign: 'right' } },
          '',
        ]);

        doc.autoTable({
          startY,
          head: [[title, 'Amount', 'Notes']],
          body,
          styles: { fontSize: 9, cellPadding: 2 },
          headStyles: { fillColor: [243, 156, 21], textColor: 0, fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 35, halign: 'right' },
            2: { cellWidth: 65 },
          },
          margin: { left: 14 },
        });

        startY = doc.lastAutoTable.finalY + 6;
      }

      const netChange = conversion.reconciliation?.netChangeInCash;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('NET CHANGE IN CASH', 14, startY + 4);
      doc.text(String(formatValue(netChange, currency)), 130, startY + 4);

      doc.save('flowbridge-conversion.pdf');
    } catch (err) {
      console.error('PDF export error:', err);
      setExportError('PDF export failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-1.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                onClick={handleExcelExport}
                disabled={excelLoading}
                className="gap-1.5"
              />
            }
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {excelLoading ? 'Exporting…' : 'Excel'}
          </TooltipTrigger>
          <TooltipContent>Download as Excel spreadsheet</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="outline" size="sm" onClick={handlePdfExport} className="gap-1.5" />
            }
          >
            <FileText className="w-3.5 h-3.5" />
            PDF
          </TooltipTrigger>
          <TooltipContent>Download as PDF report</TooltipContent>
        </Tooltip>
      </div>

      {exportError && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {exportError}
        </p>
      )}
    </div>
  );
}
