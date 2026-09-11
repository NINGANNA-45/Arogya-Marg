"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { opsApi } from "@/lib/api/client";
import { CheckCircle, Clock, AlertTriangle, Loader2, ChevronRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"OPEN" | "COMPLETED">("OPEN");

  const load = () => {
    setLoading(true);
    opsApi.getTasks({ status: tab })
      .then(r => setTasks(r.data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const completeTask = async (id: string) => {
    await opsApi.completeTask(id);
    load();
  };

  return (
    <AppShell title="Tasks & Follow-ups">
      <div className="p-6 max-w-[800px] mx-auto space-y-4">
        <div className="flex gap-2">
          {(["OPEN", "COMPLETED"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "bg-teal-600 text-white" : "bg-white border border-clinical-border text-clinical-muted hover:text-clinical-navy"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="card flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="card p-8 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
            <p className="text-clinical-muted text-sm">No {tab.toLowerCase()} tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task: any) => {
              const isOverdue = task.due_at && new Date(task.due_at) < new Date() && task.status === "OPEN";
              return (
                <div key={task.id} className={`card p-4 ${isOverdue ? "border-red-200 bg-red-50/20" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      task.priority === "URGENT" ? "bg-red-500" :
                      task.priority === "HIGH" ? "bg-amber-500" : "bg-teal-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-clinical-navy">{task.title}</p>
                      {task.description && <p className="text-xs text-clinical-muted mt-0.5">{task.description}</p>}
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-clinical-muted">Created {timeAgo(task.created_at)}</span>
                        {task.due_at && (
                          <span className={`text-xs font-medium ${isOverdue ? "text-red-600" : "text-clinical-muted"}`}>
                            {isOverdue ? "⚠ Overdue" : `Due: ${timeAgo(task.due_at)}`}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.status === "OPEN" && (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="btn-primary btn-sm flex-shrink-0"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Done
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
