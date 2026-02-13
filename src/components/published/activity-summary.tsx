"use client";

import { useState, useEffect } from "react";
import { GraduationCap, ClipboardCheck, MessageCircle, Lightbulb, Code2, Award, Zap } from "lucide-react";

interface ActivityData {
  training: {
    modulesStarted: number;
    modulesCompleted: number;
    recentModules: { title: string; status: string; completedAt: string | null }[];
  };
  quizzes: { total: number; correct: number; accuracy: number };
  chat: { messagesCount: number };
  useCases: { count: number };
  forum: { posts: number; replies: number };
  techTips: { count: number };
  badges: { name: string; icon: string | null; description: string | null; earnedAt: string }[];
  pp: number;
  level: number;
  memberSince: string;
}

interface ActivitySummaryProps {
  siteId: string;
  personId: string;
}

export function ActivitySummary({ siteId, personId }: ActivitySummaryProps) {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sites/${siteId}/activity?personId=${personId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [siteId, personId]);

  if (loading) return <div className="text-center py-4 text-gray-400 text-sm">Chargement de l&apos;activité...</div>;
  if (!data) return null;

  const stats = [
    { icon: GraduationCap, label: "Formations", value: `${data.training.modulesCompleted} terminée${data.training.modulesCompleted !== 1 ? "s" : ""}`, sub: data.training.modulesStarted > 0 ? `${data.training.modulesStarted} en cours` : undefined, color: "text-blue-500" },
    { icon: ClipboardCheck, label: "Quiz", value: `${data.quizzes.total} passé${data.quizzes.total !== 1 ? "s" : ""}`, sub: data.quizzes.total > 0 ? `${data.quizzes.accuracy}% correct` : undefined, color: "text-green-500" },
    { icon: MessageCircle, label: "Chat IA", value: `${data.chat.messagesCount} message${data.chat.messagesCount !== 1 ? "s" : ""}`, color: "text-purple-500" },
    { icon: Lightbulb, label: "Use Cases", value: `${data.useCases.count} partagé${data.useCases.count !== 1 ? "s" : ""}`, color: "text-yellow-500" },
    { icon: MessageCircle, label: "Forum", value: `${data.forum.posts} post${data.forum.posts !== 1 ? "s" : ""}`, sub: data.forum.replies > 0 ? `${data.forum.replies} réponse${data.forum.replies !== 1 ? "s" : ""}` : undefined, color: "text-indigo-500" },
    { icon: Code2, label: "Tech Tips", value: `${data.techTips.count} partagé${data.techTips.count !== 1 ? "s" : ""}`, color: "text-emerald-500" },
  ];

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        <h3 className="font-semibold text-sm">Activité</h3>
        <span className="text-xs text-gray-400">
          Membre depuis le {new Date(data.memberSince).toLocaleDateString("fr-FR")}
        </span>
      </div>

      {/* Grille de stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="border rounded-lg p-2.5 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-1.5">
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="text-sm font-semibold mt-1">{stat.value}</p>
            {stat.sub && <p className="text-[10px] text-gray-400">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Badges */}
      {data.badges.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Award className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-semibold text-gray-600">Badges ({data.badges.length})</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5 border rounded-full px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20">
                <span className="text-sm">{badge.icon || "🏆"}</span>
                <span className="text-xs font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formations récentes */}
      {data.training.recentModules.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-1.5">Formations récentes</h4>
          <div className="space-y-1">
            {data.training.recentModules.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full ${m.status === "COMPLETED" ? "bg-green-500" : "bg-amber-400"}`} />
                <span className="text-gray-700 dark:text-gray-300 truncate">{m.title}</span>
                {m.completedAt && (
                  <span className="text-gray-400 flex-shrink-0">{new Date(m.completedAt).toLocaleDateString("fr-FR")}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
