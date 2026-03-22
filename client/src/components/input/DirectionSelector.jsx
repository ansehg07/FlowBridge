import { ArrowRight } from 'lucide-react';
import { useConversion } from '../../context/ConversionContext';
import { DIRECTIONS } from '../../utils/constants';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export default function DirectionSelector() {
  const { direction, setDirection } = useConversion();

  return (
    <div className="flex rounded-xl mt-2 gap-1">
      {DIRECTIONS.map(d => (
        <Button
          key={d.value}
          onClick={() => setDirection(d.value)}
          variant={direction === d.value ? "default" : "outline"}
          className="w-1/2"
        >
          <span>{d.source}</span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span>{d.target}</span>
        </Button>
      ))}
    </div>
  );
}
