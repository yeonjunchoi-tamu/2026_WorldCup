/* 토너먼트 브래킷 뷰 */

function BrSlot({ sl }) {
  const { txt, sub } = slotLabel(sl);
  const isTeam = WC.T[sl];
  return (
    <div className="br-slot">
      <span className="sl">{sub}</span>
      <span style={{ fontWeight: 600, color: "var(--tx2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {isTeam ? WC.T[sl].ko : txt}
      </span>
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--tx3)" }}>—</span>
    </div>
  );
}

function BrMatch({ m, onMatch }) {
  return (
    <div className="br-match" onClick={() => onMatch(m)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="br-tag">{m.id}</span>
        <span className="br-tag">{m.date} · {m.venName}</span>
      </div>
      <BrSlot sl={m.home} />
      <BrSlot sl={m.away} />
    </div>
  );
}

function BrCol({ title, sub, matches, onMatch }) {
  return (
    <div className="br-col">
      <div className="br-col-head">{title}<div style={{ color: "var(--tx3)", opacity: .6, marginTop: 2 }}>{sub}</div></div>
      {matches.map((m) => <BrMatch key={m.id} m={m} onMatch={onMatch} />)}
    </div>
  );
}

function BracketView({ onMatch }) {
  const B = WC.BRACKET;
  // 좌/우 반쪽으로 나눠 결승이 가운데 오도록
  const r32L = B.R32.slice(0, 8), r32R = B.R32.slice(8);
  const r16L = B.R16.slice(0, 4), r16R = B.R16.slice(4);
  const qfL = B.QF.slice(0, 2), qfR = B.QF.slice(2);
  const sfL = [B.SF[0]], sfR = [B.SF[1]];

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
        <span className="statline">← 좌우로 스크롤하여 전체 대진 확인 →</span>
      </div>

      <div className="bracket-scroll">
        <div className="bracket">
          <BrCol title="32강" sub="6.28–7.3" matches={r32L} onMatch={onMatch} />
          <BrCol title="16강" sub="7.4–7.7" matches={r16L} onMatch={onMatch} />
          <BrCol title="8강" sub="7.9–7.11" matches={qfL} onMatch={onMatch} />
          <BrCol title="4강" sub="7.14" matches={sfL} onMatch={onMatch} />

          {/* 결승 기둥 */}
          <div className="br-col br-final" style={{ minWidth: 230 }}>
            <div className="trophy">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1a1206"><path d="M6 4h12v3a5 5 0 01-2 4l-1 1v2h2v2H7v-2h2v-2l-1-1a5 5 0 01-2-4V4zM4 5h2v2a3 3 0 01-2-2zm14 0h2a3 3 0 01-2 2V5zM8 18h8v2H8z" /></svg>
            </div>
            <div className="br-col-head" style={{ color: "var(--gold)" }}>결승</div>
            <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--tx3)", marginBottom: 8 }}>7.19 · 뉴욕·뉴저지</div>
            <BrMatch m={B.FN[0]} onMatch={onMatch} />
            <div style={{ marginTop: 14, padding: "10px", background: "var(--surface2)", borderRadius: 10, textAlign: "center" }}>
              <div className="br-col-head" style={{ fontSize: 9.5 }}>3·4위전</div>
              <div style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 6 }}>7.18 · 마이애미</div>
              <BrMatch m={B.TP[0]} onMatch={onMatch} />
            </div>
          </div>

          <BrCol title="4강" sub="7.15" matches={sfR} onMatch={onMatch} />
          <BrCol title="8강" sub="7.10–7.11" matches={qfR} onMatch={onMatch} />
          <BrCol title="16강" sub="7.5–7.7" matches={r16R} onMatch={onMatch} />
          <BrCol title="32강" sub="6.30–7.3" matches={r32R} onMatch={onMatch} />
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div className="subhdr" style={{ marginTop: 0 }}>대진 표기 읽는 법</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, fontSize: 12.5, color: "var(--tx2)" }}>
          <div><b className="mono" style={{ color: "var(--blue-bright)" }}>1A</b> — A조 1위</div>
          <div><b className="mono" style={{ color: "var(--blue-bright)" }}>2B</b> — B조 2위</div>
          <div><b className="mono" style={{ color: "var(--blue-bright)" }}>3RD</b> — 해당 조 중 3위 진출팀</div>
          <div><b className="mono" style={{ color: "var(--blue-bright)" }}>W74</b> — 74경기 승자</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BracketView });
