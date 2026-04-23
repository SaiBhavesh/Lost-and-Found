import { MapPin, Clock, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { CATEGORY_LABELS } from '@/lib/constants';
import type { Item } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function ItemCard({ item }: { item: Item }) {
  const navigate = useNavigate();
  const thumbnail = item.photos[0];

  const typeBadgeStyles = item.type === 'lost'
    ? 'bg-destructive/85 text-destructive-foreground ring-destructive/20'
    : 'bg-success/85 text-success-foreground ring-success/20';

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden border-border/60"
      onClick={() => navigate(`/app/item/${item.id}`)}
    >
      {thumbnail && (
        <div className="h-40 w-full overflow-hidden bg-muted relative">
          <img
            src={thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center h-[22px] px-2 rounded-full text-[10px] font-semibold uppercase tracking-wider',
                'backdrop-blur-md ring-1 shadow-sm',
                typeBadgeStyles,
              )}
            >
              {item.type}
            </span>
            <StatusBadge status={item.status} overlay />
          </div>
        </div>
      )}
      <CardContent className="p-4">
        {!thumbnail && (
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'inline-flex items-center h-[22px] px-2 rounded-full text-[10px] font-semibold uppercase tracking-wider ring-1',
                item.type === 'lost'
                  ? 'bg-destructive/10 text-destructive ring-destructive/25'
                  : 'bg-success/10 text-success ring-success/25',
              )}
            >
              {item.type}
            </span>
            <StatusBadge status={item.status} />
          </div>
        )}

        <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />{CATEGORY_LABELS[item.category]}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />{item.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />{format(parseISO(item.date), 'MMM d, h:mm a')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
