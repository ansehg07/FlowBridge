export const API_BASE = '/api';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '\u20AC', name: 'Euro' },
  { code: 'GBP', symbol: '\u00A3', name: 'British Pound' },
  { code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '\u00A5', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '\u20B9', name: 'Indian Rupee' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const DIRECTIONS = [
  { value: 'ifrs-to-gaap', label: 'IFRS \u2192 US GAAP', source: 'IFRS', target: 'US GAAP' },
  { value: 'gaap-to-ifrs', label: 'US GAAP \u2192 IFRS', source: 'US GAAP', target: 'IFRS' },
];

export const SAMPLE_IFRS = `CONSOLIDATED STATEMENT OF CASH FLOWS
For the year ended December 31, 2024
(In thousands USD)

CASH FLOWS FROM OPERATING ACTIVITIES
Net income                                        125,000
Adjustments:
  Depreciation and amortization                    32,000
  Share-based compensation                          8,500
  Deferred income taxes                            (3,200)
Changes in working capital:
  Accounts receivable                             (15,600)
  Inventories                                      (8,300)
  Accounts payable                                 12,400
  Accrued liabilities                               6,800
Interest paid (classified as operating)           (18,500)
Interest received (classified as operating)         4,200
Dividends received (classified as operating)        2,800
Income taxes paid                                 (28,400)
Net cash from operating activities                118,700

CASH FLOWS FROM INVESTING ACTIVITIES
Purchase of property, plant and equipment         (45,000)
Proceeds from sale of equipment                     3,200
Purchase of intangible assets                     (12,000)
Acquisition of subsidiary, net of cash            (28,500)
Net cash used in investing activities             (82,300)

CASH FLOWS FROM FINANCING ACTIVITIES
Proceeds from long-term borrowings                 50,000
Repayment of borrowings                           (25,000)
Dividends paid (classified as financing)          (15,000)
Repayment of lease liabilities (principal)        (12,800)
Proceeds from issuance of shares                    8,000
Net cash from financing activities                  5,200

Net increase in cash and cash equivalents          41,600
Cash and cash equivalents at beginning             85,000
Bank overdrafts included in cash equivalents       (3,500)
Cash and cash equivalents at end                  123,100`;
