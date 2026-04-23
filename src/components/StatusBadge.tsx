import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/lib/constants';
import type { ItemStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

const statusStyles: Record<ItemStatus, string> = {
  open: 'bg-info/15 text-info border-info/30',
  potential_match: 'bg-warning/15 text-warning border-warning/30',
  claimed: 'bg-primary/15 text-primary border-primary/30',
  returned: 'bg-success/15 text-success border-success/30',
  closed: 'bg-muted text-muted-foreground border-border',
};

const solidStatusStyles: Record<ItemStatus, string> = {
  open: 'bg-info text-info-foreground border-info',
  potential_match: 'bg-warning text-warning-foreground border-warning',
  claimed: 'bg-primary text-primary-foreground border-primary',
  returned: 'bg-success text-success-foreground border-success',
  closed: 'bg-foreground/80 text-background border-foreground/80',
};

const overlayDotStyles: Record<ItemStatus, string> = {
  open: 'bg-info ring-info/30',
  potential_match: 'bg-warning ring-warning/30',
  claimed: 'bg-primary ring-primary/30',
  returned: 'bg-success ring-success/30',
  closed: 'bg-foreground/70 ring-foreground/20',
};

export function StatusBadge({
  status,
  solid = false,
  overlay = false,
}: {
  status: ItemStatus;
  solid?: boolean;
  overlay?: boolean;
}) {
  if (overlay) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 h-[22px] pl-1.5 pr-2 rounded-full',
          'bg-background/75 text-foreground backdrop-blur-md ring-1 ring-border/50 shadow-sm',
          'text-[10px] font-semibold',
        )}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full ring-2',
            overlayDotStyles[status],
          )}
        />
        {STATUS_LABELS[status]}
      </span>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[11px] font-semibold',
        solid ? `${solidStatusStyles[status]} shadow-sm` : statusStyles[status],
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
