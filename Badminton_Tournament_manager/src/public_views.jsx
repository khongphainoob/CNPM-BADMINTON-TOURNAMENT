/* Athlete & Spectator views */
const { useState: useS_pub } = React;

/* ---------------- ATHLETE PORTAL ---------------- */
function AthleteView() {
  const [view, setView] = useS_pub("overview");
  const me = {
    name: "Nguyễn Hải Đăng",
    id: "A-0142",
    club: "CAND",
    tier: "A",
    rating: 2184,
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        height: "100%",
        background: "var(--paper-2)",
      }}
    >
      <aside
        style={{
          background: "var(--paper)",
          borderRight: "1px solid var(--line)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: "var(--ink)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            NH
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{me.name}</div>
            <div
              className="mono"
              style={{ fontSize: 10.5, color: "var(--ink-3)" }}
            >
              {me.id} · {me.club}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <span className="pill ok">Hạng {me.tier}</span>
          <span className="pill info">Rating {me.rating}</span>
        </div>
        <div
          style={{
            borderTop: "1px solid var(--line)",
            paddingTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {[
            ["overview", "Tổng quan", "dashboard"],
            ["matches", "Lịch thi đấu của tôi", "calendar"],
            ["profile", "Hồ sơ & giấy tờ", "user"],
            ["register", "Đăng ký giải mới", "plus"],
            ["ranking", "Bảng xếp hạng", "chart"],
          ].map(([id, l, ic]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 6,
                border: 0,
                background: view === id ? "var(--paper-2)" : "transparent",
                color: "var(--ink)",
                textAlign: "left",
                fontSize: 13,
                fontWeight: view === id ? 600 : 400,
              }}
            >
              <Icon name={ic} size={14} />
              {l}
            </button>
          ))}
        </div>
      </aside>

      <main style={{ padding: 24, overflowY: "auto" }}>
        {view === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <div className="caps">Lời chào</div>
              <h1
                className="serif"
                style={{
                  margin: "2px 0 6px",
                  fontSize: 34,
                  letterSpacing: "0.01em",
                  textTransform: "uppercase",
                }}
              >
                Xin chào, Hải Đăng.
              </h1>
              <div style={{ color: "var(--ink-2)", fontSize: 13 }}>
                Bạn có 1 trận sắp diễn ra tại Sân 1 · 16:00 hôm nay.
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              <StatCard label="Trận sắp tới" value="1" sub="hôm nay" />
              <StatCard
                label="Đã thi đấu"
                value="2"
                sub="thắng 2 · thua 0"
                accent="var(--court)"
              />
              <StatCard
                label="Điểm tích lũy"
                value={me.rating}
                sub="+42 tuần này"
              />
              <StatCard
                label="Hạng quốc gia"
                value="#4"
                sub="Đơn nam · Hạng A"
              />
            </div>
            <div
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--line)",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Trận của tôi tại giải này
              </div>
              {[
                {
                  t: "18/04 16:00",
                  court: 1,
                  round: "Vòng 1/16",
                  opp: "Vũ Tiến Dũng · TP.HCM",
                  st: "upcoming",
                },
                {
                  t: "18/04 14:20",
                  court: 1,
                  round: "Vòng 1/16",
                  opp: "Trần Minh Quân · TP.HCM",
                  st: "live",
                  score: "21-18, 14-21, 17-14",
                },
                {
                  t: "17/04 10:30",
                  court: 3,
                  round: "Vòng 1/32",
                  opp: "Nguyễn Quang Hưng · Nghệ An",
                  st: "done",
                  score: "21-14, 21-19",
                },
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 60px 120px 1fr auto auto",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--line-2)",
                    fontSize: 12.5,
                    alignItems: "center",
                  }}
                >
                  <div className="mono">{r.t}</div>
                  <div className="mono">Sân {r.court}</div>
                  <div style={{ color: "var(--ink-2)" }}>{r.round}</div>
                  <div>vs {r.opp}</div>
                  <div className="mono" style={{ color: "var(--ink-3)" }}>
                    {r.score || ""}
                  </div>
                  <div>
                    {r.st === "upcoming" && (
                      <span className="pill info">Sắp diễn ra</span>
                    )}
                    {r.st === "live" && (
                      <span className="pill live">
                        <span className="dot live-dot" />
                        LIVE
                      </span>
                    )}
                    {r.st === "done" && <span className="pill ok">Thắng</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === "register" && <OnboardingFlow />}
        {view === "profile" && <AthleteProfile me={me} />}
        {view === "matches" && (
          <div style={{ fontSize: 14, color: "var(--ink-2)" }}>
            Xem tab Tổng quan để quản lý trận của bạn.
          </div>
        )}
        {view === "ranking" && <RankingTable />}
      </main>
    </div>
  );
}

function OnboardingFlow() {
  const [step, setStep] = useS_pub(1);
  const [cats, setCats] = useS_pub(["MS"]);
  const STEPS = ["Thông tin", "Giấy tờ", "Hạng mục", "Xác nhận"];
  const fee = cats.length * 500_000;

  const toggleCat = (k) =>
    setCats((prev) =>
      prev.includes(k) ? prev.filter((c) => c !== k) : [...prev, k]
    );

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="caps">Đăng ký giải đấu</div>
      <h1
        className="serif"
        style={{
          margin: "2px 0 24px",
          fontSize: 30,
          textTransform: "uppercase",
        }}
      >
        {TOURNAMENT.name}
      </h1>

      {/* Step progress */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background:
                    step > i + 1
                      ? "var(--court)"
                      : step === i + 1
                        ? "var(--ink)"
                        : "var(--paper-3)",
                  color: step >= i + 1 ? "white" : "var(--ink-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  border:
                    "2px solid " +
                    (step === i + 1
                      ? "var(--ink)"
                      : step > i + 1
                        ? "var(--court)"
                        : "var(--line)"),
                }}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  whiteSpace: "nowrap",
                  color: step === i + 1 ? "var(--ink)" : "var(--ink-3)",
                  fontWeight: step === i + 1 ? 600 : 400,
                }}
              >
                {s}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: "0 6px",
                  marginBottom: 18,
                  background: step > i + 1 ? "var(--court)" : "var(--line)",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step panels */}
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: 24,
        }}
      >
        {/* Step 1 — Personal info */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="caps">Thông tin cá nhân</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field label="Họ và tên *" value="Nguyễn Hải Đăng" />
              <Field label="Ngày sinh *" value="12/08/1998" />
              <Field label="CCCD / CMND *" value="079098001234" />
              <Field label="CLB / đơn vị *" value="CAND" />
              <Field label="Số điện thoại *" value="0912 345 678" />
              <Field label="Email" value="haidang@cand.vn" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  marginBottom: 6,
                }}
              >
                Tay thuận
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Phải", "Trái"].map((h, i) => (
                  <label
                    key={h}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 6,
                      border:
                        "1px solid " +
                        (i === 0 ? "var(--ink)" : "var(--line)"),
                      background: i === 0 ? "var(--ink)" : "var(--paper)",
                      color: i === 0 ? "white" : "var(--ink-2)",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="hand"
                      defaultChecked={i === 0}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    {h}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Documents */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div className="caps" style={{ marginBottom: 6 }}>
                Ảnh và giấy tờ tùy thân
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-2)",
                  marginBottom: 16,
                }}
              >
                Tệp JPG/PNG · tối đa 5MB · ảnh rõ nét, không chỉnh sửa.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                }}
              >
                {[
                  ["ẢNH 3×4", "Ảnh chân dung\n(nền trắng, nhìn thẳng)", 150],
                  ["CCCD · MẶT TRƯỚC", "Căn cước công dân\nmặt trước", 110],
                  ["CCCD · MẶT SAU", "Căn cước công dân\nmặt sau", 110],
                ].map(([placeholder, label, h]) => (
                  <div key={placeholder}>
                    <div
                      className="court-placeholder"
                      style={{
                        height: h,
                        borderRadius: 6,
                        fontSize: 9.5,
                        cursor: "pointer",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 20, opacity: 0.35 }}>↑</span>
                      {placeholder}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--ink-3)",
                        marginTop: 6,
                        lineHeight: 1.45,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                background: "var(--amber-soft)",
                border: "1px solid oklch(0.85 0.08 70)",
                borderRadius: 6,
                padding: "10px 14px",
                fontSize: 12,
                color: "oklch(0.4 0.14 70)",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span>⚠</span>
              <span>
                Hồ sơ thiếu ảnh hoặc CCCD mờ sẽ bị trả lại để bổ sung. Vui
                lòng kiểm tra kỹ trước khi nộp.
              </span>
            </div>
          </div>
        )}

        {/* Step 3 — Categories */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="caps">Hạng mục tham dự</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(CATEGORIES).map(([k, v]) => {
                const sel = cats.includes(k);
                return (
                  <label
                    key={k}
                    onClick={() => toggleCat(k)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 16px",
                      borderRadius: 8,
                      border:
                        "1px solid " +
                        (sel ? "var(--ink)" : "var(--line)"),
                      background: sel ? "var(--paper-2)" : "var(--paper)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        border:
                          "2px solid " +
                          (sel ? "var(--ink)" : "var(--ink-4)"),
                        background: sel ? "var(--ink)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {sel && (
                        <span
                          style={{
                            color: "white",
                            fontSize: 11,
                            lineHeight: 1,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: sel ? 600 : 400,
                          fontSize: 13.5,
                        }}
                      >
                        {v}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--ink-3)",
                          marginTop: 1,
                        }}
                      >
                        {k} · Lệ phí tham dự: 500.000 ₫
                      </div>
                    </div>
                    <div
                      className="mono"
                      style={{ fontSize: 12.5, color: "var(--ink-2)" }}
                    >
                      500.000 ₫
                    </div>
                  </label>
                );
              })}
            </div>
            <div
              style={{
                background: "var(--paper-2)",
                borderRadius: 8,
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid var(--line)",
              }}
            >
              <div>
                <div className="caps">Tổng lệ phí</div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--ink-3)",
                    marginTop: 2,
                  }}
                >
                  {cats.length} hạng mục × 500.000 ₫
                </div>
              </div>
              <div className="serif" style={{ fontSize: 32 }}>
                {fee.toLocaleString("vi-VN")} ₫
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Confirmation */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="caps">Xác nhận thông tin</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                ["Họ và tên", "Nguyễn Hải Đăng"],
                ["Ngày sinh", "12/08/1998"],
                ["CCCD", "079098001234"],
                ["CLB", "CAND"],
                ["Tay thuận", "Phải"],
                [
                  "Hạng mục",
                  cats.map((c) => CATEGORIES[c]).join(", ") || "—",
                ],
              ].map(([l, v]) => (
                <div
                  key={l}
                  style={{
                    padding: "10px 12px",
                    background: "var(--paper-2)",
                    borderRadius: 6,
                    border: "1px solid var(--line-2)",
                  }}
                >
                  <div className="caps" style={{ marginBottom: 3 }}>
                    {l}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="caps" style={{ marginBottom: 6 }}>
                Giấy tờ đã tải lên
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Ảnh 3×4", "CCCD mặt trước", "CCCD mặt sau"].map((d) => (
                  <span key={d} className="pill ok">
                    {d} ✓
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                background: "var(--paper-2)",
                borderRadius: 8,
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid var(--line)",
              }}
            >
              <div>
                <div className="caps">Tổng thanh toán</div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--ink-3)",
                    marginTop: 2,
                  }}
                >
                  {cats.length} hạng mục · VNPay / MoMo
                </div>
              </div>
              <div className="serif" style={{ fontSize: 32 }}>
                {fee.toLocaleString("vi-VN")} ₫
              </div>
            </div>
            <label
              style={{
                fontSize: 12.5,
                color: "var(--ink-2)",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <input
                type="checkbox"
                defaultChecked
                style={{ accentColor: "var(--accent)", marginTop: 2 }}
              />
              Tôi xác nhận thông tin trên là đúng sự thật và đồng ý với điều lệ
              giải. Dữ liệu cá nhân được xử lý theo NĐ 13/2023/NĐ-CP.
            </label>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        {step > 1 ? (
          <button onClick={() => setStep((s) => s - 1)} style={btnGhost}>
            ← Quay lại
          </button>
        ) : (
          <div />
        )}
        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            style={{ ...btnPrimary, background: "var(--ink)" }}
          >
            Tiếp theo →
          </button>
        ) : (
          <button style={{ ...btnPrimary, background: "var(--accent)" }}>
            Nộp hồ sơ & thanh toán VNPay →
          </button>
        )}
      </div>
    </div>
  );
}
const Field = ({ label, value }) => (
  <label style={{ display: "block" }}>
    <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>
      {label}
    </div>
    <input
      defaultValue={value}
      style={{
        width: "100%",
        padding: "9px 11px",
        border: "1px solid var(--line)",
        borderRadius: 6,
        background: "var(--paper)",
        fontSize: 13,
      }}
    />
  </label>
);

function AthleteProfile({ me }) {
  return (
    <div
      style={{
        maxWidth: 780,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div>
        <div className="caps">Hồ sơ</div>
        <h1 className="serif" style={{ margin: "2px 0 0", fontSize: 30 }}>
          {me.name}
        </h1>
      </div>
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: 20,
          display: "grid",
          gridTemplateColumns: "120px 1fr",
          gap: 20,
        }}
      >
        <div
          className="court-placeholder"
          style={{ height: 150, fontSize: 10 }}
        >
          ảnh 3×4
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {[
            ["Mã VĐV", me.id],
            ["CLB", me.club],
            ["Hạng", me.tier],
            ["Rating", me.rating],
            ["Năm sinh", "1998"],
            ["Tay thuận", "Phải"],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="caps">{l}</div>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 13 }}>Thành tích 12 tháng gần đây</h3>
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 12,
            alignItems: "flex-end",
            height: 100,
          }}
        >
          {[55, 72, 40, 88, 64, 92, 70, 80, 60, 95, 78, 85].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${h}%`,
                  background: i === 11 ? "var(--accent)" : "var(--ink)",
                  borderRadius: 2,
                }}
              />
              <div
                className="mono"
                style={{ fontSize: 9.5, color: "var(--ink-3)" }}
              >
                {
                  [
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                    "1",
                    "2",
                    "3",
                    "4",
                  ][i]
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RankingTable() {
  return (
    <div style={{ maxWidth: 780 }}>
      <div className="caps">Bảng xếp hạng quốc gia</div>
      <h1 className="serif" style={{ margin: "2px 0 14px", fontSize: 30 }}>
        Đơn nam · tuần 16/2026
      </h1>
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}
        >
          <thead>
            <tr style={{ background: "var(--paper-2)", color: "var(--ink-3)" }}>
              {["#", "Vận động viên", "CLB", "Hạng", "Điểm", "Thay đổi"].map(
                (h) => (
                  <th
                    key={h}
                    className="caps"
                    style={{
                      padding: "9px 12px",
                      textAlign:
                        h === "Điểm" || h === "Thay đổi" ? "right" : "left",
                      fontWeight: 600,
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {RANKING_MS.map((r) => (
              <tr
                key={r.rank}
                style={{
                  background:
                    r.name === "Nguyễn Hải Đăng"
                      ? "var(--amber-soft)"
                      : "transparent",
                }}
              >
                <td
                  className="mono"
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--line-2)",
                  }}
                >
                  {r.rank}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--line-2)",
                    fontWeight: 500,
                  }}
                >
                  {r.name}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--line-2)",
                  }}
                >
                  {r.club}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--line-2)",
                  }}
                >
                  {r.tier}
                </td>
                <td
                  className="mono"
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--line-2)",
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  {r.pts.toLocaleString("vi-VN")}
                </td>
                <td
                  className="mono"
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--line-2)",
                    textAlign: "right",
                    color:
                      r.chg > 0
                        ? "var(--court)"
                        : r.chg < 0
                          ? "var(--accent)"
                          : "var(--ink-3)",
                  }}
                >
                  {r.chg > 0 ? "▲" : r.chg < 0 ? "▼" : "—"}{" "}
                  {r.chg !== 0 ? Math.abs(r.chg) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- TOURNAMENT LANDING PAGE ---------------- */
function PubHome({ onGoTo }) {
  const featured = LIVE_MATCHES[2];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

      {/* Key stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          ["Vận động viên", TOURNAMENT.registered, "đã đăng ký"],
          ["Trận hôm nay", TOURNAMENT.matches.live + TOURNAMENT.matches.next, "live + sắp diễn ra"],
          ["Sân thi đấu", TOURNAMENT.courts, LIVE_MATCHES.length + " đang sử dụng"],
          ["Hạng mục", TOURNAMENT.categories.length, TOURNAMENT.categories.join(" · ")],
        ].map(([label, val, sub]) => (
          <div key={label} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 8, padding: "16px 18px" }}>
            <div className="caps">{label}</div>
            <div className="serif" style={{ fontSize: 44, margin: "4px 0 2px", lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Featured match + Categories */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* Featured live match */}
        <div>
          <div className="caps" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span className="pill live" style={{ padding: "1px 7px", fontSize: 9.5 }}>
              <span className="dot live-dot" /> LIVE
            </span>
            Trận nổi bật
          </div>
          <div style={{ background: "var(--ink)", color: "white", borderRadius: 10, padding: 22 }}>
            <div style={{ fontSize: 11, color: "oklch(0.68 0.01 250)", marginBottom: 14 }}>
              {CATEGORIES[featured.cat]} · {featured.round} · Sân {featured.court}
            </div>

            {[featured.a, featured.b].map((player, pi) => {
              const setsWon = featured.sets
                .filter((_, i) => i < featured.current)
                .reduce((acc, s) => acc + (s[pi] > s[1 - pi] ? 1 : 0), 0);
              return (
                <React.Fragment key={pi}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{player.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.55, marginTop: 1 }}>
                        {player.club}{player.seed ? " · Hạt giống " + player.seed : ""}
                      </div>
                    </div>
                    <div className="serif" style={{ fontSize: 48, color: "white", lineHeight: 1, minWidth: 32, textAlign: "center" }}>
                      {setsWon}
                    </div>
                  </div>
                  {pi === 0 && <div style={{ height: 1, background: "oklch(0.28 0.01 250)", margin: "12px 0" }} />}
                </React.Fragment>
              );
            })}

            <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {featured.sets.map((s, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "6px 12px", borderRadius: 4, gap: 2,
                  background: i === featured.current ? "var(--accent)" : "oklch(0.23 0.01 250)",
                  fontSize: 14, fontWeight: 700,
                }}>
                  <span>{s[0]}</span>
                  <span style={{ fontSize: 8, opacity: 0.4, fontWeight: 400 }}>–</span>
                  <span>{s[1]}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="mono" style={{ fontSize: 10.5, color: "oklch(0.68 0.01 250)" }}>
                ⏱ {featured.elapsed} · TT: {featured.umpire}
              </div>
              <button onClick={() => onGoTo("live")} style={{
                background: "transparent", border: "1px solid oklch(0.34 0.01 250)",
                color: "oklch(0.82 0.01 250)", padding: "6px 13px",
                borderRadius: 5, fontSize: 11.5,
              }}>
                Tất cả trận →
              </button>
            </div>
          </div>
        </div>

        {/* Category list */}
        <div>
          <div className="caps" style={{ marginBottom: 10 }}>Hạng mục thi đấu</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <div key={k} style={{
                background: "var(--paper)", border: "1px solid var(--line)",
                borderRadius: 8, padding: "13px 16px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div className="serif" style={{ fontSize: 22, minWidth: 44, color: "var(--accent)" }}>{k}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>
                    Bảng đấu → Loại trực tiếp
                  </div>
                </div>
                <span className="pill live" style={{ fontSize: 10 }}>
                  <span className="dot live-dot" /> Đang diễn ra
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest news */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="caps">Tin tức mới nhất</div>
          <button onClick={() => onGoTo("news")} style={{ ...btnGhost, fontSize: 12 }}>Xem tất cả →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {NEWS.map((n) => (
            <div key={n.id} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", cursor: "pointer" }}>
              <div className="court-placeholder" style={{ height: 100, fontSize: 9 }}>tin · 16:9</div>
              <div style={{ padding: "12px 14px" }}>
                <span className="pill" style={{ fontSize: 10 }}>{n.tag}</span>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.35, margin: "6px 0 4px" }}>{n.title}</div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{n.ts}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      <div style={{
        background: "var(--ink)", borderRadius: 10, padding: "32px 36px",
        display: "flex", alignItems: "center", gap: 24,
      }}>
        <div style={{ flex: 1, color: "white" }}>
          <div className="caps" style={{ color: "oklch(0.68 0.01 250)" }}>Còn 8 ngày thi đấu</div>
          <div className="serif" style={{ fontSize: 36, marginTop: 4 }}>Chưa đăng ký?</div>
          <div style={{ fontSize: 13, color: "oklch(0.78 0.01 250)", marginTop: 6 }}>
            Đăng ký trước 19/04 · Lệ phí từ 500.000 ₫/hạng mục
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button style={{
            background: "var(--accent)", border: 0, color: "white",
            padding: "11px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600,
          }}>
            Đăng ký tham dự →
          </button>
          <button onClick={() => onGoTo("schedule")} style={{
            background: "transparent", border: "1px solid oklch(0.34 0.01 250)",
            color: "white", padding: "11px 20px", borderRadius: 6, fontSize: 13,
          }}>
            Xem lịch thi đấu
          </button>
        </div>
      </div>

    </div>
  );
}

/* ---------------- SPECTATOR NAV ---------------- */
function SpectatorNav({ tab, setTab }) {
  const NAV = [
    ["home",     "Tổng quan"],
    ["ranking",  "Bảng xếp hạng"],
    ["calendar", "Lịch thi đấu"],
    ["players",  "Vận động viên"],
    ["news",     "Tin tức"],
  ];
  return (
    <nav style={{
      background: "oklch(0.15 0.03 260)",
      color: "white",
      position: "sticky",
      top: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "stretch",
      padding: "0 48px",
      minHeight: 60,
      boxShadow: "0 2px 20px oklch(0.05 0.03 260 / 0.55)",
    }}>
      <button
        onClick={() => setTab("home")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "transparent",
          border: 0,
          color: "white",
          padding: "0 36px 0 0",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <ShuttleMark size={24} />
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 19,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}>
          Shuttle<span style={{ color: "var(--accent)" }}>·</span>Ops
        </span>
      </button>

      <div style={{ display: "flex", flex: 1 }}>
        {NAV.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              background: "transparent",
              border: 0,
              borderBottom: "3px solid " + (tab === id ? "var(--accent)" : "transparent"),
              color: tab === id ? "white" : "oklch(0.60 0.02 260)",
              padding: "0 16px",
              fontSize: 12,
              fontWeight: tab === id ? 700 : 500,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <span className="pill live" style={{ fontSize: 10.5 }}>
          <span className="dot live-dot" /> {LIVE_MATCHES.length} trận live
        </span>
      </div>
    </nav>
  );
}

/* ---------------- SPECTATOR HERO ---------------- */
function SpectatorHero({ tab }) {
  const configs = {
    home: {
      label: "Giải đấu đang diễn ra · Ngày 1 / 9",
      lines: ["National Club", "Badminton", "Championship 2026"],
      accent: 1,
      sub: "18 – 26 tháng 4 · Nhà thi đấu Phú Thọ, TP.HCM · 384 VĐV · 5 hạng mục",
    },
    ranking: {
      label: "Xếp hạng quốc gia · 2026",
      lines: ["Bảng", "Xếp Hạng", "Quốc Gia"],
      accent: 1,
      sub: "Điểm tích lũy từ các giải đấu VBF được công nhận trong năm 2026",
    },
    calendar: {
      label: "Lịch thi đấu · 18–26 tháng 4",
      lines: ["Lịch", "Thi Đấu", "& Kết Quả"],
      accent: 1,
      sub: "284 trận · 8 sân · Bảng đấu + Loại trực tiếp",
    },
    players: {
      label: "Danh sách vận động viên · 2026",
      lines: ["Vận Động", "Viên", "Tham Dự"],
      accent: 1,
      sub: "384 vận động viên đã đăng ký từ các câu lạc bộ toàn quốc",
    },
    news: {
      label: "Tin tức & truyền thông",
      lines: ["Tin Tức", "&", "Highlight"],
      accent: 0,
      sub: "Bài viết, thông báo và highlight từ ban tổ chức giải đấu",
    },
  };
  const cfg = configs[tab] || configs.home;

  return (
    <section style={{
      background: "oklch(0.15 0.03 260)",
      color: "white",
      padding: "60px 48px 50px",
      position: "relative",
      overflow: "hidden",
      minHeight: 252,
    }}>
      {/* Badminton court SVG overlay */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0, right: 0,
          height: "100%",
          width: "55%",
          opacity: 0.05,
          pointerEvents: "none",
        }}
        viewBox="0 0 560 300"
        preserveAspectRatio="xMaxYMid slice"
        fill="none"
        stroke="white"
      >
        <rect x="40" y="20" width="480" height="260" strokeWidth="2"/>
        <line x1="280" y1="20" x2="280" y2="280" strokeWidth="1.5"/>
        <line x1="40" y1="150" x2="520" y2="150" strokeWidth="1.2"/>
        <line x1="40" y1="98" x2="280" y2="98" strokeWidth="0.8"/>
        <line x1="280" y1="202" x2="520" y2="202" strokeWidth="0.8"/>
        <line x1="40" y1="44" x2="520" y2="44" strokeWidth="0.7"/>
        <line x1="40" y1="256" x2="520" y2="256" strokeWidth="0.7"/>
        <line x1="84" y1="20" x2="84" y2="280" strokeWidth="0.7"/>
        <line x1="476" y1="20" x2="476" y2="280" strokeWidth="0.7"/>
        <line x1="40" y1="20" x2="40" y2="280" strokeWidth="0.7"/>
        <line x1="520" y1="20" x2="520" y2="280" strokeWidth="0.7"/>
      </svg>

      {/* Decorative rings */}
      <div style={{
        position: "absolute", top: -90, right: -90,
        width: 420, height: 420,
        borderRadius: "50%",
        border: "1px solid oklch(0.27 0.03 260)",
        pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", bottom: -50, right: 140,
        width: 180, height: 180,
        borderRadius: "50%",
        border: "1px solid oklch(0.22 0.02 260)",
        pointerEvents: "none",
      }}/>

      <div style={{ position: "relative", maxWidth: 1184, margin: "0 auto" }}>
        <div style={{
          fontFamily: "var(--font-sans)",
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: 16,
        }}>
          {cfg.label}
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(48px, 7vw, 86px)",
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          margin: "0 0 20px",
          maxWidth: 760,
        }}>
          {cfg.lines.map((line, i) => (
            <React.Fragment key={i}>
              {i === cfg.accent
                ? <span style={{ color: "var(--accent)" }}>{line}</span>
                : line}
              {i < cfg.lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13.5,
          color: "oklch(0.65 0.02 260)",
          margin: 0,
          lineHeight: 1.65,
          maxWidth: 520,
        }}>
          {cfg.sub}
        </p>
      </div>
    </section>
  );
}

/* ---------------- PLAYER SEARCH + CARDS ---------------- */
function PubPlayers() {
  const [query, setQuery] = useS_pub("");
  const [filterTier, setFilterTier] = useS_pub("all");

  const filtered = ATHLETES.filter(a => {
    const q = query.trim().toLowerCase();
    const matchQ = !q
      || a.name.toLowerCase().includes(q)
      || a.club.toLowerCase().includes(q)
      || a.id.toLowerCase().includes(q);
    const matchTier = filterTier === "all" || a.tier === filterTier;
    return matchQ && matchTier;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 320px", maxWidth: 480 }}>
          <span style={{
            position: "absolute",
            left: 12, top: "50%",
            transform: "translateY(-50%)",
            color: "var(--ink-3)",
            pointerEvents: "none",
            display: "flex",
          }}>
            <Icon name="search" size={15} />
          </span>
          <input
            type="text"
            placeholder="Tìm vận động viên hoặc câu lạc bộ..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px 12px 38px",
              border: "1px solid var(--line)",
              borderRadius: 8,
              background: "white",
              fontSize: 13.5,
              color: "var(--ink)",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {["all", "A", "B", "C"].map(tier => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              style={{
                padding: "10px 16px",
                border: "1px solid " + (filterTier === tier ? "var(--ink)" : "var(--line)"),
                borderRadius: 7,
                background: filterTier === tier ? "var(--ink)" : "transparent",
                color: filterTier === tier ? "white" : "var(--ink-2)",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {tier === "all" ? "Tất cả" : `Hạng ${tier}`}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12.5, color: "var(--ink-3)", flexShrink: 0 }}>
          {filtered.length} vận động viên
        </div>
      </div>

      {filtered.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: 14,
        }}>
          {filtered.map(a => <PlayerCard key={a.id} athlete={a} />)}
        </div>
      ) : (
        <div style={{
          padding: "80px 0",
          textAlign: "center",
          color: "var(--ink-3)",
          fontSize: 14,
        }}>
          Không tìm thấy vận động viên phù hợp.
        </div>
      )}
    </div>
  );
}

function PlayerCard({ athlete: a }) {
  const words = a.name.trim().split(/\s+/);
  const initials = words.length >= 2
    ? words[words.length - 2][0] + words[words.length - 1][0]
    : words[0].slice(0, 2);

  const tierMeta = {
    A: { bg: "var(--accent)",              label: "Hạng A" },
    B: { bg: "oklch(0.46 0.14 220)",       label: "Hạng B" },
    C: { bg: "oklch(0.50 0.01 260)",       label: "Hạng C" },
  };
  const tm = a.tier ? (tierMeta[a.tier] || tierMeta.C) : null;

  return (
    <div style={{
      background: "white",
      border: "1px solid var(--line)",
      borderRadius: 10,
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{
          width: 50, height: 50,
          borderRadius: "50%",
          background: "oklch(0.18 0.03 260)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.02em",
          flexShrink: 0,
          textTransform: "uppercase",
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{a.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{a.club}</div>
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingTop: 12,
        borderTop: "1px solid var(--line-2)",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 9.5, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--ink-3)",
          }}>Mã VĐV</div>
          <div className="mono" style={{ fontSize: 12, marginTop: 2 }}>{a.id}</div>
        </div>

        {a.rating && (
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 9.5, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--ink-3)",
            }}>Rating</div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 22, fontWeight: 700,
              lineHeight: 1, marginTop: 2,
              letterSpacing: "-0.01em",
            }}>
              {a.rating.toLocaleString("vi-VN")}
            </div>
          </div>
        )}

        {tm && (
          <span style={{
            background: tm.bg,
            color: "white",
            padding: "4px 9px",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}>
            {tm.label}
          </span>
        )}
      </div>

      <div>
        {a.status === "approved"   && <span className="pill ok">Đã duyệt</span>}
        {a.status === "pending"    && <span className="pill warn">Chờ duyệt</span>}
        {a.status === "incomplete" && <span className="pill" style={{ fontSize: 10.5 }}>Thiếu hồ sơ</span>}
      </div>
    </div>
  );
}

/* ---------------- SPECTATOR SITE (BWF-style) ---------------- */
function SpectatorView() {
  const [tab, setTab] = useS_pub("home");

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--paper)",
      overflowY: "auto",
    }}>
      <SpectatorNav tab={tab} setTab={setTab} />
      <SpectatorHero tab={tab} />

      <div style={{
        padding: "48px 48px 80px",
        maxWidth: 1280,
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
      }}>
        {tab === "home"                          && <PubHome onGoTo={setTab} />}
        {tab === "ranking"                       && <PubRanking />}
        {(tab === "calendar" || tab === "schedule") && <PubSchedule />}
        {tab === "players"                       && <PubPlayers />}
        {tab === "news"                          && <PubNews />}
        {tab === "live"                          && <PubLive />}
        {tab === "results"                       && <PubResults />}
        {tab === "bracket"                       && <BracketView />}
        {tab === "tickets"                       && <PubTickets />}
      </div>

      <footer style={{
        padding: "32px 48px 24px",
        background: "oklch(0.15 0.03 260)",
        color: "oklch(0.60 0.02 260)",
        marginTop: "auto",
      }}>
        <div style={{
          maxWidth: 1184,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 40,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "white" }}>
            <ShuttleMark size={20} />
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              Shuttle<span style={{ color: "var(--accent)" }}>·</span>Ops
            </span>
          </div>
          <div style={{ flex: 1, fontSize: 12 }}>
            Nền tảng quản lý giải cầu lông · dữ liệu thời gian thực · tuân thủ NĐ 13/2023/NĐ-CP
          </div>
          <div style={{ fontSize: 12 }}>BTC · support@shuttleops.vn</div>
        </div>
      </footer>
    </div>
  );
}

function PubLive() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
      }}
    >
      {LIVE_MATCHES.map((m) => (
        <div
          key={m.id}
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="pill live">
              <span className="dot live-dot" />
              LIVE
            </span>
            <span className="caps">
              {CATEGORIES[m.cat]} · {m.round}
            </span>
            <div style={{ flex: 1 }} />
            <span
              className="mono"
              style={{ fontSize: 11, color: "var(--ink-3)" }}
            >
              Sân {m.court} · {m.elapsed}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 14,
              marginTop: 14,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {m.a.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                {m.a.club}
              </div>
              <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600 }}>
                {m.b.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                {m.b.club}
              </div>
            </div>
            <div className="mono" style={{ display: "flex", gap: 4 }}>
              {m.sets.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "6px 10px",
                    borderRadius: 4,
                    background:
                      i === m.current ? "var(--accent)" : "var(--paper-2)",
                    color: i === m.current ? "white" : "var(--ink)",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{s[0]}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{s[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PubSchedule() {
  return (
    <div>
      <div
        style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}
      >
        <button style={{ ...btnPrimary, background: "var(--ink)" }}>
          Hôm nay · 18/04
        </button>
        {[
          "19/04",
          "20/04",
          "21/04",
          "22/04",
          "23/04",
          "24/04",
          "25/04",
          "26/04",
        ].map((d) => (
          <button key={d} style={btnGhost}>
            {d}
          </button>
        ))}
      </div>
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ background: "var(--paper-2)", color: "var(--ink-3)" }}>
              {["Giờ", "Sân", "Hạng", "Vòng", "Đấu", "Trạng thái"].map((h) => (
                <th
                  key={h}
                  className="caps"
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontWeight: 600,
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ...LIVE_MATCHES.map((m) => ({
                ...m,
                status: "live",
                t: m.start,
              })),
              ...UPCOMING,
            ].map((m, i) => (
              <tr key={i}>
                <td
                  className="mono"
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--line-2)",
                  }}
                >
                  {m.t || m.start}
                </td>
                <td
                  className="mono"
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--line-2)",
                  }}
                >
                  Sân {m.court}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--line-2)",
                  }}
                >
                  {CATEGORIES[m.cat]}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--line-2)",
                    color: "var(--ink-2)",
                  }}
                >
                  {m.round}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--line-2)",
                  }}
                >
                  {m.a?.name || m.a}{" "}
                  <span style={{ color: "var(--ink-3)", margin: "0 6px" }}>
                    vs
                  </span>{" "}
                  {m.b?.name || m.b}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--line-2)",
                  }}
                >
                  {m.status === "live" ? (
                    <span className="pill live">
                      <span className="dot live-dot" />
                      LIVE
                    </span>
                  ) : (
                    <span className="pill scheduled">Lên lịch</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PubResults() {
  const rs = [
    {
      d: "17/04",
      cat: "MS",
      w: "Nguyễn Hải Đăng",
      l: "Nguyễn Quang Hưng",
      score: "21-14, 21-19",
      r: "R64",
    },
    {
      d: "17/04",
      cat: "WS",
      w: "Nguyễn Thùy Linh",
      l: "Đặng Thị Mai",
      score: "21-12, 21-15",
      r: "R32",
    },
    {
      d: "17/04",
      cat: "MD",
      w: "Đức / Nam",
      l: "Anh / Long",
      score: "21-18, 19-21, 21-17",
      r: "R32",
    },
    {
      d: "17/04",
      cat: "XD",
      w: "Đức / Khánh",
      l: "Minh / Trang",
      score: "21-12, 21-13",
      r: "R32",
    },
    {
      d: "16/04",
      cat: "MS",
      w: "Lê Đức Phát",
      l: "Vũ Quốc Anh",
      score: "21-10, 21-14",
      r: "R64",
    },
    {
      d: "16/04",
      cat: "WD",
      w: "Linh / Trang",
      l: "Vân Anh / Thảo",
      score: "21-17, 14-21, 21-18",
      r: "R32",
    },
  ];
  return (
    <div
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ background: "var(--paper-2)", color: "var(--ink-3)" }}>
            {["Ngày", "Hạng", "Vòng", "Thắng", "Thua", "Tỷ số"].map((h) => (
              <th
                key={h}
                className="caps"
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontWeight: 600,
                  borderBottom: "1px solid var(--line)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rs.map((r, i) => (
            <tr key={i}>
              <td
                className="mono"
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--line-2)",
                }}
              >
                {r.d}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--line-2)",
                }}
              >
                {CATEGORIES[r.cat]}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--line-2)",
                  color: "var(--ink-2)",
                }}
              >
                {r.r}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--line-2)",
                  fontWeight: 600,
                }}
              >
                {r.w}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--line-2)",
                  color: "var(--ink-3)",
                }}
              >
                {r.l}
              </td>
              <td
                className="mono"
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--line-2)",
                }}
              >
                {r.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PubRanking() {
  return <RankingTable />;
}

function PubNews() {
  const items = [...NEWS, ...NEWS.map((n) => ({ ...n, id: n.id + "_b" }))];
  const [featured, ...rest] = items;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Featured story */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 36,
        alignItems: "start",
      }}>
        {/* Featured image placeholder */}
        <div style={{
          borderRadius: 10,
          overflow: "hidden",
          position: "relative",
          aspectRatio: "16/9",
          background: "oklch(0.14 0.03 260)",
        }}>
          <svg width="100%" height="100%" viewBox="0 0 640 360" fill="none"
            style={{ position: "absolute", inset: 0 }}>
            <rect width="640" height="360" fill="oklch(0.14 0.03 260)"/>
            <rect x="100" y="60" width="440" height="240" stroke="oklch(0.24 0.03 260)" strokeWidth="2" fill="none"/>
            <line x1="320" y1="60" x2="320" y2="300" stroke="oklch(0.22 0.03 260)" strokeWidth="1.5"/>
            <line x1="100" y1="180" x2="540" y2="180" stroke="oklch(0.21 0.03 260)" strokeWidth="1.2"/>
            <line x1="100" y1="116" x2="320" y2="116" stroke="oklch(0.19 0.02 260)" strokeWidth="0.8"/>
            <line x1="320" y1="244" x2="540" y2="244" stroke="oklch(0.19 0.02 260)" strokeWidth="0.8"/>
            <circle cx="320" cy="180" r="36" stroke="oklch(0.20 0.02 260)" strokeWidth="0.8" fill="none"/>
            <line x1="160" y1="60" x2="160" y2="300" stroke="oklch(0.19 0.02 260)" strokeWidth="0.7"/>
            <line x1="480" y1="60" x2="480" y2="300" stroke="oklch(0.19 0.02 260)" strokeWidth="0.7"/>
          </svg>
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            padding: "32px 20px 16px",
            background: "linear-gradient(to top, oklch(0.10 0.03 260 / 0.85), transparent)",
          }}>
            <span className="pill" style={{ fontSize: 10 }}>{featured.tag}</span>
          </div>
        </div>

        {/* Featured text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
          <span className="pill" style={{ alignSelf: "flex-start" }}>{featured.tag}</span>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 34,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            margin: 0,
          }}>
            {featured.title}
          </h2>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            {featured.ts} · Đã xuất bản
          </div>
          <p style={{
            fontSize: 14,
            color: "var(--ink-2)",
            lineHeight: 1.65,
            margin: 0,
            maxWidth: "62ch",
          }}>
            Cặp đôi hạt giống số 2 đã lội ngược dòng thành công sau khi để thua set đầu tiên 19-21,
            vượt qua hai đối thủ trẻ từ Becamex với tỷ số cuối 21-17 trong set thứ ba kéo dài 40 phút.
          </p>
          <button style={{ ...btnGhost, alignSelf: "flex-start", fontSize: 12.5, fontWeight: 600 }}>
            Đọc thêm →
          </button>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--line)" }} />

      {/* News grid */}
      <div>
        <div className="caps" style={{ marginBottom: 16 }}>Tin tức mới nhất</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {rest.map((n) => (
            <div key={n.id} style={{
              background: "white",
              border: "1px solid var(--line)",
              borderRadius: 8,
              overflow: "hidden",
              cursor: "pointer",
            }}>
              <div style={{
                height: 140,
                background: "oklch(0.14 0.03 260)",
                position: "relative",
                overflow: "hidden",
              }}>
                <svg width="100%" height="100%" viewBox="0 0 280 140" fill="none"
                  style={{ position: "absolute", inset: 0 }}>
                  <rect width="280" height="140" fill="oklch(0.14 0.03 260)"/>
                  <line x1="0" y1="0" x2="280" y2="140" stroke="oklch(0.20 0.03 260)" strokeWidth="1"/>
                  <line x1="0" y1="70" x2="280" y2="70" stroke="oklch(0.19 0.02 260)" strokeWidth="0.7"/>
                  <line x1="140" y1="0" x2="140" y2="140" stroke="oklch(0.19 0.02 260)" strokeWidth="0.7"/>
                </svg>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <span className="pill" style={{ fontSize: 10 }}>{n.tag}</span>
                <h4 style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  margin: "8px 0 6px",
                }}>
                  {n.title}
                </h4>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
                  {n.ts}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PubTickets() {
  const tiers = [
    {
      name: "Phổ thông",
      price: 100_000,
      sub: "Khán đài Bắc · không ghế cố định",
      left: "Còn nhiều",
    },
    {
      name: "Ưu tiên",
      price: 250_000,
      sub: "Ghế ngồi gần sân 1-4",
      left: "Còn 120 vé",
    },
    {
      name: "VIP",
      price: 800_000,
      sub: "Ghế hàng đầu · đồ uống · khu check-in",
      left: "Còn 18 vé",
    },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div className="caps">Vé trực tuyến</div>
          <h2 className="serif" style={{ fontSize: 30, margin: "4px 0 0" }}>
            Chọn hạng vé cho ngày thi đấu
          </h2>
        </div>
        {tiers.map((t, i) => (
          <div
            key={t.name}
            style={{
              background: i === 2 ? "var(--ink)" : "var(--paper)",
              color: i === 2 ? "white" : "var(--ink)",
              border: "1px solid " + (i === 2 ? "var(--ink)" : "var(--line)"),
              borderRadius: 8,
              padding: 18,
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 20,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 12.5, opacity: 0.75, marginTop: 3 }}>
                {t.sub}
              </div>
              <div
                className="mono"
                style={{ fontSize: 10.5, opacity: 0.6, marginTop: 4 }}
              >
                {t.left}
              </div>
            </div>
            <div className="serif" style={{ fontSize: 28 }}>
              {money(t.price).replace("\u00A0", " ")}
            </div>
            <button
              style={{
                background: i === 2 ? "var(--accent)" : "var(--ink)",
                color: "white",
                padding: "10px 16px",
                border: 0,
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Mua vé
            </button>
          </div>
        ))}
      </div>
      <aside
        style={{
          background: "var(--paper-2)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: 18,
        }}
      >
        <div className="caps">Phương thức thanh toán</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 10,
          }}
        >
          {["VNPay", "MoMo", "Chuyển khoản", "ZaloPay"].map((p) => (
            <div
              key={p}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 10,
                border: "1px solid var(--line)",
                borderRadius: 6,
                background: "var(--paper)",
                fontSize: 12.5,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 24,
                  background: "var(--paper-3)",
                  borderRadius: 3,
                }}
              />
              {p}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 11,
            color: "var(--ink-3)",
            lineHeight: 1.5,
          }}
        >
          Sau khi thanh toán thành công, vé điện tử (QR) sẽ được gửi qua email
          và tin nhắn. Quét mã tại cổng để vào khán đài.
        </div>
      </aside>
    </div>
  );
}

window.AthleteView = AthleteView;
window.SpectatorView = SpectatorView;
