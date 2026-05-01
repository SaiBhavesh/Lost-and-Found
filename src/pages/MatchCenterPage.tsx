import { useItems } from '@/hooks/use-items';
import { useMatches } from '@/hooks/use-matches';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GitCompare, Loader2, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { groq, GROQ_MODEL } from '@/lib/groq';
import type { Item, Match } from '@/lib/constants';

async function analyzeMatch(lost: Item, found: Item, match: Match): Promise<string> {
  const res = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an AI assistant for a campus lost & found system. Analyze whether two items are likely the same item and give a verdict. Be concise — 3-4 sentences max.',
      },
      {
        role: 'user',
        content: `Analyze this potential match:\n\nLOST: "${lost.title}" — ${lost.description} — found at ${lost.location} on ${lost.date.split('T')[0]}\n\nFOUND: "${found.title}" — ${found.description} — found at ${found.location} on ${found.date.split('T')[0]}\n\nCurrent match score: ${match.score}%. Is this likely the same item? What should the parties verify to confirm?`,
      },
    ],
    max_tokens: 180,
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content?.trim() ?? 'Unable to analyze.';
}

function MatchCard({ match, lost, found }: { match: Match; lost: Item; found: Item }) {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleAnalyze = async () => {
    if (analysis) { setExpanded(e => !e); return; }
    setAnalysisLoading(true);
    setExpanded(true);
    try {
      const result = await analyzeMatch(lost, found, match);
      setAnalysis(result);
    } catch { setAnalysis('Analysis failed. Check your Groq API key.'); }
    finally { setAnalysisLoading(false); }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs">{match.score}% match</Badge>
          <Badge variant={match.status === 'pending' ? 'outline' : 'default'} className="text-xs capitalize">{match.status}</Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
            <div className="flex items-center gap-1.5 mb-1">
              <Badge variant="destructive" className="text-[10px] uppercase px-1.5 py-0">Lost</Badge>
              <StatusBadge status={lost.status} />
            </div>
            <p className="text-sm font-medium">{lost.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{lost.location} · {lost.date.split('T')[0]}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1">
              <Badge className="text-[10px] uppercase px-1.5 py-0">Found</Badge>
              <StatusBadge status={found.status} />
            </div>
            <p className="text-sm font-medium">{found.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{found.location} · {found.date.split('T')[0]}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 mb-3">{match.reason}</p>

        {/* AI Match Analysis */}
        <div className="mb-3 rounded-lg border border-violet-500/20 bg-violet-500/5 overflow-hidden">
          <button
            onClick={handleAnalyze}
            className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-violet-500/10 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-violet-500" />
              <span className="font-medium text-violet-600 dark:text-violet-400">AI Match Analysis</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-500">Groq</span>
            </div>
            {analysisLoading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
              : expanded
                ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
          {expanded && (
            <div className="px-3 pb-3">
              {analysisLoading
                ? <p className="text-xs text-muted-foreground">Analyzing match with Groq AI…</p>
                : <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{analysis}</p>}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate(`/app/item/${lost.id}`)}>Review Lost Item</Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/app/item/${found.id}`)}>Review Found Item</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MatchCenterPage() {
  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const { data: items = [], isLoading: itemsLoading } = useItems();

  const loading = matchesLoading || itemsLoading;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Match Center</h1>
        <EmptyState
          title="No matches yet"
          description="When lost and found items are similar, they'll appear here as potential matches."
          icon={<GitCompare className="h-6 w-6 text-muted-foreground" />}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-1">Match Center</h1>
      <p className="text-sm text-muted-foreground mb-4">
        {matches.length} potential {matches.length === 1 ? 'match' : 'matches'}
      </p>

      <div className="space-y-3">
        {matches.map(match => {
          const lost = items.find(i => i.id === match.lostItemId);
          const found = items.find(i => i.id === match.foundItemId);
          if (!lost || !found) return null;
          return <MatchCard key={match.id} match={match} lost={lost} found={found} />;
        })}
      </div>
    </div>
  );
}
