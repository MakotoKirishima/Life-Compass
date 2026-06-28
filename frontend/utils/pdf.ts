export function downloadResultAsPDF(result: any) {
  const content = `
    Life Compass - Hasil Direction Snapshot
    =======================================
    
    Ringkasan:
    ${result.summary}
    
    Rekomendasi Utama:
    ${result.top_recommendation.career_title} (${result.top_recommendation.score})
    ${result.top_recommendation.reason}
    
    Eksplorasi:
    ${result.exploration.career_title} (${result.exploration.score})
    ${result.exploration.reason}
    
    Rencana Eksperimen:
    ${(result.experiment_plan || []).map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}
    
    -- Life Compass --
    Alat bantu keputusan karir. Bukan konseling profesional.
  `;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `life-compass-result-${result.match_id || "snapshot"}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
