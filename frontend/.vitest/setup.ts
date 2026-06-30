import "@testing-library/jest-dom/vitest";
import React from "react";

// Mock Recharts — avoid JSX by using createElement
const mockDiv = (testId: string) =>
  ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": testId }, children);

const mockEmpty = () => React.createElement("div", { "data-testid": "mock" });

vi.mock("recharts", () => ({
  ResponsiveContainer: mockDiv("responsive-container"),
  LineChart: mockDiv("line-chart"),
  Line: mockEmpty,
  XAxis: mockEmpty,
  YAxis: mockEmpty,
  CartesianGrid: mockEmpty,
  Tooltip: mockEmpty,
  ReferenceLine: mockEmpty,
}));

// Mock Framer Motion — avoid JSX
function createMotionComponent(_tag: string) {
  return ({ children, ...props }: Record<string, unknown>) => {
    const { initial, animate, exit, transition, ...rest } = props;
    return React.createElement("div", rest, children as React.ReactNode);
  };
}

vi.mock("framer-motion", () => ({
  motion: {
    div: createMotionComponent("div"),
    p: createMotionComponent("p"),
    span: createMotionComponent("span"),
    section: createMotionComponent("section"),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));
