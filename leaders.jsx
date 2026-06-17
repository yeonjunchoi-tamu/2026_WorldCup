/* 기록실 — 선수 누적 기록 순위 (득점 · 도움 · 공격포인트 · 경기수) */

// ── 모든 상세 경기에서 선수 기록 집계 ──
function buildPlayerStats() {
  const map = {};
  const get = (name, code) => {
    const k = code + "|" + name;
    if (!map[k]) map[k] = { name, code, goals: 0, assists: 0, matches: 0, _ms: {} };
    return map[k];
  };
  WC.MATCHES.forEach((m) => {
    const d = WC_DETAIL[m.id];
    if (!d) return;
    const mark = (name, code) => { get(name, code)._ms[m.id] = 1; };
    (d.lineup && d.lineup.home || []).forEach((p) => mark(p.name, m.home));
    (d.lineup && d.lineup.away || []).forEach((p) => mark(p.name, m.away));
    (d.subs && d.subs.home || []).forEach((s) => mark(s.on, m.home));
    (d.subs && d.subs.away || []).forEach((s) => mark(s.on, m.away));
    (d.timeline || []).forEach((e) => {
      if (e.type !== "goal") return;
      const code = m[e.team];
      if (!e.og) get(e.player, code).goals += 1;            // 자책골은 득점에서 제외
      const mt = e.detail && e.detail.match(/·\s*(.+?)\s*어시스트/);
      if (mt) {
        let an = mt[1].trim();
        const ci = an.lastIndexOf(", ");                    // "헤더, 선수명" → 쉼표 뒤 실제 이름만
        if (ci !== -1) an = an.slice(ci + 2).trim();
        get(an, code).assists += 1;
      }
    });
  });
  return Object.values(map).map((p) => {
    p.matches = Object.keys(p._ms).length;
    p.points = p.goals + p.assists;
    delete p._ms;
    return p;
  });
}

const LEAD_CATS = [
  { key: "goals", label: "득점", unit: "골" },
  { key: "assists", label: "도움", unit: "도움" },
  { key: "points", label: "공격포인트", unit: "P" },
  { key: "matches", label: "경기수", unit: "경기" },
];

function LeaderRow({ p, rank, cat, max, unit }) {
  const t = WC.T[p.code];
  const col = t.c1;
  const pct = max ? Math.max((p[cat] / max) * 100, 4) : 4;
  return (
    <div className="lb-row">
      <span className={"lb-rank" + (rank <= 3 ? " top r" + rank : "")}>{rank}</span>
      <TeamBadge code={p.code} size={26} />
      <div className="lb-info">
        <span className="lb-name">{p.name}</span>
        <span className="lb-break">
          <span style={{ color: "var(--tx2)" }}>{t.ko}</span>
          <span className="lb-dot">·</span>{p.goals}골
          <span className="lb-dot">·</span>{p.assists}도움
          <span className="lb-dot">·</span>{p.matches}경기
        </span>
      </div>
      <div className="lb-track">
        <div className="lb-bar" style={{ width: pct + "%", background: col, color: txtOn(col) }} />
      </div>
      <span className="lb-val">{p[cat]}<small>{unit}</small></span>
    </div>
  );
}

function LeadersView() {
  const [cat, setCat] = useState(() => localStorage.getItem("wc_leadcat") || "goals");
  const setC = (k) => { setCat(k); localStorage.setItem("wc_leadcat", k); };
  const all = useMemo(() => buildPlayerStats(), []);
  const meta = LEAD_CATS.find((c) => c.key === cat) || LEAD_CATS[0];

  const ranked = useMemo(() => {
    return all.filter((p) => p[cat] > 0).sort((a, b) =>
      b[cat] - a[cat] || b.points - a.points || b.goals - a.goals || a.name.localeCompare(b.name, "ko")
    ).slice(0, 20);
  }, [all, cat]);

  // 동률 순위 (공동 순위 부여)
  let lastVal = null, lastRank = 0;
  const rows = ranked.map((p, i) => {
    const rank = p[cat] === lastVal ? lastRank : i + 1;
    lastVal = p[cat]; lastRank = rank;
    return { p, rank };
  });
  const max = ranked.length ? ranked[0][cat] : 1;
  const top = ranked[0];

  return (
    <div className="fade-in">
      <div className="sec-head">
        <span className="lbl">PLAYERS</span>
        <h2>기록실</h2>
        <span style={{ fontSize: 12.5, color: "var(--tx3)" }}>진행된 경기 기준 선수 누적 기록 · 항목을 선택해 순위 확인</span>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
        <div className="seg">
          {LEAD_CATS.map((c) => (
            <button key={c.key} className={cat === c.key ? "on" : ""} onClick={() => setC(c.key)}>{c.label}</button>
          ))}
        </div>
        <div className="spacer" />
        <span style={{ fontSize: 11.5, color: "var(--tx3)", fontFamily: "var(--mono)" }}>상위 {rows.length}명 · {meta.label} 순</span>
      </div>

      {top ? (
        <div className="lb-lead">
          <TeamBadge code={top.code} size={48} />
          <div className="lb-lead-info">
            <div className="lb-lead-name">{top.name}</div>
            <div className="lb-lead-team">{WC.T[top.code].ko}</div>
          </div>
          <div className="lb-lead-stat">
            <div className="lb-lead-tag">{meta.label} 1위</div>
            <div className="lb-lead-big">{top[cat]}<small>{meta.unit}</small></div>
          </div>
        </div>
      ) : null}

      <div className="card card-pad lb-board">
        {rows.length ? rows.map(({ p, rank }, i) => (
          <LeaderRow key={cat + "|" + p.code + "|" + p.name} p={p} rank={rank} cat={cat} max={max} unit={meta.unit} />
        )) : (
          <div style={{ padding: "30px 0", textAlign: "center", color: "var(--tx3)", fontSize: 13 }}>기록이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { LeadersView, buildPlayerStats });
