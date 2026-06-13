import { useState } from "react";

const SYSTEM_PROMPT = `You are IPA Reasoning Coach, an expert phonology tutor specializing in connected speech and IPA transcription.

For any English sentence, analyze it using these 16 phonological rules and return ONLY a valid JSON object — no markdown, no backticks, no preamble.

RULES:
R01 Flapping (GenAm primary): /t/ or /d/ between vowels, second unstressed → [ɾ]. Blocked at stressed onset or before syllabic /n/.
R02 T-glottalization (RP primary): /t/ before syllabic /n/ or word-final coda → [ʔ].
R03 H-dropping (both): /h/ deleted in unstressed pronouns him/her/his/have after verb.
R04 Linking-R (RP only): non-rhotic word-final vowel + vowel-initial word → insert /r/.
R05 Intrusive-R (RP only): open vowel + vowel-initial word → insert /r/ (no etymological R).
R06 Yod coalescence (both): /t+j/ → [tʃ], /d+j/ → [dʒ] at word boundaries in fast speech.
R07 Nasal assimilation (both): /n/ → bilabial [m] before labials, velar [ŋ] before velars.
R08 Weak forms (both): and→[ən] of→[əv] to→[tə] for→[fər] the→[ðə] a→[ə] was→[wəz] are→[ər].
R09 Contractions (both): will→'ll would→'d have→'ve is→'s are→'re. Blocked by emphatic stress.
R10 Gonna (GenAm primary): "going to" + verb → [ˈɡʌnə].
R11 Wanna (GenAm primary): "want to" → [ˈwɑnə].
R12 Gotta (GenAm): "got to" → [ˈɡɑɾə].
R13 Shoulda/Woulda/Coulda (both): should/would/could + have → [ˈʃʊdə]/[ˈwʊdə]/[ˈkʊdə]. Strongly associated with regret and informal register.
R14 Cluster elision (both): /t/ deleted in final consonant clusters before consonant.
R15 Vowel reduction (both): unstressed vowels → schwa [ə].
R16 Smoothing (RP): diphthongs compress in rapid speech.

CONFLICT RESOLUTION:
- Flapping beats t-glottalization intervocalically in GenAm
- T-glottalization beats flapping before syllabic /n/ (button, mountain)
- Contraction applies before weak form reduction
- Yod coalescence applies before vowel reduction
- Cluster elision applies before nasal assimilation feeds on result

COMMUNICATIVE FACTORS (use when explaining "why"):
- formality: decreases gonna/wanna/shoulda/h-dropping/flapping; blocks contractions when emphatic
- speech_rate: increases all reductions, triggers yod coalescence
- emotional_state: increases shoulda/woulda/coulda in regret/frustration contexts
- regional_identity: increases flapping and gonna for GenAm identity
- emphasis: blocks contractions and weak forms on the emphasized word

DEFAULT: General American (GenAm) unless user specifies RP.
NEVER say "no data found". Every English sentence can be analyzed from rules.

Return this exact JSON structure:
{
  "formal_ipa": "full formal IPA of the sentence",
  "casual_ipa": "full casual connected-speech IPA",
  "variety": "GenAm",
  "transformations": [
    {
      "id": "R01",
      "rule_name": "Flapping",
      "segment": "better",
      "result": "ˈbɛɾɚ",
      "explanation": "plain language explanation of why this applies here"
    }
  ],
  "conflict_notes": "describe any resolved conflict, or empty string if none",
  "why": "1-2 sentences on which communicative factors drive these choices",
  "shadowing_tip": "one specific actionable shadowing practice tip",
  "youglish_genam": "https://youglish.com/pronounce/SENTENCE+WITH+PLUS+SIGNS/english/us",
  "youglish_rp": "https://youglish.com/pronounce/SENTENCE+WITH+PLUS+SIGNS/english/uk"
}`;

const RULE_COLORS = {
  R01: "#2dd4bf", R02: "#38bdf8", R03: "#a78bfa", R04: "#34d399",
  R05: "#6ee7b7", R06: "#f472b6", R07: "#fb923c", R08: "#fbbf24",
  R09: "#e879f9", R10: "#4ade80", R11: "#22d3ee", R12: "#f87171",
  R13: "#c084fc", R14: "#94a3b8", R15: "#64748b", R16: "#818cf8",
};

export default function IPAReasoningCoach() {
  const [sentence, setSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: trimmed }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.[0]?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError("Could not analyze the sentence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyze();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      color: "#e2e8f0",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "0 0 60px",
    }}>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e293b",
        padding: "24px 32px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}>
        <div style={{
          width: 40, height: 40,
          background: "linear-gradient(135deg, #2dd4bf 0%, #0891b2 100%)",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}>🎙</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
            IPA Reasoning Coach
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            Connected speech · IPA transformations · Phonological reasoning
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px 0" }}>

        {/* Input area */}
        <div style={{
          background: "#0f1623",
          border: "1px solid #1e293b",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 24,
        }}>
          <textarea
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type any English sentence — e.g. I should have known better"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e2e8f0",
              fontSize: 16,
              lineHeight: 1.6,
              padding: "20px 20px 12px",
              resize: "none",
              minHeight: 80,
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
            rows={2}
          />
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px 12px",
          }}>
            <span style={{ fontSize: 11, color: "#334155" }}>⌘ + Enter to analyze</span>
            <button
              onClick={analyze}
              disabled={loading || !sentence.trim()}
              style={{
                background: loading || !sentence.trim() ? "#1e293b" : "#2dd4bf",
                color: loading || !sentence.trim() ? "#475569" : "#080c14",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 600,
                cursor: loading || !sentence.trim() ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#1c0a0a", border: "1px solid #7f1d1d",
            borderRadius: 10, padding: "14px 18px",
            color: "#fca5a5", fontSize: 14, marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[120, 80, 200].map((h, i) => (
              <div key={i} style={{
                background: "#0f1623", borderRadius: 10,
                height: h, opacity: 0.6,
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* IPA comparison */}
            <div style={{
              background: "#0f1623",
              border: "1px solid #1e293b",
              borderRadius: 14,
              overflow: "hidden",
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}>
                <div style={{
                  padding: "20px 22px",
                  borderRight: "1px solid #1e293b",
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                    color: "#475569", textTransform: "uppercase", marginBottom: 10,
                  }}>Formal IPA</div>
                  <div style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 15, lineHeight: 1.6,
                    color: "#2dd4bf",
                    wordBreak: "break-all",
                  }}>{result.formal_ipa}</div>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                    color: "#475569", textTransform: "uppercase", marginBottom: 10,
                  }}>Casual connected speech</div>
                  <div style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 15, lineHeight: 1.6,
                    color: "#fbbf24",
                    wordBreak: "break-all",
                  }}>{result.casual_ipa}</div>
                </div>
              </div>
              <div style={{
                padding: "10px 22px",
                borderTop: "1px solid #1e293b",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{
                  fontSize: 11, color: "#475569",
                  background: "#141d2e", borderRadius: 4,
                  padding: "2px 8px",
                }}>{result.variety}</span>
              </div>
            </div>

            {/* Transformations */}
            {result.transformations?.length > 0 && (
              <div style={{
                background: "#0f1623",
                border: "1px solid #1e293b",
                borderRadius: 14,
                overflow: "hidden",
              }}>
                <div style={{
                  padding: "16px 20px 12px",
                  borderBottom: "1px solid #1e293b",
                  fontSize: 12, fontWeight: 600,
                  color: "#64748b", letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}>Transformations applied</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {result.transformations.map((t, i) => (
                    <div key={i} style={{
                      padding: "14px 20px",
                      borderBottom: i < result.transformations.length - 1
                        ? "1px solid #0f172a" : "none",
                      display: "flex", gap: 14, alignItems: "flex-start",
                    }}>
                      <span style={{
                        background: RULE_COLORS[t.id] + "20",
                        color: RULE_COLORS[t.id] || "#64748b",
                        border: `1px solid ${RULE_COLORS[t.id] || "#334155"}40`,
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11, fontWeight: 700,
                        letterSpacing: "0.05em",
                        flexShrink: 0,
                        marginTop: 1,
                      }}>{t.id}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: "flex", alignItems: "center",
                          gap: 8, marginBottom: 4, flexWrap: "wrap",
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>
                            {t.rule_name}
                          </span>
                          <span style={{ color: "#334155", fontSize: 12 }}>·</span>
                          <span style={{
                            fontFamily: "'Courier New', monospace",
                            fontSize: 12, color: "#94a3b8",
                          }}>{t.segment}</span>
                          <span style={{ color: "#334155", fontSize: 12 }}>→</span>
                          <span style={{
                            fontFamily: "'Courier New', monospace",
                            fontSize: 12, color: "#fbbf24",
                          }}>{t.result}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                          {t.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conflict notes */}
            {result.conflict_notes && (
              <div style={{
                background: "#0f1219",
                border: "1px solid #1e2a3a",
                borderLeft: "3px solid #38bdf8",
                borderRadius: 10,
                padding: "14px 18px",
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                  color: "#38bdf8", textTransform: "uppercase", marginBottom: 6,
                }}>Conflict resolved</div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
                  {result.conflict_notes}
                </div>
              </div>
            )}

            {/* Why + Shadowing in grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{
                background: "#0f1623",
                border: "1px solid #1e293b",
                borderRadius: 12,
                padding: "16px 18px",
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                  color: "#a78bfa", textTransform: "uppercase", marginBottom: 8,
                }}>Why these forms?</div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                  {result.why}
                </div>
              </div>
              <div style={{
                background: "#0f1623",
                border: "1px solid #1e293b",
                borderLeft: "3px solid #2dd4bf",
                borderRadius: 12,
                padding: "16px 18px",
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                  color: "#2dd4bf", textTransform: "uppercase", marginBottom: 8,
                }}>Shadowing tip</div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                  {result.shadowing_tip}
                </div>
              </div>
            </div>

            {/* YouGlish links */}
            <div style={{
              background: "#0f1623",
              border: "1px solid #1e293b",
              borderRadius: 12,
              padding: "16px 18px",
            }}>
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                color: "#64748b", textTransform: "uppercase", marginBottom: 12,
              }}>Hear it from native speakers</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={result.youglish_genam}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "10px 16px",
                    color: "#e2e8f0",
                    textDecoration: "none",
                    fontSize: 13, fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#2dd4bf"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
                >
                  🇺🇸 General American — YouGlish
                </a>
                <a
                  href={result.youglish_rp}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "10px 16px",
                    color: "#e2e8f0",
                    textDecoration: "none",
                    fontSize: 13, fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#fbbf24"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
                >
                  🇬🇧 British RP — YouGlish
                </a>
              </div>
            </div>

          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#334155",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎙️</div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              Enter any English sentence to see how native speakers<br />
              actually pronounce it — rule by rule, step by step.
            </div>
            <div style={{
              marginTop: 24,
              display: "flex", flexWrap: "wrap",
              gap: 8, justifyContent: "center",
            }}>
              {[
                "I should have known better",
                "Did you eat yet?",
                "What are you going to do?",
                "I couldn't have done it",
              ].map(ex => (
                <button
                  key={ex}
                  onClick={() => setSentence(ex)}
                  style={{
                    background: "#0f1623",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "8px 14px",
                    color: "#64748b",
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#2dd4bf";
                    e.currentTarget.style.color = "#2dd4bf";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#1e293b";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
