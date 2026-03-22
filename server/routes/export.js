const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');

router.post('/export/excel', (req, res) => {
  try {
    const { conversion, confidence } = req.body;

    if (!conversion || !conversion.convertedSections) {
      return res.status(400).json({ error: 'No conversion data provided' });
    }

    const wb = XLSX.utils.book_new();
    const meta = conversion.metadata || {};
    const currency = meta.currency || 'USD';

    // Sheet 1: Converted Cash Flow
    const rows = [];
    rows.push([`Cash Flow Statement (${meta.targetStandard || 'Converted'})`, '', '']);
    rows.push([`Company: ${meta.companyName || 'N/A'}`, `Period: ${meta.period || 'N/A'}`, `Currency: ${currency}`]);
    rows.push([]);
    rows.push(['Line Item', 'Amount', 'Notes']);

    for (const [sectionName, section] of Object.entries(conversion.convertedSections)) {
      const title = sectionName.charAt(0).toUpperCase() + sectionName.slice(1) + ' Activities';
      rows.push([title, '', '']);

      if (section.items) {
        for (const item of section.items) {
          const label = item.flagged ? `${item.label} *` : item.label;
          rows.push([`  ${label}`, item.convertedValue, item.notes || '']);
        }
      }

      rows.push([`Net Cash from ${title}`, section.subtotal || 0, '']);
      rows.push([]);
    }

    const netChange = conversion.reconciliation?.netChangeInCash;
    rows.push(['NET CHANGE IN CASH', netChange ?? '', '']);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Column widths
    ws['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 40 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Converted Cash Flow');

    // Sheet 2: Conversion Notes
    if (conversion.keyDifferences && conversion.keyDifferences.length > 0) {
      const noteRows = [['Key Differences', '', '', '']];
      noteRows.push(['Item', 'Source Classification', 'Target Classification', 'Explanation']);
      for (const diff of conversion.keyDifferences) {
        noteRows.push([diff.item, diff.sourceClassification, diff.targetClassification, diff.explanation]);
      }
      if (conversion.assumptions?.length > 0) {
        noteRows.push([]);
        noteRows.push(['Assumptions']);
        for (const a of conversion.assumptions) {
          noteRows.push([a]);
        }
      }
      const ws2 = XLSX.utils.aoa_to_sheet(noteRows);
      ws2['!cols'] = [{ wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Conversion Notes');
    }

    // Sheet 3: Confidence
    if (confidence) {
      const confRows = [['Confidence Report']];
      confRows.push([]);
      confRows.push(['Overall Score', confidence.overall]);
      confRows.push(['Label', confidence.label]);
      confRows.push([]);
      confRows.push(['Component', 'Score']);
      confRows.push(['Parsing', confidence.breakdown?.parsing?.score]);
      confRows.push(['Translation', confidence.breakdown?.translation?.score]);
      confRows.push(['Validation', confidence.breakdown?.validation?.score]);
      if (confidence.penalties?.length > 0) {
        confRows.push([]);
        confRows.push(['Penalties']);
        for (const p of confidence.penalties) confRows.push([p]);
      }
      const ws3 = XLSX.utils.aoa_to_sheet(confRows);
      ws3['!cols'] = [{ wch: 40 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Confidence Report');
    }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=flowbridge-conversion.xlsx');
    res.send(Buffer.from(buf));
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

module.exports = router;
