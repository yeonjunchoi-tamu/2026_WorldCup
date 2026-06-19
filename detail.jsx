/* 우측 슬라이드 경기 상세 패널 */

// ── 모멘텀 차트 ──
function Momentum({ data }) {
  const w = 600,h = 96,mid = h / 2;
  const n = data.length;
  const step = w / (n - 1);
  const pts = data.map((v, i) => [i * step, mid - v / 100 * (mid - 6)]);
  const line = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const areaUp = `M0,${mid} ` + pts.map((p) => `L${p[0].toFixed(1)},${Math.min(p[1], mid).toFixed(1)}`).join(" ") + ` L${w},${mid} Z`;
  const areaDn = `M0,${mid} ` + pts.map((p) => `L${p[0].toFixed(1)},${Math.max(p[1], mid).toFixed(1)}`).join(" ") + ` L${w},${mid} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <clipPath id="up"><rect x="0" y="0" width={w} height={mid} /></clipPath>
        <clipPath id="dn"><rect x="0" y={mid} width={w} height={mid} /></clipPath>
      </defs>
      <path d={areaUp} fill="var(--blue)" opacity="0.18" clipPath="url(#up)" />
      <path d={areaDn} fill="var(--tx3)" opacity="0.16" clipPath="url(#dn)" />
      <line x1="0" y1={mid} x2={w} y2={mid} stroke="var(--line)" strokeDasharray="4 4" />
      <path d={line} fill="none" stroke="var(--blue-bright)" strokeWidth="2" clipPath="url(#up)" />
      <path d={line} fill="none" stroke="var(--tx3)" strokeWidth="2" clipPath="url(#dn)" />
    </svg>);

}

// ── 득점자 목록 (헤더용) ──
function ScorerList({ detail, team }) {
  const goals = detail.timeline.filter((e) => e.type === "goal" && e.team === team);
  return (
    <div className={"scorer-col " + team}>
      {goals.map((g, i) =>
      <div key={i} className="scorer-row">
          <span className="sc-ball">⚽</span>
          <span>{surname(g.player)}{g.og ? <span className="sc-tag"> (OG)</span> : null}{g.pen ? <span className="sc-tag"> (PK)</span> : null} <span className="mono">{g.disp || g.min + "'"}</span></span>
        </div>
      )}
    </div>);

}

// ── 성(姓) 표기: 네덜란드/독일식 접두어(van, de, von…) 포함 ──
function surname(name) {
  const parts = name.split(" ");
  const particles = ["van", "de", "der", "den", "von", "dos", "da", "di", "del", "della", "ten", "ter", "te"];
  for (let i = 1; i < parts.length; i++) {
    if (particles.includes(parts[i].toLowerCase())) return parts.slice(i).join(" ");
  }
  return parts[parts.length - 1];
}

// ── 포메이션 피치 ──
function PlayerToken({ p, color, subMin }) {
  // 경기 표시 색으로 채움, 밝은 색이면 어두운 글자
  const txt = txtOn(color);
  const isKo = /[\uAC00-\uD7A3]/.test(p.name);
  const display = isKo ? p.name : surname(p.name);
  return (
    <div className="pp" style={{ left: p.x + "%", top: p.y + "%" }}>
      <div className="pp-dot" style={{ background: color, color: txt }}>
        <span className="pp-num">{p.n}</span>
        {p.rating != null && <span className={"pp-rt" + (p.motm ? " motm" : "")} style={{ background: ratingBg(p.rating) }}>{p.rating.toFixed(1)}</span>}
        {p.goal ? <span className="pp-badge pp-goal">⚽{p.goal > 1 ? p.goal : ""}</span> : null}
        {p.red ? <span className="pp-badge pp-red" /> : p.yellow ? <span className="pp-badge pp-yel" /> : null}
        {subMin != null && <span className="pp-badge pp-sub">↓</span>}
      </div>
      <span className="pp-name"><b>{p.n}</b> {display}{p.c ? <span className="pp-capn"> (C)</span> : null}</span>
    </div>);

}

function Pitch({ detail, homeCode, awayCode }) {
  const offMap = (side) => {
    const m = {};
    (detail.subs[side] || []).forEach((s) => {m[s.off] = s.min;});
    return m;
  };
  const col = matchColors(detail, homeCode, awayCode);
  return (
    <div className="pitch-pair">
      <SoloPitch players={detail.lineup.home} color={col.home} off={offMap("home")} code={homeCode} formation={detail.formation.home} />
      <SoloPitch players={detail.lineup.away} color={col.away} off={offMap("away")} code={awayCode} formation={detail.formation.away} />
    </div>);

}

function SoloPitch({ players, color, off, code, formation }) {
  const t = WC.T[code];
  return (
    <div className="solo-pitch">
      <div className="sp-label">
        <TeamBadge code={code} size={20} />
        <b>{t.ko}</b>
        <span className="sp-form">{formation}</span>
      </div>
      <div className="pitch pitch-h">
        <div className="pline pl-mid" />
        <div className="pline pl-circle" />
        <div className="pline pl-spot" />
        <div className="pline pl-boxL" />
        <div className="pline pl-boxR" />
        {players.map((p, i) =>
        <PlayerToken key={i} p={p} color={color} subMin={off[p.name]} />
        )}
      </div>
    </div>);

}

// ── 라인업 리스트 (한 팀) ──
function LineupList({ lineup, bench, subs, manager, code }) {
  const t = WC.T[code];
  return (
    <div>
      <div className="mgr">
        <Icon name="whistle" size={15} />
        <span style={{ color: "var(--tx3)" }}>감독</span>
        <b style={{ marginLeft: "auto" }}>{manager}</b>
      </div>
      <div className="subhdr">선발 라인업</div>
      <div className="lu-list">
        {lineup.map((p, i) =>
        <div key={i} className="lu-row">
            <span className="num">{p.n}</span>
            <span style={{ fontWeight: 600 }}>
              {p.name}
              {p.c ? <span className="mono" style={{ color: "var(--gold)", fontSize: 9, marginLeft: 5 }}>(C)</span> : null}
              {p.motm ? <span style={{ color: "var(--gold)", marginLeft: 5, fontSize: 11 }}>★</span> : null}
              {p.goal ? <span style={{ marginLeft: 5 }}>{"⚽".repeat(p.goal)}</span> : null}
              {p.yellow ? <span style={{ display: "inline-block", width: 7, height: 10, background: "var(--gold)", borderRadius: 1, marginLeft: 5, verticalAlign: "middle" }} /> : null}
              {p.red ? <span style={{ display: "inline-block", width: 7, height: 10, background: "var(--loss)", borderRadius: 1, marginLeft: 5, verticalAlign: "middle" }} /> : null}
              {p.sub ? <span style={{ color: "var(--loss)", fontSize: 10, marginLeft: 5 }}>▼</span> : null}
            </span>
            <span className="rt-pill" style={{ background: ratingBg(p.rating) }}>{p.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="subhdr">교체</div>
      {subs.length ? subs.map((s, i) =>
      <div key={i} className="lu-row" style={{ gridTemplateColumns: "1fr auto" }}>
          <span style={{ fontSize: 12.5 }}>
            <span className="mono" style={{ color: "var(--tx3)" }}>{s.min}'</span>
            <span style={{ color: "var(--win)", margin: "0 4px" }}>▲</span>{s.on}
            {s.onCard === "red" ? <span style={{ display: "inline-block", width: 6, height: 9, background: "var(--loss)", borderRadius: 1, margin: "0 0 0 4px", verticalAlign: "middle" }} /> : s.onCard === "yellow" ? <span style={{ display: "inline-block", width: 6, height: 9, background: "var(--gold)", borderRadius: 1, margin: "0 0 0 4px", verticalAlign: "middle" }} /> : null}
            <span style={{ color: "var(--tx3)", margin: "0 6px" }}>·</span>
            <span style={{ color: "var(--loss)" }}>▼</span> {s.off}
          </span>
          {s.onRating != null && <span className="rt-pill mono" style={{ background: ratingBg(s.onRating), fontSize: 10 }}>{s.onRating.toFixed(1)}</span>}
        </div>
      ) : <div style={{ fontSize: 12, color: "var(--tx3)", padding: "4px 7px" }}>교체 없음</div>}
      <div className="subhdr">벤치</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {bench.map((p, i) =>
        <span key={i} className="chip" style={{ fontSize: 11 }}>
            <span className="mono" style={{ color: "var(--tx3)" }}>{p.n}</span> {p.name}
          </span>
        )}
      </div>
    </div>);

}

// ── 탭별 내용 ──
function TabSummary({ m, detail }) {
  const goals = detail.timeline.filter((e) => e.type === "goal");
  const reds = detail.timeline.filter((e) => e.type === "red");
  const sumCol = matchColors(detail, m.home, m.away);
  const yellows = detail.timeline.filter((e) => e.type === "yellow");
  // MOTM
  let motm = detail.motm;
  const motmCode = motm ? m[motm.team] : null;
  // 베스트 평점 Top3 (양 팀 통합)
  const allPlayers = [
  ...detail.lineup.home.map((p) => ({ ...p, code: m.home })),
  ...detail.lineup.away.map((p) => ({ ...p, code: m.away }))].
  sort((a, b) => b.rating - a.rating).slice(0, 3);
  // xG
  const xg = (detail.statGroups ? detail.statGroups[0].stats : detail.stats).find((s) => /xG|기대/.test(s.label));
  const xgTot = xg ? xg.h + xg.a : 0;
  const poss = (detail.statGroups ? detail.statGroups[0].stats : detail.stats).find((s) => /점유/.test(s.label));

  return (
    <div>
      {/* 경기 정보 바 */}
      <div className="match-info-bar">
        {detail.venueFull && <span><Icon name="pin" size={13} />{detail.venueFull}</span>}
        {detail.attendance && <span><Icon name="group" size={13} />관중 {detail.attendance}</span>}
        {detail.referee && <span><Icon name="whistle" size={13} />{detail.referee}</span>}
      </div>

      {/* 결과 한 줄 요약 */}
      {detail.summaryText &&
      <div className="summary-lead">{detail.summaryText}</div>
      }

      {/* MOTM 하이라이트 */}
      {motm &&
      <div className="motm-banner" style={{ marginBottom: 16 }}>
          <span className="motm-badge">★ MOTM</span>
          <TeamBadge code={motmCode} size={28} />
          <div style={{ lineHeight: 1.2 }}>
            <b style={{ fontSize: 14.5 }}>{motm.name}</b>
            <div style={{ fontSize: 11, color: "var(--tx3)" }}>{WC.T[motmCode].ko}</div>
          </div>
          <span className="rt-pill mono" style={{ background: ratingBg(motm.rating), marginLeft: "auto", fontSize: 15, padding: "4px 10px" }}>{motm.rating.toFixed(1)}</span>
        </div>
      }

      {/* xG 비교 게이지 */}
      {xg &&
      <div className="card card-pad" style={{ marginBottom: 18, padding: "15px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
            <span style={{ fontSize: 11, color: "var(--tx3)", fontFamily: "var(--mono)", letterSpacing: ".5px" }}>기대득점 (xG)</span>
            <span style={{ fontSize: 11, color: "var(--tx3)" }}>실제 {m.hg} · {m.ag}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <b className="mono" style={{ fontSize: xg.h >= xg.a ? 22 : 16, fontWeight: xg.h >= xg.a ? 800 : 600, color: xg.h > xg.a ? "var(--tx)" : "var(--tx3)", minWidth: 44 }}>{xg.h.toFixed(2)}</b>
            <div style={{ flex: 1, display: "flex", gap: 3, height: 10 }}>
              <div style={{ width: (xgTot ? xg.h / xgTot * 100 : 50) + "%", background: sumCol.home, borderRadius: 5 }} />
              <div style={{ width: (xgTot ? xg.a / xgTot * 100 : 50) + "%", background: sumCol.away, borderRadius: 5 }} />
            </div>
            <b className="mono" style={{ fontSize: xg.a >= xg.h ? 22 : 16, fontWeight: xg.a >= xg.h ? 800 : 600, color: xg.a > xg.h ? "var(--tx)" : "var(--tx3)", minWidth: 44, textAlign: "right" }}>{xg.a.toFixed(2)}</b>
          </div>
        </div>
      }

      <div className="subhdr" style={{ marginTop: 0 }}>득점</div>
      {goals.length ? goals.map((g, i) =>
      <div key={i} className={"tl-ev " + (g.team === "away" ? "away" : "")} style={{ padding: "7px 0", borderBottom: "1px solid var(--line-soft)" }}>
          <span className="tl-ic goal">⚽</span>
          <div>
            <div style={{ fontWeight: 650, fontSize: 13 }}>{g.player} <span className="mono" style={{ color: "var(--tx3)", fontSize: 11 }}>{g.disp || g.min + "'"}</span></div>
            {g.detail && <div className="tl-det">{g.detail}</div>}
          </div>
        </div>
      ) : <div style={{ fontSize: 12, color: "var(--tx3)" }}>득점 없음</div>}

      {/* 카드 요약 */}
      {(reds.length > 0 || yellows.length > 0) &&
      <div className="card-summary">
          {reds.length > 0 && <span><i className="cs-card red" />퇴장 {reds.length}</span>}
          {yellows.length > 0 && <span><i className="cs-card yel" />경고 {yellows.length}</span>}
          <span style={{ color: "var(--tx3)", marginLeft: "auto", fontSize: 11 }}>
            {reds.map((r) => surname(r.player)).join(", ")}
            {reds.length > 0 ? " 퇴장" : ""}
          </span>
        </div>
      }

      {/* 베스트 평점 Top3 */}
      <div className="subhdr">베스트 평점</div>
      <div className="top-perf">
        {allPlayers.map((p, i) =>
        <div key={i} className="tp-card">
            <span className="tp-rank">{i + 1}</span>
            <TeamBadge code={p.code} size={24} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 650, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}{p.motm ? <span style={{ color: "var(--gold)", marginLeft: 3 }}>★</span> : null}</div>
              <div style={{ fontSize: 10.5, color: "var(--tx3)" }}>{p.pos}{p.goal ? " · " + "⚽".repeat(p.goal) : ""}</div>
            </div>
            <span className="rt-pill mono" style={{ background: ratingBg(p.rating), fontSize: 12, padding: "3px 7px" }}>{p.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="subhdr">핵심 기록</div>
      <div className="stat-tiles">
        {detail.stats.slice(0, 4).map((s, i) => {
          const hBig = s.h > s.a,aBig = s.a > s.h;
          const fh = (s.dec ? s.h.toFixed(2) : s.h) + (s.unit || "");
          const fa = (s.dec ? s.a.toFixed(2) : s.a) + (s.unit || "");
          return (
            <div key={i} className="tile">
              <div className="k">{s.label}</div>
              <div className="v">
                <span className={hBig ? "big" : "small"}>{fh}</span>
                <span className="mid"> vs </span>
                <span className={aBig ? "big" : "small"}>{fa}</span>
              </div>
            </div>);

        })}
      </div>
    </div>);

}

function TabLineup({ m, detail }) {
  const avg = (side) => {
    const lu = detail.lineup[side];
    return (lu.reduce((s, p) => s + (p.rating || 0), 0) / lu.length).toFixed(1);
  };
  const trH = detail.teamRating && detail.teamRating.home || avg("home");
  const trA = detail.teamRating && detail.teamRating.away || avg("away");
  const luCol = matchColors(detail, m.home, m.away);
  return (
    <div>
      {/* 팀 헤더바: 평점 · 국기 · 팀명 · 포메이션 */}
      <div className="lu-teamhead">
        <div className="lu-th-side">
          <span className="lu-th-rt" style={{ background: ratingBg(+trH) }}>{(+trH).toFixed(1)}</span>
          <TeamBadge code={m.home} size={22} />
          <b>{WC.T[m.home].ko}</b>
          <span className="lu-th-form">{detail.formation.home}</span>
        </div>
        <div className="lu-th-side rev">
          <span className="lu-th-rt" style={{ background: ratingBg(+trA) }}>{(+trA).toFixed(1)}</span>
          <TeamBadge code={m.away} size={22} />
          <b>{WC.T[m.away].ko}</b>
          <span className="lu-th-form">{detail.formation.away}</span>
        </div>
      </div>
      <Pitch detail={detail} homeCode={m.home} awayCode={m.away} />
      {/* 범례 */}
      <div className="pitch-legend">
        <span><i className="lg-dot" style={{ background: luCol.home }} />{WC.T[m.home].ko} (홈)</span>
        <span><i className="lg-dot" style={{ background: luCol.away }} />{WC.T[m.away].ko} (원정)</span>
        <span><i className="lg-card" style={{ background: "var(--loss)" }} />퇴장</span>
        <span><i className="lg-card" style={{ background: "var(--gold)" }} />경고</span>
        <span>↓ 교체 아웃</span>
        <span style={{ color: "var(--gold)" }}>★ MOTM</span>
        <span>C 주장</span>
      </div>
      <div className="lu-cols" style={{ marginTop: 18 }}>
        <LineupList lineup={detail.lineup.home} bench={detail.bench.home} subs={detail.subs.home} manager={detail.managers.home} code={m.home} />
        <LineupList lineup={detail.lineup.away} bench={detail.bench.away} subs={detail.subs.away} manager={detail.managers.away} code={m.away} />
      </div>
    </div>);

}

function StatRow({ s, hc, ac }) {
  const tot = s.h + s.a;
  const hp = tot ? s.h / tot * 100 : 50;
  const ap = tot ? s.a / tot * 100 : 50;
  const fmt = (v) => s.dec ? v.toFixed(2) : v;
  const hWin = s.h > s.a,aWin = s.a > s.h;
  const hTxt = fmt(s.h) + (s.hSub ? " (" + s.hSub + ")" : "") + (s.unit || "");
  const aTxt = fmt(s.a) + (s.aSub ? " (" + s.aSub + ")" : "") + (s.unit || "");
  if (s.bar) {
    return (
      <div className="stat-bar" style={{ marginBottom: 16 }}>
        <div className="sb-lbl" style={{ margin: "0 0 6px", fontWeight: 600, color: "var(--tx2)" }}>{s.label}</div>
        <div className="sb-split">
          <div className="sb-seg h" style={{ width: hp + "%", background: hc, color: txtOn(hc) }}>{hTxt}</div>
          <div className="sb-seg a" style={{ width: ap + "%", background: ac, color: txtOn(ac) }}>{aTxt}</div>
        </div>
      </div>);

  }
  return (
    <div className="stat-row">
      <span className={"sv" + (hWin ? " lead" : "")} style={hWin ? { background: hc, color: txtOn(hc) } : null}>{hTxt}</span>
      <span className="sv-mid">{s.label}</span>
      <span className={"sv" + (aWin ? " lead" : "")} style={aWin ? { background: ac, color: txtOn(ac) } : null}>{aTxt}</span>
    </div>);

}

function TabStats({ m, detail }) {
  const col = matchColors(detail, m.home, m.away);
  const hc = col.home,ac = col.away;
  const groups = detail.statGroups || [{ title: "주요 통계", stats: detail.stats }];
  return (
    <div>
      <div className="stat-teamrow">
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}><TeamBadge code={m.home} size={22} /><b>{WC.T[m.home].ko}</b></span>
        <div className="stat-keylegend">
          <span><i style={{ background: hc }} />{WC.T[m.home].ko}</span>
          <span><i style={{ background: ac }} />{WC.T[m.away].ko}</span>
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}><b>{WC.T[m.away].ko}</b><TeamBadge code={m.away} size={22} /></span>
      </div>
      {groups.map((g, gi) =>
      <div key={gi} className="stat-group">
          <div className="stat-group-title">{g.title}</div>
          {g.stats.map((s, i) => <StatRow key={i} s={s} hc={hc} ac={ac} />)}
        </div>
      )}
    </div>);

}

function TabTimeline({ m, detail }) {
  const icon = { goal: "⚽", yellow: "🟨", red: "🟥", sub: "⇄", var: "▣" };
  return (
    <div className="tl">
      {detail.timeline.slice().reverse().map((e, i) =>
      <div key={i} className="tl-row">
          <div className={"tl-ev " + (e.team === "home" ? "" : "away")} style={{ visibility: e.team === "home" ? "visible" : "hidden", gridColumn: e.team === "home" ? "1" : "1" }}>
            {e.team === "home" && <><span className={"tl-ic " + e.type}>{icon[e.type]}</span><div><div style={{ fontWeight: 650 }}>{e.player}</div>{e.detail && <div className="tl-det">{e.detail}</div>}</div></>}
          </div>
          <div className="tl-min">{e.disp || e.min + "'"}</div>
          <div className={"tl-ev away"} style={{ visibility: e.team === "away" ? "visible" : "hidden" }}>
            {e.team === "away" && <><span className={"tl-ic " + e.type}>{icon[e.type]}</span><div><div style={{ fontWeight: 650 }}>{e.player}</div>{e.detail && <div className="tl-det">{e.detail}</div>}</div></>}
          </div>
        </div>
      )}
    </div>);

}

function TabRatings({ m, detail }) {
  const rows = [
  ["home", m.home, detail.lineup.home],
  ["away", m.away, detail.lineup.away]];

  // 공식 MOTM 1명: motm 지정값 우선, 없으면 motm 플래그, 없으면 전체 최고 평점
  let motm = detail.motm || null;
  if (!motm) {
    const flagged = [...detail.lineup.home, ...detail.lineup.away].find((p) => p.motm);
    if (flagged) motm = { name: flagged.name, rating: flagged.rating, team: detail.lineup.home.includes(flagged) ? "home" : "away" };else
    {
      const all = [...detail.lineup.home.map((p) => ({ ...p, team: "home" })), ...detail.lineup.away.map((p) => ({ ...p, team: "away" }))].sort((a, b) => b.rating - a.rating);
      motm = all[0] ? { name: all[0].name, rating: all[0].rating, team: all[0].team } : null;
    }
  }
  const motmCode = motm ? m[motm.team] : null;
  return (
    <div>
      {motm &&
      <div className="motm-banner">
          <span className="motm-badge">★ 맨 오브 더 매치</span>
          <TeamBadge code={motmCode} size={26} />
          <b style={{ fontSize: 15 }}>{motm.name}</b>
          <span className="rt-pill mono" style={{ background: ratingBg(motm.rating), marginLeft: "auto", fontSize: 14, padding: "3px 9px" }}>{motm.rating.toFixed(1)}</span>
        </div>
      }
      {rows.map(([side, code, lu]) => {
        const sorted = [...lu].sort((a, b) => b.rating - a.rating);
        const avg = (lu.reduce((s, p) => s + p.rating, 0) / lu.length).toFixed(1);
        return (
          <div key={side} style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <TeamBadge code={code} size={22} /><b>{WC.T[code].ko}</b>
              <span className="chip" style={{ marginLeft: "auto", fontSize: 10.5 }}>팀 평균 {avg}</span>
            </div>
            {sorted.map((p, i) =>
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
                <span className="num mono" style={{ width: 20, color: "var(--tx3)", fontSize: 11, textAlign: "center" }}>{p.n}</span>
                <span style={{ width: 96, fontSize: 12.5, fontWeight: 600 }}>{p.name}{p.motm ? <span style={{ color: "var(--gold)", marginLeft: 4 }}>★</span> : null}</span>
                <div style={{ flex: 1, height: 6, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: Math.max(4, Math.min(100, (p.rating - 3) / 7 * 100)) + "%", height: "100%", background: ratingBg(p.rating), borderRadius: 4 }} />
                </div>
                <span className="rt-pill mono" style={{ background: ratingBg(p.rating), minWidth: 30, textAlign: "center" }}>{p.rating.toFixed(1)}</span>
              </div>
            )}
          </div>);

      })}
    </div>);

}

// 슬롯(1A·W97 등) → 실제 팀 코드 or null
function slotTeam(sl) {
  if (window.bxResolveSlot) return bxResolveSlot(sl);
  return WC.T[sl] ? sl : null;
}
// 녹아웃 라운드명
function koRound(m) {
  const n = +m.id.slice(1);
  if (n >= 73 && n <= 88) return "32강";
  if (n >= 89 && n <= 96) return "16강";
  if (n >= 97 && n <= 100) return "8강";
  if (n >= 101 && n <= 102) return "4강";
  if (n === 103) return "3·4위전";
  if (n === 104) return "결승";
  return m.id;
}
// 스코어라인 팀 헤드 (조별=실제 팀 / 녹아웃=확정 시 팀, 아니면 슬롯 라벨)
function PslTeamHead({ sl }) {
  const code = slotTeam(sl);
  if (code) {
    return (
      <div className="psl-team">
        <TeamBadge code={code} size={52} />
        <span className="nm">{WC.T[code].ko}</span>
      </div>
    );
  }
  const { txt, sub } = slotLabel(sl);
  return (
    <div className="psl-team">
      <span className="badge-flag" style={{ width: 52, height: 52, display: "grid", placeItems: "center", background: "var(--surface2)", border: "1px dashed var(--line)" }}>
        <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: "var(--blue-bright)" }}>{sub}</span>
      </span>
      <span className="nm dim" style={{ color: "var(--tx2)" }}>{txt}</span>
    </div>
  );
}

function MatchDetailPanel({ m, onClose }) {
  const [tab, setTab] = useState("summary");
  const detail = m && m.st !== "UP" ? WC_DETAIL[m.id] : null;
  useEffect(() => {setTab("summary");}, [m && m.id]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const show = !!m;
  const live = m && m.st === "LIVE",up = m && m.st === "UP";
  const isKo = m && m.stage === "ko";
  const stageLabel = m ? (m.stage === "group" ? `${m.group}조 · ${m.md}차전` : `${koRound(m)} · ${m.id}`) : "";

  const tabs = detail ? [["summary", "요약"], ["lineup", "라인업"], ["stats", "통계"], ["timeline", "타임라인"], ["ratings", "평점"]] : [];

  return (
    <>
      <div className={"scrim" + (show ? " show" : "")} style={{ pointerEvents: show ? "auto" : "none" }} onClick={onClose} />
      <aside className={"panel" + (show ? " show" : "")} aria-hidden={!show}>
        {m &&
        <>
            <div className="panel-head">
              <div className="panel-top">
                <span className="chip" style={{ fontSize: 11 }}>{stageLabel}</span>
                {live && <span className="live-chip" style={{ padding: "4px 10px" }}><span className="live-dot" />LIVE {m.min}</span>}
                <span className="meta" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="pin" size={13} />{m.venName}
                </span>
                <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32 }}><Icon name="close" size={18} /></button>
              </div>
              <div className="panel-scoreline">
                <PslTeamHead sl={m.home} />
                <div style={{ textAlign: "center" }}>
                  {up ?
                (isKo ?
                <div>
                      <div className="mono" style={{ fontSize: 13, color: "var(--tx3)" }}>{m.date} · {m.venName}</div>
                      <div className="psl-score" style={{ fontSize: 22 }}>대진 미정</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--blue-bright)" }}>진출 팀 확정 후 자동 업데이트</div>
                    </div> :
                <div>
                      <div className="mono" style={{ fontSize: 13, color: "var(--tx3)" }}>{dayLabel(m.dt)} · {locDate(m.dt)}</div>
                      <div className="psl-score" style={{ fontSize: 28 }}>{locTime(m.dt)}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--blue-bright)" }}>예정 · 내 시간대 ({TZ_ABBR})</div>
                    </div>) :

                <div>
                      <div className="psl-score">{m.hg}<span className="x">:</span>{m.ag}</div>
                      <div className="mono" style={{ fontSize: 11, color: live ? "var(--live)" : "var(--tx3)" }}>{live ? "진행 중" : "경기 종료"}</div>
                    </div>
                }
                </div>
                <PslTeamHead sl={m.away} />
              </div>
              {detail && !up && (() => {
                const hg = detail.timeline.filter((e) => e.type === "goal" && e.team === "home");
                const ag = detail.timeline.filter((e) => e.type === "goal" && e.team === "away");
                if (!hg.length && !ag.length) return null;
                return (
                  <div className="psl-scorers">
                    <ScorerList detail={detail} team="home" />
                    <div className="psl-scorers-mid"><Icon name="ball" size={13} /></div>
                    <ScorerList detail={detail} team="away" />
                  </div>
                );
              })()}
              {detail &&
            <div className="tabs">
                  {tabs.map(([k, l]) => <button key={k} className={"tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}</button>)}
                </div>
            }
            </div>
            <div className="panel-body">
              {!detail ?
            <div className="preview-empty">
                  <div style={{ display: "grid", placeItems: "center", marginBottom: 16 }}><Icon name="cal" size={40} /></div>
                  <div className="big">{isKo ? "대진 확정 전" : up ? "경기 예정" : "상세 데이터 준비 중"}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    {isKo ? <>{koRound(m)} · {m.date} · {m.venName}<br /><b style={{ color: "var(--tx2)" }}>{slotLabel(m.home).txt}</b> 와(과) <b style={{ color: "var(--tx2)" }}>{slotLabel(m.away).txt}</b> 의 대결<br />조별리그와 이전 토너먼트 라운드가 끝나면 진출 팀이 자동으로 채워집니다.</>
                      : up ? <>킥오프: {dayLabel(m.dt)} {locDate(m.dt)} {locTime(m.dt)} <span style={{ color: "var(--tx2)" }}>(내 시간대 {TZ_ABBR})</span> · {m.venName}<br />라인업은 경기 시작 약 1시간 전 공개됩니다.</> : "이 경기의 상세 기록은 곧 제공됩니다."}
                  </div>
                  {m.note && <div style={{ marginTop: 14 }}><span className="chip blue">{m.note} 경기</span></div>}
                </div> :

            <div className="fade-in" key={tab}>
                  {tab === "summary" && <TabSummary m={m} detail={detail} />}
                  {tab === "lineup" && <TabLineup m={m} detail={detail} />}
                  {tab === "stats" && <TabStats m={m} detail={detail} />}
                  {tab === "timeline" && <TabTimeline m={m} detail={detail} />}
                  {tab === "ratings" && <TabRatings m={m} detail={detail} />}
                </div>
            }
            </div>
          </>
        }
      </aside>
    </>);

}

Object.assign(window, { MatchDetailPanel });