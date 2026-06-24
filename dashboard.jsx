/* 홈 대시보드 — 3가지 레이아웃 시안 (중계형 / 데이터 그리드형 / 에디토리얼형) */

function useDashData() {
  return useMemo(() => {
    const live = WC.MATCHES.filter((m) => m.st === "LIVE");
    const ft = WC.MATCHES.filter((m) => m.st === "FT").sort((a, b) => b.dt - a.dt);
    const upAll = WC.MATCHES.filter((m) => m.st === "UP").sort((a, b) => a.dt - b.dt);
    const upNext = upAll.slice(0, 12);
    const played = ft.length + live.length;
    const goals = [...ft, ...live].reduce((s, m) => s + m.hg + m.ag, 0);
    const leaders = Object.keys(WC.GROUPS).map((g) => ({ g, ...WC.STANDINGS[g][0] }));
    const feat = ft[0] || live[0]; // 가장 최근 종료 경기
    return { live, ft, upNext, upAll, played, goals, leaders, feat };
  }, []);
}

// 큰 피처 카드 (중계형 히어로)
function FeatHero({ m, onMatch }) {
  if (!m) return null;
  const live = m.st === "LIVE";
  return (
    <div className="hero-feat fade-in" onClick={() => onMatch(m)} style={{ cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, position: "relative" }}>
        <span className="eyebrow">최근 종료 · {m.stage === "group" ? `${m.group}조 ${m.md}차전` : "토너먼트"}</span>
        {live ? <span className="live-chip" style={{ padding: "4px 10px" }}><span className="live-dot" />LIVE {m.min}</span>
          : <span className="chip">{m.st === "FT" ? "FULL TIME" : "예정"}</span>}
        <span className="meta mono" style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--tx3)", display: "flex", gap: 6, alignItems: "center" }}>
          <Icon name="pin" size={13} />{m.venName}
        </span>
      </div>
      <div className="hero-vs">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <TeamBadge code={m.home} size={68} />
          <span style={{ fontWeight: 750, fontSize: 17 }}>{WC.T[m.home].ko}</span>
        </div>
        <div style={{ textAlign: "center" }}>
          {m.st === "UP"
            ? <><div className="mono" style={{ color: "var(--tx3)", fontSize: 14 }}>{dayLabel(m.dt)} {locDate(m.dt)}</div><div className="hero-score" style={{ fontSize: 40 }}>{locTime(m.dt)}</div></>
            : <div className="hero-score" style={{ color: live ? "var(--live)" : "var(--tx)" }}>{m.hg}<span style={{ color: "var(--tx3)", margin: "0 8px" }}>:</span>{m.ag}</div>}
          <button className="chip blue" style={{ marginTop: 14 }}>경기 상세 보기 <Icon name="chev" size={13} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <TeamBadge code={m.away} size={68} />
          <span style={{ fontWeight: 750, fontSize: 17 }}>{WC.T[m.away].ko}</span>
        </div>
      </div>
    </div>
  );
}

function ResultRail({ matches, onMatch }) {
  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
      {matches.map((m) => (
        <div key={m.id} className="card" style={{ minWidth: 215, padding: 14, cursor: "pointer" }} onClick={() => onMatch(m)}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--tx3)" }} className="mono">
            <span>{m.group}조</span><span>{m.st === "LIVE" ? <span style={{ color: "var(--live)" }}>{m.min}</span> : locDate(m.dt)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {[["home", m.hg], ["away", m.ag]].map(([s, g]) => {
              const code = m[s], win = s === "home" ? m.hg > m.ag : m.ag > m.hg;
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <TeamBadge code={code} size={24} />
                  <span style={{ fontWeight: win ? 750 : 600, fontSize: 13.5, flex: 1, color: win ? "var(--tx)" : "var(--tx2)" }}>{WC.T[code].ko}</span>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 16 }}>{g}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LeadersList({ leaders, onGroup }) {
  return (
    <div className="leaders">
      {leaders.map((l) => (
        <div key={l.g} className="leader-row" onClick={() => onGroup && onGroup(l.g)} style={{ cursor: onGroup ? "pointer" : "default" }}>
          <span className="gl">{l.g}조</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TeamBadge code={l.team} size={22} />
            <span style={{ fontWeight: 650 }}>{WC.T[l.team].ko}</span>
          </div>
          <span className="mono tnum" style={{ color: "var(--tx3)", fontSize: 12 }}>
            {l.P > 0 ? <><b style={{ color: "var(--tx)" }}>{l.Pts}</b>점 · {l.GD > 0 ? "+" : ""}{l.GD}</> : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* 날짜별 그룹 경기 목록 (사용자 로컬 날짜 기준) */
function GroupedFixtures({ matches, onMatch }) {
  const groups = [];
  let cur = null;
  matches.forEach((m) => {
    const k = dayKey(m.dt);
    if (!cur || cur.k !== k) { cur = { k, label: dayLabel(m.dt), items: [] }; groups.push(cur); }
    cur.items.push(m);
  });
  return (
    <div>
      {groups.map((g) => (
        <div key={g.k}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 8px 5px" }}>
            <span style={{ fontWeight: 750, fontSize: 13 }}>{g.label}</span>
            <span style={{ flex: 1, height: 1, background: "var(--line-soft)" }} />
            <span className="mono" style={{ fontSize: 10.5, color: "var(--tx3)" }}>{g.items.length}경기</span>
          </div>
          {g.items.map((m) => <MatchRow key={m.id} m={m} onClick={onMatch} />)}
        </div>
      ))}
    </div>
  );
}

/* ───── 시안 A: 중계형 ───── */
function LayoutBroadcast({ d, onMatch, onGroup }) {
  return (
    <div className="col-stack fade-in">
      <FeatHero m={d.feat} onMatch={onMatch} />
      <div>
        <div className="sec-head"><span className="lbl">RESULTS</span><h2>최근 결과</h2></div>
        <ResultRail matches={[...d.live, ...d.ft]} onMatch={onMatch} />
      </div>
      <div className="dash-grid">
        <div className="card">
          <div className="card-pad" style={{ paddingBottom: 4 }}><div className="sec-head" style={{ margin: 0 }}><span className="lbl">FIXTURES</span><h2>다가오는 경기</h2><span className="statline" style={{ color: "var(--tx3)" }}>내 시간대 · {TZ_ABBR}</span></div></div>
          <div style={{ padding: "0 8px 12px" }}><GroupedFixtures matches={d.upNext} onMatch={onMatch} /></div>
        </div>
        <div className="card card-pad">
          <div className="sec-head" style={{ margin: "0 0 10px" }}><span className="lbl">LEADERS</span><h2>조별 선두</h2></div>
          <LeadersList leaders={d.leaders} onGroup={onGroup} />
        </div>
      </div>
    </div>
  );
}

/* ───── 시안 B: 데이터 그리드형 ───── */
function LayoutData({ d, onMatch, onGroup }) {
  const avg = d.played ? (d.goals / d.played).toFixed(2) : "0";
  return (
    <div className="col-stack fade-in">
      <div className="stat-tiles">
        {[["진행 경기", d.played, "/ 104"], ["총 득점", d.goals, "골"], ["경기당 평균", avg, "골"], ["진행 중", d.live.length, "LIVE"]].map((t, i) => (
          <div key={i} className="tile">
            <div className="k">{t[0]}</div>
            <div className="v" style={i === 3 && d.live.length ? { color: "var(--live)" } : null}>{t[1]} <small>{t[2]}</small></div>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div className="card card-pad">
          <div className="sec-head" style={{ margin: "0 0 10px" }}><span className="lbl">12 GROUPS</span><h2>조별 순위 현황</h2></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 18px" }}>
            <LeadersList leaders={d.leaders.slice(0, 6)} onGroup={onGroup} />
            <LeadersList leaders={d.leaders.slice(6)} onGroup={onGroup} />
          </div>
        </div>
        <div className="col-stack">
          <div className="card card-pad">
            <div className="sec-head" style={{ margin: "0 0 8px" }}><span className="lbl">LATEST</span><h2>최근 결과</h2></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{[...d.live, ...d.ft].map((m) => <MatchRow key={m.id} m={m} onClick={onMatch} />)}</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-pad" style={{ paddingBottom: 6 }}><div className="sec-head" style={{ margin: 0 }}><span className="lbl">NEXT UP</span><h2>다가오는 경기</h2></div></div>
        <div style={{ padding: "0 8px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>{d.upNext.map((m) => <MatchRow key={m.id} m={m} onClick={onMatch} />)}</div>
      </div>
    </div>
  );
}

/* ───── 시안 C: 에디토리얼형 ───── */
function LayoutEditorial({ d, onMatch, onGroup }) {
  const f = d.feat;
  return (
    <div className="fade-in">
      <div style={{ padding: "16px 0 30px", borderBottom: "1px solid var(--line-soft)", marginBottom: 26 }}>
        <span className="eyebrow">2026 · 06 · 13 — 매치데이 3</span>
        <div className="editorial-lead" style={{ marginTop: 14 }}>
          북중미 대륙이 <em>48개국</em>의 첫 라운드로 <em>달아오른다</em>.
        </div>
        <p style={{ color: "var(--tx2)", maxWidth: "52ch", fontSize: 14.5, lineHeight: 1.7, marginTop: 14 }}>
          개최국 멕시코가 아즈테카에서 산뜻하게 출발했고, 손흥민의 대한민국은 체코를 제압했다.
          미국은 발로건의 멀티골로 파라과이를 4-1로 침몰시키며 홈 무대 신고식을 마쳤다.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <span className="chip">경기 {d.played}/104</span>
          <span className="chip">총 {d.goals}골</span>
          {d.live.length ? <span className="chip blue"><span className="live-dot" style={{ background: "var(--blue-bright)" }} />{d.live.length}경기 진행 중</span> : null}
        </div>
      </div>

      <div className="dash-grid">
        <div className="col-stack">
          {f && (
            <div className="card" style={{ overflow: "hidden", cursor: "pointer" }} onClick={() => onMatch(f)}>
              <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--line-soft)" }}>
                <span className="eyebrow">오늘의 경기</span>
                <div className="hero-vs" style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><TeamBadge code={f.home} size={56} /><b>{WC.T[f.home].ko}</b></div>
                  <div className="hero-score" style={{ fontSize: 46, textAlign: "center" }}>{f.st === "UP" ? f.time : <>{f.hg}<span style={{ color: "var(--tx3)" }}>:</span>{f.ag}</>}</div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><TeamBadge code={f.away} size={56} /><b>{WC.T[f.away].ko}</b></div>
                </div>
              </div>
              <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="statline">{f.venName}</span>
                <span className="chip blue">상세 보기 <Icon name="chev" size={12} /></span>
              </div>
            </div>
          )}
          <div className="card card-pad">
            <div className="sec-head" style={{ margin: "0 0 8px" }}><span className="lbl">RESULTS</span><h2>전체 결과</h2></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{[...d.live, ...d.ft].map((m) => <MatchRow key={m.id} m={m} onClick={onMatch} />)}</div>
          </div>
        </div>
        <div className="col-stack">
          <div className="card card-pad">
            <div className="sec-head" style={{ margin: "0 0 8px" }}><span className="lbl">LEADERS</span><h2>조별 선두</h2></div>
            <LeadersList leaders={d.leaders} onGroup={onGroup} />
          </div>
          <div className="card card-pad">
            <div className="sec-head" style={{ margin: "0 0 8px" }}><span className="lbl">NEXT</span><h2>다음 경기</h2></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{d.upNext.slice(0, 5).map((m) => <MatchRow key={m.id} m={m} onClick={onMatch} />)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onMatch, onGroup }) {
  const d = useDashData();
  return (
    <div>
      <div className="sec-head" style={{ alignItems: "center", flexWrap: "wrap" }}>
        <span className="lbl">DASHBOARD</span>
        <h2>대시보드</h2>
        <div className="spacer" />
        <span className="statline">{todayLabel()}</span>
      </div>
      <LayoutBroadcast d={d} onMatch={onMatch} onGroup={onGroup} />
    </div>
  );
}

Object.assign(window, { Dashboard });
