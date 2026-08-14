import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Code2, Trophy, Target, ArrowRight, Activity, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeetCodeStats {
  matchedUser: {
    submitStats: {
      acSubmissionNum: {
        difficulty: string;
        count: number;
      }[];
    };
    profile: {
      ranking: number;
    };
  };
}

async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats | null> {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
        }
      }
    }
  `;

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Failed to fetch LeetCode stats:", error);
    return null;
  }
}

export default async function LeetCodeWidget({ username }: { username?: string | null }) {
  if (!username) {
    return (
      <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden group h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-2">
            <Code2 className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Sync LeetCode</h3>
            <p className="text-sm text-zinc-400 mt-1">Connect your account to automatically track DSA progress.</p>
          </div>
          <Link 
            href="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10 transition-colors"
          >
            Connect Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  const data = await fetchLeetCodeStats(username);
  
  if (!data || !data.matchedUser) {
    return (
      <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center text-zinc-400 text-sm">
          <Activity className="w-8 h-8 text-zinc-600 mb-3" />
          <p>Failed to load LeetCode data for <strong>@{username}</strong></p>
        </CardContent>
      </Card>
    );
  }

  const submissions = data.matchedUser.submitStats.acSubmissionNum;
  const all = submissions.find(s => s.difficulty === "All")?.count || 0;
  const easy = submissions.find(s => s.difficulty === "Easy")?.count || 0;
  const medium = submissions.find(s => s.difficulty === "Medium")?.count || 0;
  const hard = submissions.find(s => s.difficulty === "Hard")?.count || 0;
  const ranking = data.matchedUser.profile.ranking;

  return (
    <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden h-full">
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between mb-6 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex shrink-0 items-center justify-center shadow-inner">
              <Code2 className="w-5 h-5 text-orange-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">LeetCode</h3>
              <p className="text-sm text-white font-bold tracking-tight truncate">@{username}</p>
            </div>
          </div>
          
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1 text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <Trophy className="w-3 h-3" /> Rank
            </div>
            <div className="text-sm font-black text-white">{ranking.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#00b8a3]/10 rounded-lg py-2 px-1 text-center border border-[#00b8a3]/20 flex flex-col justify-center">
            <div className="text-base sm:text-lg font-black text-[#00b8a3]">{easy}</div>
            <div className="text-[9px] font-bold text-[#00b8a3]/70 uppercase tracking-wider mt-0.5">Easy</div>
          </div>
          <div className="bg-[#ffc01e]/10 rounded-lg py-2 px-1 text-center border border-[#ffc01e]/20 flex flex-col justify-center">
            <div className="text-base sm:text-lg font-black text-[#ffc01e]">{medium}</div>
            <div className="text-[9px] font-bold text-[#ffc01e]/70 uppercase tracking-wider mt-0.5">Med</div>
          </div>
          <div className="bg-[#ff375f]/10 rounded-lg py-2 px-1 text-center border border-[#ff375f]/20 flex flex-col justify-center">
            <div className="text-base sm:text-lg font-black text-[#ff375f]">{hard}</div>
            <div className="text-[9px] font-bold text-[#ff375f]/70 uppercase tracking-wider mt-0.5">Hard</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
