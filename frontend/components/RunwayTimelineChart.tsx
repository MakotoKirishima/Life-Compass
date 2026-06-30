import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

export interface SurvivalStrategy {
  triggered: boolean;
  bridgeRole: string;
  reason: string;
}

export interface TimelineMilestone {
  month: number;
  label: string;
}

export interface TimelineData {
  runwayMonths: number;
  timelineMonths: number;
  milestones: TimelineMilestone[];
  survivalStrategy?: SurvivalStrategy;
}

interface ChartPoint {
  month: number;
  runway: number | null;
  readiness: number | null;
}

function generateChartData(data: TimelineData): ChartPoint[] {
  const maxMonth = Math.max(data.timelineMonths, data.runwayMonths) + 2;
  const points: ChartPoint[] = [];
  for (let m = 0; m <= maxMonth; m++) {
    const runwayPercent = data.runwayMonths > 0
      ? Math.max(0, 100 - (m / data.runwayMonths) * 100)
      : 0;
    const readinessPercent = data.timelineMonths > 0
      ? Math.min(100, (m / data.timelineMonths) * 100)
      : 0;
    points.push({
      month: m,
      runway: data.runwayMonths > 0 ? runwayPercent : null,
      readiness: readinessPercent,
    });
  }
  return points;
}

function SurvivalStrategyAlert({ bridgeRole, reason }: { bridgeRole: string; reason: string }) {
  return (
    <Card padding="md" className="bg-red-50 border-2 border-red-400 mt-4">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">⚠️</span>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="coral">Finansial Kritis</Badge>
          </div>
          <p className="font-bold text-red-800 text-sm">Dana habis sebelum karir siap</p>
          <p className="text-sm text-red-700 mt-1 leading-relaxed">{reason}</p>
          <div className="bg-white rounded-xl p-3 mt-3 border border-red-200">
            <p className="text-xs font-bold text-red-800 mb-1">🛟 Survival Job Recommendation</p>
            <p className="text-sm font-semibold text-ink">{bridgeRole}</p>
            <p className="text-xs text-ink/60 mt-1">
              Bridge role ini memanfaatkan skill yang sudah kamu miliki dan bisa dimulai dalam 1-2 minggu.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: number }) {
  if (!active || !payload || !payload.length || label === undefined) return null;
  return (
    <div className="bg-card border-2 border-ink shadow-md rounded-xl px-4 py-3 text-sm">
      <p className="font-bold text-ink mb-1">Bulan ke-{label}</p>
      {payload.map((entry) => {
        if (entry.value == null) return null;
        return (
          <p key={entry.name} className="text-xs" style={{ color: entry.name === "runway" ? "#ef4444" : "#10b981" }}>
            {entry.name === "runway" ? "Dana Tersisa" : "Kesiapan Karir"}: {Math.round(entry.value)}%
          </p>
        );
      })}
    </div>
  );
}

export default function RunwayTimelineChart({ data }: { data: TimelineData }) {
  const chartData = useMemo(() => generateChartData(data), [data]);
  const isCritical = data.runwayMonths > 0 && data.runwayMonths < data.timelineMonths;
  const maxMonth = Math.max(data.timelineMonths, data.runwayMonths) + 2;

  return (
    <div>
      <Card padding="md" className="border-2 border-ink/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-ink">Runway vs Timeline</h3>
          {isCritical && <Badge variant="coral">⚠️ Gap Finansial</Badge>}
        </div>

        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-500 inline-block" />
            Dana Finansial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
            Kesiapan Karir
          </span>
          {data.runwayMonths > 0 && (
            <span className="text-ink/40">
              Runway: {data.runwayMonths} bulan · Timeline: {data.timelineMonths} bulan
            </span>
          )}
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                domain={[0, maxMonth]}
                label={{ value: "Bulan", position: "insideBottomRight", offset: -5, style: { fontSize: 11, fill: "#9ca3af" } }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              {data.runwayMonths > 0 && (
                <ReferenceLine x={data.runwayMonths} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
              )}
              <ReferenceLine x={data.timelineMonths} stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} />
              <Line
                type="monotone"
                dataKey="runway"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
                name="runway"
              />
              <Line
                type="monotone"
                dataKey="readiness"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                name="readiness"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {data.milestones.length > 0 && (
          <div className="mt-4 pt-3 border-t border-ink/10">
            <p className="text-xs font-semibold text-ink/60 mb-2">Milestones</p>
            <div className="space-y-1.5">
              {data.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-ink/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink/30 shrink-0" />
                  <span className="font-medium">Bulan {m.month}:</span>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {isCritical && data.survivalStrategy && (
        <SurvivalStrategyAlert
          bridgeRole={data.survivalStrategy.bridgeRole}
          reason={data.survivalStrategy.reason}
        />
      )}
    </div>
  );
}
