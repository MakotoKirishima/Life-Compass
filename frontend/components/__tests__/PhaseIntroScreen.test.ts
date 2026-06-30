import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PhaseIntroScreen from "../PhaseIntroScreen";

describe("PhaseIntroScreen", () => {
  it("renders correct copy for phase 3 (Memetakan Kekuatan)", () => {
    render(React.createElement(PhaseIntroScreen, { phaseId: 3, onStart: () => {} }));

    expect(screen.getByText("Bab 3: Memetakan Kekuatan")).toBeInTheDocument();
    expect(
      screen.getByText(/Memisahkan apa yang Anda KLAIM dari apa yang telah Anda BUKTIKAN/)
    ).toBeInTheDocument();
  });

  it("renders correct copy for phase 1 (Menemukan Konteks)", () => {
    render(React.createElement(PhaseIntroScreen, { phaseId: 1, onStart: () => {} }));

    expect(screen.getByText("Bab 1: Menemukan Konteks")).toBeInTheDocument();
    expect(screen.getByText(/tahap hidup, pendidikan, definisi sukses/)).toBeInTheDocument();
  });

  it("renders time estimate and question count for phase 3", () => {
    render(React.createElement(PhaseIntroScreen, { phaseId: 3, onStart: () => {} }));

    expect(screen.getByText(/12-18 menit/)).toBeInTheDocument();
    expect(screen.getByText(/4 pertanyaan/)).toBeInTheDocument();
  });

  it("renders time estimate and question count for phase 7", () => {
    render(React.createElement(PhaseIntroScreen, { phaseId: 7, onStart: () => {} }));

    expect(screen.getByText("Bab 7: Lingkungan Kerja")).toBeInTheDocument();
    expect(screen.getByText(/4-6 menit/)).toBeInTheDocument();
    expect(screen.getByText(/3 pertanyaan/)).toBeInTheDocument();
  });

  it("calls onStart when the CTA button is clicked", () => {
    const onStart = vi.fn();
    render(React.createElement(PhaseIntroScreen, { phaseId: 2, onStart }));

    const button = screen.getByText("Mulai Bab Ini");
    fireEvent.click(button);

    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
