/* 조별리그 뷰 */

function StandingsTable({ g }) {
  const rows = WC.STANDINGS[g];
  const qcolor = ["var(--win)", "var(--blue)", "var(--gold)"];
  return (
    <table className="standings">
      <thead>
        <tr>
          <th className="tl">팀</th>
          <th>경기</th><th>승</th><th>무</th><th>패</th><th>득실</th><th>최근</th><th>승점</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const qcls = i === 0 ? "q1" : i === 1 ? "q2" : i === 2 ? "q3" : "";
          return (
            <tr key={r.team} className={qcls}>
              <td className="tl">
                <span className="qbar" style={{ background: i < 3 ? qcolor[i] : "transparent" }} />
                <TeamBadge code={r.team} size={22} />
                <span style={{ marginLeft: 8, fontFamily: "var(--sans)", fontWeight: 650, color: "var(--tx)", fontSize: 13 }}>{WC.T[r.team].ko}</span>
              </td>
              <td>{r.P}</td><td>{r.W}</td><td>{r.D}</td><td>{r.L}</td>
              <td style={{ color: r.GD > 0 ? "var(--win)" : r.GD < 0 ? "var(--loss)" : "var(--tx3)" }}>
                {r.GD > 0 ? "+" : ""}{r.GD}
              </td>
              <td><FormDots code={r.team} group={g} /></td>
              <td className="pts">{r.Pts}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function GroupCard({ g, onMatch, expanded, onToggle }) {
  const ms = WC.groupMatches(g);
  const played = ms.filter((m) => m.st === "FT" || m.st === "LIVE");
  const shown = expanded ? ms : [...played, ...ms.filter((m) => m.st === "UP")].slice(0, 4);
  return (
    <div className="card group-card fade-in">
      <div className="gc-head">
        <div className="group-letter">{g}</div>
        <div>
          <div style={{ fontWeight: 750, fontSize: 14 }}>{g}조</div>
          <div style={{ fontSize: 11, color: "var(--tx3)" }}>{WC.GROUPS[g].map((c) => WC.T[c].ko).join(" · ")}</div>
        </div>
        <div className="gc-meta">{played.length}/6 경기</div>
      </div>
      <div className="card-pad" style={{ paddingBottom: 8 }}>
        <StandingsTable g={g} />
      </div>
      <div style={{ borderTop: "1px solid var(--line-soft)", padding: "8px 10px" }}>
        <div className="subhdr" style={{ margin: "4px 6px 6px" }}>경기 일정 · 결과 <span style={{ color: "var(--tx3)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>· 내 시간대 {TZ_ABBR}</span></div>
        {shown.map((m) => <MatchRow key={m.id} m={m} onClick={onMatch} />)}
        {ms.length > shown.length || expanded ? (
          <button className="chip" style={{ margin: "8px 6px 4px", width: "calc(100% - 12px)", justifyContent: "center" }} onClick={() => onToggle(g)}>
            {expanded ? "접기" : `전체 6경기 보기`}
            <Icon name={expanded ? "chev" : "chevD"} size={13} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function GroupsView({ onMatch }) {
  const [exp, setExp] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const toggle = (g) => setExp(exp === g ? null : g);
  const groups = Object.keys(WC.GROUPS);
  const list = filter === "ALL" ? groups : [filter];
  return (
    <div className="fade-in">
      <div className="sec-head">
        <span className="lbl">STAGE 01</span>
        <h2>조별리그</h2>
        <span style={{ fontSize: 12.5, color: "var(--tx3)" }}>48개국 · 12개조 · 상위 2팀 + 3위 8팀 32강 진출</span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
        <div className="seg" style={{ flexWrap: "wrap" }}>
          <button className={filter === "ALL" ? "on" : ""} onClick={() => setFilter("ALL")}>전체</button>
          {groups.map((g) => <button key={g} className={filter === g ? "on" : ""} onClick={() => setFilter(g)}>{g}</button>)}
        </div>
        <div className="spacer" />
        <div className="legend">
          <span><i style={{ background: "var(--win)" }} />조 1위</span>
          <span><i style={{ background: "var(--blue)" }} />조 2위</span>
          <span><i style={{ background: "var(--gold)" }} />3위(8팀 진출)</span>
        </div>
      </div>

      <div className="group-grid">
        {list.map((g) => <GroupCard key={g} g={g} onMatch={onMatch} expanded={exp === g || filter === g} onToggle={toggle} />)}
      </div>
    </div>
  );
}

Object.assign(window, { GroupsView, StandingsTable, GroupCard });
