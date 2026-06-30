import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RunwayTimelineChart from "../RunwayTimelineChart";
import type { TimelineData } from "../RunwayTimelineChart";

describe("RunwayTimelineChart", () => {
  it("renders SurvivalStrategyAlert when runway < timeline (critical gap)", () => {
    const data: TimelineData = {
      runwayMonths: 4,
      timelineMonths: 9,
      milestones: [],
      survivalStrategy: {
        triggered: true,
        bridgeRole: "Admin Data Entry",
        reason: "Dana Anda hanya cukup untuk 4 bulan, tapi butuh 9 bulan untuk siap kerja.",
      },
    };

    render(React.createElement(RunwayTimelineChart, { data }));

    expect(screen.getByText("Finansial Kritis")).toBeInTheDocument();
    expect(screen.getByText("Dana habis sebelum karir siap")).toBeInTheDocument();
    expect(screen.getByText("Admin Data Entry")).toBeInTheDocument();
    expect(screen.getByText(/Survival Job Recommendation/)).toBeInTheDocument();
  });

  it("does NOT render SurvivalStrategyAlert when runway >= timeline (no gap)", () => {
    const data: TimelineData = {
      runwayMonths: 12,
      timelineMonths: 6,
      milestones: [],
    };

    render(React.createElement(RunwayTimelineChart, { data }));

    expect(screen.queryByText("Finansial Kritis")).not.toBeInTheDocument();
    expect(screen.queryByText("Survival Job Recommendation")).not.toBeInTheDocument();
  });

  it("renders milestones when provided", () => {
    const data: TimelineData = {
      runwayMonths: 6,
      timelineMonths: 4,
      milestones: [
        { month: 2, label: "Selesai Bootcamp" },
        { month: 4, label: "Siap Apply" },
      ],
    };

    render(React.createElement(RunwayTimelineChart, { data }));

    expect(screen.getByText("Selesai Bootcamp")).toBeInTheDocument();
    expect(screen.getByText("Siap Apply")).toBeInTheDocument();
  });

  it("renders the chart container", () => {
    const data: TimelineData = {
      runwayMonths: 6,
      timelineMonths: 8,
      milestones: [],
    };

    render(React.createElement(RunwayTimelineChart, { data }));

    expect(screen.getByText("Runway vs Timeline")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });
});
