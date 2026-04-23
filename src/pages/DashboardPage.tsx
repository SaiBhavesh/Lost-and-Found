import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/ItemCard';
import { useAuth } from '@/contexts/AuthContext';
import { mockItems, mockMatches, CATEGORY_LABELS } from '@/data/mock-data';
import type { ItemCategory } from '@/data/mock-data';
import {
  Search, MapPin, TrendingUp, Clock, Plus, Sparkles,
  ArrowRight, Package, CheckCircle2,
} from 'lucide-react';

const kpis = [
  {
    label: 'Open Items',
    getValue: () => mockItems.filter(i => i.status === 'open').length,
    icon: Search,
    tint: 'from-sky-500/15 to-sky-500/0 text-sky-600 dark:text-sky-400',
    ring: 'ring-sky-500/20',
  },
  {
    label: 'Pending Matches',
    getValue: () => mockMatches.filter(m => m.status === 'pending').length,
    icon: TrendingUp,
    tint: 'from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
  },
  {
    label: 'Returned This Week',
    getValue: () => mockItems.filter(i => i.status === 'returned').length,
    icon: CheckCircle2,
    tint: 'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  {
    label: 'Avg Return Time',
    getValue: () => '2.3d',
    icon: Clock,
    tint: 'from-primary/15 to-primary/0 text-primary',
    ring: 'ring-primary/20',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const recentItems = [...mockItems].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  const categoryCounts = (Object.keys(CATEGORY_LABELS) as ItemCategory[]).map(cat => ({
    category: cat,
    count: mockItems.filter(i => i.category === cat).length,
  }));

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Hero welcome */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-info/10">
        <CardContent className="p-6 sm:p-8 relative">
          <div className="absolute top-0 right-0 h-full w-1/2 pointer-events-none opacity-50">
            <div className="absolute top-6 right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-info/20 blur-3xl" />
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome back
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                Hey {firstName}, let&apos;s find something today
              </h1>
              <p className="text-sm text-muted-foreground">
                {mockItems.filter(i => i.status === 'open').length} open items on campus right now.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" onClick={() => navigate('/app/post?type=found')}>
                <MapPin className="h-4 w-4 mr-1.5" />Report Found
              </Button>
              <Button onClick={() => navigate('/app/post?type=lost')}>
                <Plus className="h-4 w-4 mr-1.5" />Report Lost
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <Card key={kpi.label} className={`relative overflow-hidden ring-1 ${kpi.ring} hover:shadow-md transition-shadow`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.tint} pointer-events-none`} />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
                <kpi.icon className="h-4 w-4" />
              </div>
              <p className="text-3xl font-bold tracking-tight">{kpi.getValue()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column: recent + categories */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => navigate('/app/lost')}>
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {recentItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3">By Category</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {categoryCounts.map(({ category, count }) => {
                const pct = Math.min(100, (count / Math.max(1, mockItems.length)) * 100);
                return (
                  <button
                    key={category}
                    onClick={() => navigate('/app/lost')}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
                        <Package className="h-3 w-3" />
                        {CATEGORY_LABELS[category]}
                      </span>
                      <span className="font-medium tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/60 group-hover:bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="mt-4 border-primary/20 bg-gradient-to-br from-primary/5 to-info/5 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/app/map')}
          >
            <CardContent className="p-4 text-center">
              <MapPin className="h-5 w-5 mx-auto text-primary mb-2" />
              <p className="text-xs font-medium mb-1">Open Campus Map</p>
              <p className="text-[11px] text-muted-foreground">
                See exactly where items were lost or found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
