"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Input } from "@/components/ui";
import { Plus, MessageCircle, Send, Trash2, X, ChevronDown, ChevronUp, Pencil } from "lucide-react";

interface Person {
  id: string;
  name: string;
  jobTitle: string | null;
  avatar: string | null;
}

interface ForumReply {
  id: string;
  content: string;
  person: Person;
  createdAt: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string | null;
  person: Person;
  replies: ForumReply[];
  createdAt: string;
}

interface ForumTabProps {
  siteId: string;
  currentPersonId: string;
}

const CATEGORIES = ["Question", "Discussion", "Partage", "Aide"];

export function ForumTab({ siteId, currentPersonId }: ForumTabProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "" });
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async () => {
    const res = await fetch(`/api/sites/${siteId}/forum`);
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }, [siteId]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch(`/api/sites/${siteId}/forum`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm({ title: "", content: "", category: "" });
      fetchPosts();
    }
  };

  const startEdit = (post: ForumPost) => {
    setForm({ title: post.title, content: post.content, category: post.category || "" });
    setEditId(post.id);
    setShowForm(true);
  };

  const handleReply = async (postId: string) => {
    if (!replyContent.trim()) return;
    const res = await fetch(`/api/sites/${siteId}/forum/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent }),
    });
    if (res.ok) {
      setReplyTo(null);
      setReplyContent("");
      fetchPosts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette discussion ?")) return;
    await fetch(`/api/sites/${siteId}/forum?id=${id}`, { method: "DELETE" });
    fetchPosts();
  };

  const toggleExpand = (postId: string) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Forum</h2>
          <span className="text-xs text-gray-500">({posts.length} discussion{posts.length > 1 ? "s" : ""})</span>
        </div>
        <Button size="sm" onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", content: "", category: "" }); }} className="h-8 gap-1">
          <Plus className="h-3.5 w-3.5" /> Nouvelle discussion
        </Button>
      </div>

      {/* Formulaire nouveau post */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{editId ? "Modifier la discussion" : "Nouvelle discussion"}</h3>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditId(null); }}><X className="h-4 w-4" /></Button>
          </div>
          <Input placeholder="Titre de la discussion *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-8 text-sm" />
          <textarea
            placeholder="Votre message... *"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
          />
          <div className="flex items-center gap-2">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="">Catégorie</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button size="sm" onClick={handleSubmit} className="h-8">{editId ? "Enregistrer" : "Publier"}</Button>
          </div>
        </div>
      )}

      {/* Liste des posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>Aucune discussion</p>
          <p className="text-xs mt-1">Lancez la première conversation !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const isMine = post.person.id === currentPersonId;
            const isExpanded = expandedPosts.has(post.id);
            return (
              <div key={post.id} className="border rounded-lg bg-white dark:bg-gray-800">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{post.title}</h3>
                        {post.category && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded">
                            {post.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {post.person.name} · {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isMine && (
                        <>
                          {post.replies.length === 0 && (
                            <Button variant="ghost" size="sm" onClick={() => startEdit(post)} className="h-7 px-1.5"><Pencil className="h-3 w-3" /></Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="h-7 px-1.5 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Réponses */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(post.id)} className="h-7 gap-1 text-xs text-gray-500">
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {post.replies.length} réponse{post.replies.length !== 1 ? "s" : ""}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setReplyTo(post.id); setExpandedPosts((p) => new Set(p).add(post.id)); }} className="h-7 gap-1 text-xs">
                      <MessageCircle className="h-3 w-3" /> Répondre
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 pb-3">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="py-2 border-b last:border-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium">{reply.person.name}</span>
                          <span className="text-[10px] text-gray-400">{new Date(reply.createdAt).toLocaleDateString("fr-FR")}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{reply.content}</p>
                      </div>
                    ))}

                    {replyTo === post.id && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Votre réponse..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="h-8 text-sm flex-1"
                          onKeyDown={(e) => { if (e.key === "Enter") handleReply(post.id); }}
                        />
                        <Button size="sm" onClick={() => handleReply(post.id)} className="h-8 px-3">
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
