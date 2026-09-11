"use client";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";
import type { CarePathState, CarePathEvent } from "@/types";
import { CAREPATH_ORDER, CAREPATH_LABELS } from "@/types";
import { cn, formatDateTime } from "@/lib/utils";

interface CarePathTimelineProps {
  currentState: CarePathState;
  events?: CarePathEvent[];
  compact?: boolean;
}

const EXCEPTION_STATES: CarePathState[] = ["STUCK", "NO_SHOW", "ESCALATED", "FACILITY_UNAVAILABLE"];

export function CarePathTimeline({ currentState, events = [], compact = false }: CarePathTimelineProps) {
  const isException = EXCEPTION_STATES.includes(currentState);
  const currentIndex = CAREPATH_ORDER.indexOf(currentState);

  const getStepStatus = (state: CarePathState, index: number) => {
    if (isException && state === currentState) return "exception";
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "active";
    return "future";
  };

  const eventForState = (state: CarePathState) =>
    events.find((e) => e.to_state === state);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {CAREPATH_ORDER.map((state, i) => {
          const status = getStepStatus(state, i);
          return (
            <div key={state} className="flex items-center gap-1">
              <div
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  status === "completed" ? "bg-emerald-500" :
                  status === "active" ? "bg-teal-600 ring-2 ring-teal-200" :
                  status === "exception" ? "bg-red-500 ring-2 ring-red-200" :
                  "bg-gray-200"
                )}
              />
              {i < CAREPATH_ORDER.length - 1 && (
                <div className={`w-3 h-px ${status === "completed" ? "bg-emerald-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
        <span className={cn(
          "ml-2 text-xs font-semibold px-2 py-0.5 rounded-full",
          isException ? "bg-red-50 text-red-700" :
          currentState === "CLOSED" ? "bg-emerald-50 text-emerald-700" :
          "bg-teal-50 text-teal-700"
        )}>
          {CAREPATH_LABELS[currentState]}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isException && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700">
            Exception: {CAREPATH_LABELS[currentState]} — Requires immediate attention
          </p>
        </div>
      )}

      <div className="space-y-0">
        {CAREPATH_ORDER.map((state, i) => {
          const status = getStepStatus(state, i);
          const event = eventForState(state);

          return (
            <div key={state} className="flex gap-3">
              {/* Connector line */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                    status === "completed" ? "bg-emerald-500" :
                    status === "active" ? "bg-teal-600 ring-3 ring-teal-100" :
                    status === "exception" ? "bg-red-500" :
                    "bg-white border-2 border-gray-200"
                  )}
                >
                  {status === "completed" ? (
                    <CheckCircle className="w-3 h-3 text-white" />
                  ) : status === "active" ? (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  ) : status === "exception" ? (
                    <AlertCircle className="w-3 h-3 text-white" />
                  ) : (
                    <Circle className="w-3 h-3 text-gray-300" />
                  )}
                </motion.div>
                {i < CAREPATH_ORDER.length - 1 && (
                  <div
                    className={cn(
                      "w-px flex-1 my-0.5",
                      status === "completed" ? "bg-emerald-300" : "bg-gray-200"
                    )}
                    style={{ minHeight: "24px" }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-4 min-w-0", i === CAREPATH_ORDER.length - 1 ? "pb-0" : "")}>
                <div className="flex items-center gap-2 -mt-0.5">
                  <span className={cn(
                    "text-sm font-semibold",
                    status === "completed" ? "text-emerald-700" :
                    status === "active" ? "text-teal-700" :
                    status === "exception" ? "text-red-700" :
                    "text-gray-400"
                  )}>
                    {CAREPATH_LABELS[state]}
                  </span>
                  {status === "active" && !isException && (
                    <span className="text-[10px] font-semibold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">
                      CURRENT
                    </span>
                  )}
                </div>
                {event && (
                  <p className="text-xs text-clinical-muted mt-0.5 truncate">
                    {event.description}
                    <span className="ml-1.5 text-clinical-muted-light">
                      · {formatDateTime(event.created_at)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
