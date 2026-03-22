import { Moon, Sun, ArrowRightLeft, History } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useConversion } from '../../context/ConversionContext';
import { CURRENCIES } from '../../utils/constants';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Separator } from '../ui/separator';

export default function Header({ historyCount = 0, onOpenHistory }) {
  const { dark, toggle } = useTheme();
  const { currency, setCurrency } = useConversion();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                FlowBridge
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium tracking-wide hidden sm:block">
                IFRS / US GAAP Cash Flow Converter
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Currency selector */}
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[100px] h-9" aria-label="Currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* History button */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenHistory}
                    className="gap-1.5"
                  />
                }
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
                {historyCount > 0 && (
                  <Badge className="ml-0.5 h-[18px] min-w-[18px] px-1 text-[10px] bg-primary text-primary-foreground border-0">
                    {historyCount}
                  </Badge>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>View conversion history</p>
              </TooltipContent>
            </Tooltip>

            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggle}
                    className="h-8 w-8"
                    aria-label="Toggle theme"
                  />
                }
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </TooltipTrigger>
              <TooltipContent>
                <p>{dark ? 'Switch to light mode' : 'Switch to dark mode'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
}
