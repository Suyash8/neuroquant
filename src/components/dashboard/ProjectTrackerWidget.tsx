"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Terminal, Copy, CheckCircle2, ChevronRight, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function ProjectTrackerWidget({ 
  taskId, 
  initialDetails 
}: { 
  taskId?: string, 
  initialDetails?: any 
}) {
  const [tasks, setTasks] = useState<ProjectTask[]>(initialDetails?.checklist || []);
  const [showPromptGenerator, setShowPromptGenerator] = useState(!initialDetails?.checklist?.length);
  const [jsonInput, setJsonInput] = useState("");
  const [projectGoal, setProjectGoal] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCopyPrompt = () => {
    const prompt = `I am building a C++ low latency project: ${projectGoal || 'a matching engine'}. Please break this down into a highly technical, step-by-step implementation checklist for today's 4-hour coding session. Output strictly as JSON in the following format: { "tasks": [ { "id": "uuid", "title": "...", "description": "...", "completed": false } ] } without any markdown formatting or extra text.`;
    navigator.clipboard.writeText(prompt);
    alert("Prompt copied to clipboard! Paste it into your AI assistant, then copy the JSON response back here.");
  };

  const handleParseJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        const newTasks = parsed.tasks.map((t: any, i: number) => ({
          id: t.id || `task-${i}`,
          title: t.title,
          description: t.description,
          completed: false
        }));
        
        setTasks(newTasks);
        setShowPromptGenerator(false);
        saveChecklist(newTasks);
      } else {
        alert("Invalid JSON format. Make sure it contains a 'tasks' array.");
      }
    } catch (e) {
      alert("Invalid JSON. Please ensure you pasted raw JSON without markdown blocks.");
    }
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    saveChecklist(updated);
  };

  const saveChecklist = (updatedTasks: ProjectTask[]) => {
    if (!taskId) return;
    
    startTransition(async () => {
      await fetch('/api/sync-task-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          details: { checklist: updatedTasks }
        })
      });
    });
  };

  if (showPromptGenerator) {
    return (
      <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden group h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2">
            <Terminal className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Project Tracker</h3>
            <p className="text-sm text-zinc-400 mt-1">Start a coding session to track your project tasks.</p>
          </div>
          <Link 
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10 transition-colors"
          >
            Go to Projects
            <ArrowRight className="w-4 h-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex shrink-0 items-center justify-center">
              <Terminal className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h3 className="text-white font-bold tracking-tight text-sm">Project Tasks</h3>
            </div>
          </div>
          
          <div className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
            {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            {completedCount} / {tasks.length}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[160px] custom-scrollbar">
          {tasks.map(task => (
            <button 
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors flex items-start gap-3 group"
            >
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 className={`w-5 h-5 transition-colors ${task.completed ? "text-purple-500" : "text-zinc-700 group-hover:text-zinc-500"}`} />
              </div>
              <div>
                <p className={`text-sm font-bold transition-colors ${task.completed ? "text-zinc-500 line-through" : "text-white"}`}>
                  {task.title}
                </p>
                <p className={`text-xs mt-1 line-clamp-2 ${task.completed ? "text-zinc-600" : "text-zinc-400"}`}>
                  {task.description}
                </p>
              </div>
            </button>
          ))}
        </div>
        
        {completedCount === tasks.length && tasks.length > 0 && (
          <div className="p-3 bg-purple-500/10 border-t border-purple-500/20 text-center">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">All Tasks Completed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
