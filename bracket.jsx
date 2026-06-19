/* 토너먼트 브래킷 뷰 — 연결선이 있는 토너먼트 트리 */

// 녹아웃 경기는 MATCHES가 아닌 WC.BRACKET에만 존재 → 거기서 조회
function bxFind(id) {
  const B = WC.BRACKET;
  for (const rd of [B.R32, B.R16, B.QF, B.SF, B.TP, B.FN]) {
    const f = rd.find((m) => m.id === id);
    if (f) return f;
  }
  return null;
}

// 슬롯 → 실제 팀 코드 해석 (조별리그/녹아웃 종료 시 자동 확정)
function bxResolveSlot(sl) {
  if (!sl) return null;
  if (WC.T[sl]) return sl;                                  // 이미 팀
  if ((sl[0] === "1" || sl[0] === "2") && WC.GROUPS[sl[1]]) {
    const g = sl[1];
    const done = WC.groupMatches(g).every((m) => m.st === "FT");
    if (done) {
      const st = WC.computeStandings(g);
      return st[sl[0] === "1" ? 0 : 1].team;
    }
  }
  if (sl[0] === "W") {
    const fm = bxFind("M" + sl.slice(1));
    if (fm && fm.st === "FT" && WC.T[fm.home] && WC.T[fm.away]) {
      if (fm.hg > fm.ag) return fm.home;
      if (fm.ag > fm.hg) return fm.away;
    }
  }
  return null;
}

function BSlot({ sl }) {
  const team = bxResolveSlot(sl);
  if (team) {
    return (
      <div className="bx-slot">
        <TeamBadge code={team} size={18} />
        <span className="bx-nm">{WC.T[team].ko}</span>
      </div>
    );
  }
  const { txt, sub } = slotLabel(sl);
  return (
    <div className="bx-slot">
      <span className="bx-sub">{sub}</span>
      <span className="bx-nm dim">{txt}</span>
    </div>
  );
}

function BBox({ m, onMatch }) {
  const done = m.st === "FT";
  return (
    <button className={"bx-box" + (done ? " win" : "")} onClick={() => onMatch(m)}>
      <span className="bx-id">{m.id}</span>
      <BSlot sl={m.home} />
      <div className="bx-div" />
      <BSlot sl={m.away} />
    </button>
  );
}

// 연결선: 좌측 트리(자식이 왼쪽)는 25%/75%에서 들어와 50%로 나감, 우측은 거울
function BConn({ side }) {
  return (
    <div className="brn-conn">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          vectorEffect="non-scaling-stroke"
          d={side === "l"
            ? "M0,25 H55 M0,75 H55 M55,25 V75 M55,50 H100"
            : "M100,25 H45 M100,75 H45 M45,25 V75 M45,50 H0"}
        />
      </svg>
    </div>
  );
}

// 한 경기를 루트로, 그 피더(승자 출처) 경기를 재귀적으로 배치
function BNode({ m, side, onMatch }) {
  const feeders = [m.home, m.away].map((s) => (s && s[0] === "W") ? bxFind("M" + s.slice(1)) : null);
  if (!feeders[0] || !feeders[1]) {
    return <div className="brn leaf"><BBox m={m} onMatch={onMatch} /></div>;
  }
  const kids = (
    <div className="brn-kids">
      <BNode m={feeders[0]} side={side} onMatch={onMatch} />
      <BNode m={feeders[1]} side={side} onMatch={onMatch} />
    </div>
  );
  const self = <div className="brn-self"><BBox m={m} onMatch={onMatch} /></div>;
  return (
    <div className="brn">
      {side === "l"
        ? <>{kids}<BConn side="l" />{self}</>
        : <>{self}<BConn side="r" />{kids}</>}
    </div>
  );
}

function BHead({ cols }) {
  return (
    <div className="bx-head">
      {cols.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className="g" />}
          <div className="h"><div className="rd">{c.rd}</div><div className="dt">{c.dt}</div></div>
        </React.Fragment>
      ))}
    </div>
  );
}

function BracketView({ onMatch }) {
  const B = WC.BRACKET;
  const headL = [
    { rd: "32강", dt: "6.28–7.3" }, { rd: "16강", dt: "7.4–7.7" },
    { rd: "8강", dt: "7.9–7.11" }, { rd: "4강", dt: "7.14" },
  ];
  const headR = [
    { rd: "4강", dt: "7.15" }, { rd: "8강", dt: "7.10–7.11" },
    { rd: "16강", dt: "7.5–7.7" }, { rd: "32강", dt: "6.30–7.3" },
  ];

  return (
    <div className="fade-in">
      <div className="sec-head">
        <span className="lbl">STAGE 02</span>
        <h2>토너먼트</h2>
        <span style={{ fontSize: 12.5, color: "var(--tx3)" }}>32강 → 결승 · 단판 토너먼트 (연장·승부차기)</span>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <span className="chip blue">대진은 조별리그 종료(6.27) 후 확정</span>
        <span className="chip">1위·2위 24팀 + 3위 8팀</span>
        <div className="spacer" />
        <span className="statline">← 좌우로 스크롤 · 연결선으로 진출 경로 확인 →</span>
      </div>

      <div className="bx-scroll">
        <div className="bx">
          {/* 좌측 절반: 4강(M101)에서 32강으로 펼침 */}
          <div className="bx-half">
            <BHead cols={headL} />
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <BNode m={B.SF[0]} side="l" onMatch={onMatch} />
            </div>
          </div>

          {/* 중앙 결승 기둥 */}
          <div className="bx-center">
            <div className="trophy">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1a1206"><path d="M6 4h12v3a5 5 0 01-2 4l-1 1v2h2v2H7v-2h2v-2l-1-1a5 5 0 01-2-4V4zM4 5h2v2a3 3 0 01-2-2zm14 0h2a3 3 0 01-2 2V5zM8 18h8v2H8z" /></svg>
            </div>
            <div className="br-col-head" style={{ color: "var(--gold)", fontSize: 12 }}>결승</div>
            <div style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 8 }}>7.19 · 뉴욕·뉴저지</div>
            <div className="bx-final-row">
              <span className="bx-stub" />
              <BBox m={B.FN[0]} onMatch={onMatch} />
              <span className="bx-stub" />
            </div>
            <div style={{ marginTop: 16, padding: "9px 10px 11px", background: "var(--surface2)", borderRadius: 11, textAlign: "center", width: "100%", boxSizing: "border-box" }}>
              <div className="br-col-head" style={{ fontSize: 9.5, marginBottom: 0 }}>3·4위전</div>
              <div style={{ fontSize: 10.5, color: "var(--tx3)", marginBottom: 7 }}>7.18 · 마이애미</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <BBox m={B.TP[0]} onMatch={onMatch} />
              </div>
            </div>
          </div>

          {/* 우측 절반: 4강(M102)에서 32강으로 펼침 (거울) */}
          <div className="bx-half">
            <BHead cols={headR} />
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <BNode m={B.SF[1]} side="r" onMatch={onMatch} />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="subhdr" style={{ marginTop: 0 }}>대진 표기 읽는 법</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, fontSize: 12.5, color: "var(--tx2)" }}>
          <div><b className="mono" style={{ color: "var(--blue-bright)" }}>1A</b> — A조 1위</div>
          <div><b className="mono" style={{ color: "var(--blue-bright)" }}>2B</b> — B조 2위</div>
          <div><b className="mono" style={{ color: "var(--blue-bright)" }}>3위</b> — 해당 조 중 3위 진출팀</div>
          <div><b className="mono" style={{ color: "var(--blue-bright)" }}>M74</b> — 74경기 승자 진출</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--tx3)", marginTop: 10 }}>
          조별리그가 끝나면 각 칸이 실제 진출 팀 국기로 자동 채워집니다. 경기 박스를 누르면 상세로 이동합니다.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BracketView, bxResolveSlot });
