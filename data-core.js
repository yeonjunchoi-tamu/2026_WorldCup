/* 2026 북중미 월드컵 — 코어 데이터
   실제 본선 조 편성(2025.12.5 워싱턴 DC 최종 추첨)과 공식 토너먼트 대진 구조 기준.
   진행된 경기 결과는 실제(6/11~6/13) 반영, 이후는 일정(예정)으로 표기. */
(function () {
  // ── 팀 사전: code(FIFA 3자), ko(한국어), c1(주색), c2(보조색), dark(어두운 글자 필요) ──
  const T = {
    MEX: { ko: "멕시코", c1: "#006847", c2: "#ce1126" },
    RSA: { ko: "남아공", c1: "#007749", c2: "#ffb81c" },
    KOR: { ko: "대한민국", c1: "#cd2e3a", c2: "#0047a0" },
    CZE: { ko: "체코", c1: "#11457e", c2: "#d7141a" },
    CAN: { ko: "캐나다", c1: "#d52b1e", c2: "#ffffff" },
    BIH: { ko: "보스니아", c1: "#002395", c2: "#ffd200" },
    QAT: { ko: "카타르", c1: "#8a1538", c2: "#ffffff" },
    SUI: { ko: "스위스", c1: "#d52b1e", c2: "#ffffff" },
    BRA: { ko: "브라질", c1: "#ffdf00", c2: "#009b3a", dark: true },
    MAR: { ko: "모로코", c1: "#c1272d", c2: "#006233" },
    HAI: { ko: "아이티", c1: "#00209f", c2: "#d21034" },
    SCO: { ko: "스코틀랜드", c1: "#005eb8", c2: "#ffffff" },
    USA: { ko: "미국", c1: "#0a3161", c2: "#b31942" },
    PAR: { ko: "파라과이", c1: "#d52b1e", c2: "#0038a8" },
    AUS: { ko: "호주", c1: "#ffcd00", c2: "#00843d", dark: true },
    TUR: { ko: "튀르키예", c1: "#e30a17", c2: "#ffffff" },
    GER: { ko: "독일", c1: "#1a1a1a", c2: "#dd0000" },
    CUW: { ko: "퀴라소", c1: "#00247d", c2: "#fbd116" },
    CIV: { ko: "코트디부아르", c1: "#ff8200", c2: "#009e60", dark: true },
    ECU: { ko: "에콰도르", c1: "#ffd100", c2: "#0033a0", dark: true },
    NED: { ko: "네덜란드", c1: "#ec7016", c2: "#21468b" },
    JPN: { ko: "일본", c1: "#0a2463", c2: "#bc002d" },
    SWE: { ko: "스웨덴", c1: "#006aa7", c2: "#fecc00" },
    TUN: { ko: "튀니지", c1: "#e70013", c2: "#ffffff" },
    BEL: { ko: "벨기에", c1: "#e30613", c2: "#ffd700" },
    EGY: { ko: "이집트", c1: "#ce1126", c2: "#000000" },
    IRN: { ko: "이란", c1: "#239f40", c2: "#da0000" },
    NZL: { ko: "뉴질랜드", c1: "#1a1a1a", c2: "#ffffff" },
    ESP: { ko: "스페인", c1: "#c60b1e", c2: "#ffc400" },
    CPV: { ko: "카보베르데", c1: "#003893", c2: "#cf2027" },
    KSA: { ko: "사우디아라비아", c1: "#006c35", c2: "#ffffff" },
    URU: { ko: "우루과이", c1: "#6cace4", c2: "#001489", dark: true },
    FRA: { ko: "프랑스", c1: "#002395", c2: "#ed2939" },
    SEN: { ko: "세네갈", c1: "#00853f", c2: "#fdef42" },
    IRQ: { ko: "이라크", c1: "#ce1126", c2: "#007a3d" },
    NOR: { ko: "노르웨이", c1: "#ba0c2f", c2: "#00205b" },
    ARG: { ko: "아르헨티나", c1: "#75aadb", c2: "#ffffff", dark: true },
    ALG: { ko: "알제리", c1: "#006233", c2: "#d21034" },
    AUT: { ko: "오스트리아", c1: "#ed2939", c2: "#ffffff" },
    JOR: { ko: "요르단", c1: "#007a3d", c2: "#ce1126" },
    POR: { ko: "포르투갈", c1: "#1f7a3d", c2: "#c5142a" },
    COD: { ko: "DR콩고", c1: "#007fff", c2: "#f7d618", dark: true },
    UZB: { ko: "우즈베키스탄", c1: "#1eb53a", c2: "#0099b5" },
    COL: { ko: "콜롬비아", c1: "#fcd116", c2: "#003893", dark: true },
    ENG: { ko: "잉글랜드", c1: "#0e1c4e", c2: "#cf0a2c" },
    CRO: { ko: "크로아티아", c1: "#d10000", c2: "#0093dd" },
    GHA: { ko: "가나", c1: "#006b3f", c2: "#fcd116" },
    PAN: { ko: "파나마", c1: "#005293", c2: "#d21034" },
  };
  Object.keys(T).forEach((k) => (T[k].code = k));

  // ── 조 편성 (T1=조 헤드 순서, 실제 추첨 결과) ──
  const GROUPS = {
    A: ["MEX", "RSA", "KOR", "CZE"],
    B: ["CAN", "BIH", "QAT", "SUI"],
    C: ["BRA", "MAR", "HAI", "SCO"],
    D: ["USA", "PAR", "AUS", "TUR"],
    E: ["GER", "CUW", "CIV", "ECU"],
    F: ["NED", "JPN", "SWE", "TUN"],
    G: ["BEL", "EGY", "IRN", "NZL"],
    H: ["ESP", "CPV", "KSA", "URU"],
    I: ["FRA", "SEN", "IRQ", "NOR"],
    J: ["ARG", "ALG", "AUT", "JOR"],
    K: ["POR", "COD", "UZB", "COL"],
    L: ["ENG", "CRO", "GHA", "PAN"],
  };

  // 경기장 (도시)
  const VEN = {
    azteca: "멕시코시티 · 아즈테카", guad: "과달라하라", mty: "몬테레이",
    sofi: "로스앤젤레스 · SoFi", levis: "샌프란시스코 베이", lumen: "시애틀",
    att: "댈러스", nrg: "휴스턴", arrow: "캔자스시티", mbs: "애틀랜타",
    hard: "마이애미", mtlf: "뉴욕·뉴저지", linc: "필라델피아", gil: "보스턴",
    mb: "토론토 · BMO", bc: "밴쿠버 · BC플레이스",
  };

  // 매치데이 일정 템플릿: 각 조 [t0,t1,t2,t3]
  // MD1: 0v1, 2v3 / MD2: 0v2, 3v1 / MD3: 3v0, 1v2
  const MD = [
    [[0, 1], [2, 3]],
    [[0, 2], [3, 1]],
    [[3, 0], [1, 2]],
  ];

  // 실제 일정/결과 오버라이드 (시간 = CST 중부시간 기준). key = "G-md-idx"
  // st: FT(종료)/UP(예정). hg/ag 점수.
  const OV = {
    // 종료된 경기
    "A-0-0": { st: "FT", hg: 2, ag: 0, date: "6.11", time: "14:00", ven: "azteca", note: "개막전" },
    "A-0-1": { st: "FT", hg: 2, ag: 1, date: "6.11", time: "21:00", ven: "guad" },
    "B-0-0": { st: "FT", hg: 1, ag: 1, date: "6.12", time: "14:00", ven: "mb" },
    "D-0-0": { st: "FT", hg: 4, ag: 1, date: "6.12", time: "20:00", ven: "sofi" },
    // 6.13 (오늘)
    "B-0-1": { st: "FT", hg: 1, ag: 1, date: "6.13", time: "14:00", ven: "levis" },
    "C-0-0": { st: "FT", hg: 1, ag: 1, date: "6.13", time: "17:00", ven: "mtlf", note: "주목" },
    "C-0-1": { st: "FT", hg: 0, ag: 1, date: "6.13", time: "20:00", ven: "gil" },
    "D-0-1": { st: "FT", hg: 2, ag: 0, date: "6.13", time: "23:00", ven: "bc" },
    // 6.14
    "E-0-0": { st: "FT", hg: 7, ag: 1, date: "6.14", time: "12:00", ven: "nrg" },
    "F-0-0": { st: "FT", hg: 2, ag: 2, date: "6.14", time: "15:00", ven: "att" },
    "E-0-1": { st: "FT", hg: 1, ag: 0, date: "6.14", time: "18:00", ven: "linc" },
    "F-0-1": { st: "FT", hg: 5, ag: 1, date: "6.14", time: "21:00", ven: "mty" },
    // 6.15
    "H-0-0": { st: "FT", hg: 0, ag: 0, date: "6.15", time: "11:00", ven: "mbs" },
    "G-0-0": { st: "FT", hg: 1, ag: 1, date: "6.15", time: "14:00", ven: "lumen" },
    "H-0-1": { st: "FT", hg: 1, ag: 1, date: "6.15", time: "17:00", ven: "hard" },
    "G-0-1": { st: "FT", hg: 2, ag: 2, date: "6.15", time: "20:00", ven: "sofi" },
    // 6.16
    "I-0-0": { st: "FT", hg: 3, ag: 1, date: "6.16", time: "14:00", ven: "mtlf" },
    "I-0-1": { st: "FT", hg: 1, ag: 4, date: "6.16", time: "17:00", ven: "gil" },
    "J-0-0": { st: "FT", hg: 3, ag: 0, date: "6.16", time: "20:00", ven: "arrow", note: "주목" },
    "J-0-1": { st: "FT", hg: 3, ag: 1, date: "6.16", time: "23:00", ven: "levis" },
    // 6.17
    "K-0-0": { st: "FT", hg: 1, ag: 1, date: "6.17", time: "12:00", ven: "nrg" },
    "L-0-0": { st: "FT", hg: 4, ag: 2, date: "6.17", time: "15:00", ven: "att", note: "주목" },
    "L-0-1": { st: "FT", hg: 1, ag: 0, date: "6.17", time: "18:00", ven: "mb" },
    "K-0-1": { st: "FT", hg: 1, ag: 3, date: "6.17", time: "21:00", ven: "azteca" },
    // ── 라운드 2 (MD2) · CST 기준 ──
    // 6.18
    "A-1-1": { st: "FT", hg: 1, ag: 1, date: "6.18", time: "11:00", ven: "mbs" },
    "B-1-1": { st: "FT", hg: 4, ag: 1, date: "6.18", time: "14:00", ven: "sofi" },
    "B-1-0": { st: "FT", hg: 6, ag: 0, date: "6.18", time: "17:00", ven: "bc" },
    "A-1-0": { st: "FT", hg: 1, ag: 0, date: "6.18", time: "20:00", ven: "guad", note: "주목" },
    // 6.19
    "D-1-0": { st: "FT", hg: 2, ag: 0, date: "6.19", time: "14:00", ven: "lumen" },
    "C-1-1": { st: "FT", hg: 0, ag: 1, date: "6.19", time: "17:00", ven: "gil" },
    "C-1-0": { st: "FT", hg: 3, ag: 0, date: "6.19", time: "19:30", ven: "linc" },
    "D-1-1": { st: "FT", hg: 0, ag: 1, date: "6.19", time: "22:00", ven: "levis" },
    // 6.20
    "F-1-0": { st: "FT", hg: 5, ag: 1, date: "6.20", time: "12:00", ven: "nrg" },
    "E-1-0": { st: "FT", hg: 2, ag: 1, date: "6.20", time: "15:00", ven: "mb", note: "주목" },
    "E-1-1": { st: "FT", hg: 0, ag: 0, date: "6.20", time: "19:00", ven: "arrow" },
    "F-1-1": { st: "FT", hg: 0, ag: 4, date: "6.20", time: "23:00", ven: "mty" },
    // 6.21
    "H-1-0": { st: "FT", hg: 4, ag: 0, date: "6.21", time: "11:00", ven: "mbs" },
    "G-1-0": { st: "FT", hg: 0, ag: 0, date: "6.21", time: "14:00", ven: "sofi" },
    "H-1-1": { st: "FT", hg: 2, ag: 2, date: "6.21", time: "17:00", ven: "hard" },
    "G-1-1": { st: "FT", hg: 1, ag: 3, date: "6.21", time: "20:00", ven: "bc" },
    // 6.22
    "J-1-0": { st: "FT", hg: 2, ag: 0, date: "6.22", time: "12:00", ven: "att" },
    "I-1-0": { st: "FT", hg: 3, ag: 0, date: "6.22", time: "16:00", ven: "linc", note: "주목" },
    "I-1-1": { st: "UP", date: "6.22", time: "19:00", ven: "mtlf" },
    "J-1-1": { st: "UP", date: "6.22", time: "22:00", ven: "levis" },
    // 6.23
    "K-1-0": { st: "UP", date: "6.23", time: "12:00", ven: "nrg" },
    "L-1-0": { st: "UP", date: "6.23", time: "15:00", ven: "gil" },
    "L-1-1": { st: "UP", date: "6.23", time: "18:00", ven: "mb" },
    "K-1-1": { st: "UP", date: "6.23", time: "21:00", ven: "guad" },
    // ── 라운드 3 (MD3) · CST 기준 (동시 킥오프) ──
    // 6.24
    "B-2-0": { st: "UP", date: "6.24", time: "14:00", ven: "bc" },
    "B-2-1": { st: "UP", date: "6.24", time: "14:00", ven: "lumen" },
    "C-2-0": { st: "UP", date: "6.24", time: "17:00", ven: "hard" },
    "C-2-1": { st: "UP", date: "6.24", time: "17:00", ven: "mbs" },
    "A-2-0": { st: "UP", date: "6.24", time: "20:00", ven: "azteca" },
    "A-2-1": { st: "UP", date: "6.24", time: "20:00", ven: "mty", note: "주목" },
    // 6.25
    "E-2-0": { st: "UP", date: "6.25", time: "15:00", ven: "mtlf" },
    "E-2-1": { st: "UP", date: "6.25", time: "15:00", ven: "linc" },
    "F-2-0": { st: "UP", date: "6.25", time: "18:00", ven: "arrow" },
    "F-2-1": { st: "UP", date: "6.25", time: "18:00", ven: "att" },
    "D-2-0": { st: "UP", date: "6.25", time: "21:00", ven: "sofi" },
    "D-2-1": { st: "UP", date: "6.25", time: "21:00", ven: "levis" },
    // 6.26
    "I-2-0": { st: "UP", date: "6.26", time: "14:00", ven: "gil", note: "주목" },
    "I-2-1": { st: "UP", date: "6.26", time: "14:00", ven: "mb" },
    "H-2-0": { st: "UP", date: "6.26", time: "19:00", ven: "guad" },
    "H-2-1": { st: "UP", date: "6.26", time: "19:00", ven: "nrg" },
    "G-2-0": { st: "UP", date: "6.26", time: "22:00", ven: "bc" },
    "G-2-1": { st: "UP", date: "6.26", time: "22:00", ven: "lumen" },
    // 6.27
    "L-2-0": { st: "UP", date: "6.27", time: "16:00", ven: "mtlf" },
    "L-2-1": { st: "UP", date: "6.27", time: "16:00", ven: "linc" },
    "K-2-0": { st: "UP", date: "6.27", time: "18:30", ven: "hard" },
    "K-2-1": { st: "UP", date: "6.27", time: "18:30", ven: "mbs" },
    "J-2-0": { st: "UP", date: "6.27", time: "21:00", ven: "att" },
    "J-2-1": { st: "UP", date: "6.27", time: "21:00", ven: "arrow" },
  };

  // 기본 일정 생성기 (MD2/MD3, CST 기준): MD2 6.18~6.22, MD3 6.23~6.27
  const baseDay = [13, 18, 23];
  const defDate = (md, gi) => "6." + (baseDay[md] + (gi % 5));
  const cstSlot = ["12:00", "15:00", "18:00", "21:00"];
  const venPool = Object.keys(VEN);
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  // CST(미 중부, 6월 = UTC-5) 기준 → 절대 시각(epoch ms)
  const toDt = (date, time) => {
    const [mo, da] = date.split(".").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    return Date.parse(`2026-${pad(mo)}-${pad(da)}T${pad(hh)}:${pad(mm)}:00-05:00`);
  };

  const MATCHES = [];
  let mid = 1;
  Object.keys(GROUPS).forEach((g, gi) => {
    const teams = GROUPS[g];
    MD.forEach((pairs, md) => {
      pairs.forEach((p, pi) => {
        const key = `${g}-${md}-${pi}`;
        const ov = OV[key] || {};
        const m = {
          id: "M" + (mid++),
          key,
          stage: "group",
          group: g,
          md: md + 1,
          home: teams[p[0]],
          away: teams[p[1]],
          st: ov.st || "UP",
          hg: ov.hg ?? null,
          ag: ov.ag ?? null,
          min: ov.min || null,
          date: ov.date || defDate(md, gi),
          time: ov.time || cstSlot[(gi + pi) % cstSlot.length],
          ven: ov.ven || venPool[(gi + md + pi) % venPool.length],
          venName: VEN[ov.ven || venPool[(gi + md + pi) % venPool.length]],
          note: ov.note || null,
        };
        m.dt = toDt(m.date, m.time);
        MATCHES.push(m);
      });
    });
  });

  // ── 순위 계산 ──
  function computeStandings(g) {
    const teams = GROUPS[g];
    const row = {};
    teams.forEach((t) => (row[t] = { team: t, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 }));
    MATCHES.filter((m) => m.group === g && (m.st === "FT" || m.st === "LIVE")).forEach((m) => {
      const h = row[m.home], a = row[m.away];
      h.P++; a.P++;
      h.GF += m.hg; h.GA += m.ag; a.GF += m.ag; a.GA += m.hg;
      if (m.hg > m.ag) { h.W++; a.L++; h.Pts += 3; }
      else if (m.hg < m.ag) { a.W++; h.L++; a.Pts += 3; }
      else { h.D++; a.D++; h.Pts++; a.Pts++; }
    });
    teams.forEach((t) => (row[t].GD = row[t].GF - row[t].GA));
    return teams.map((t) => row[t]).sort((x, y) =>
      y.Pts - x.Pts || y.GD - x.GD || y.GF - x.GF || x.team.localeCompare(y.team));
  }

  const STANDINGS = {};
  Object.keys(GROUPS).forEach((g) => (STANDINGS[g] = computeStandings(g)));

  // ── 토너먼트 브래킷 (공식 대진 구조, 슬롯=조 순위 라벨) ──
  // sl(slot label): "1A"=A조 1위, "2B"=B조 2위, "3:ABCDF"=A/B/C/D/F조 3위 중
  const R32 = [
    { id: "M73", home: "2A", away: "2B", ven: "sofi", date: "6.28" },
    { id: "M74", home: "1E", away: "3:ABCDF", ven: "gil", date: "6.29" },
    { id: "M75", home: "1F", away: "2C", ven: "mty", date: "6.29" },
    { id: "M76", home: "1C", away: "2F", ven: "nrg", date: "6.29" },
    { id: "M77", home: "1I", away: "3:CDFGH", ven: "mtlf", date: "6.30" },
    { id: "M78", home: "2E", away: "2I", ven: "att", date: "6.30" },
    { id: "M79", home: "1A", away: "3:CEFHI", ven: "azteca", date: "6.30" },
    { id: "M80", home: "1L", away: "3:EHIJK", ven: "mbs", date: "6.30" },
    { id: "M81", home: "1D", away: "3:BEFIJ", ven: "levis", date: "7.1" },
    { id: "M82", home: "1G", away: "3:AEHIJ", ven: "lumen", date: "7.1" },
    { id: "M83", home: "2K", away: "2L", ven: "mb", date: "7.2" },
    { id: "M84", home: "1H", away: "2J", ven: "sofi", date: "7.2" },
    { id: "M85", home: "1B", away: "3:EFGIJ", ven: "bc", date: "7.2" },
    { id: "M86", home: "1J", away: "2H", ven: "hard", date: "7.3" },
    { id: "M87", home: "1K", away: "3:DEILK", ven: "guad", date: "7.3" },
    { id: "M88", home: "2D", away: "2G", ven: "arrow", date: "7.3" },
  ];
  const R16 = [
    { id: "M89", home: "W74", away: "W77", ven: "linc", date: "7.4" },
    { id: "M90", home: "W73", away: "W75", ven: "nrg", date: "7.4" },
    { id: "M91", home: "W76", away: "W78", ven: "mtlf", date: "7.5" },
    { id: "M92", home: "W79", away: "W80", ven: "azteca", date: "7.5" },
    { id: "M93", home: "W83", away: "W84", ven: "att", date: "7.6" },
    { id: "M94", home: "W81", away: "W82", ven: "lumen", date: "7.6" },
    { id: "M95", home: "W86", away: "W88", ven: "mbs", date: "7.7" },
    { id: "M96", home: "W85", away: "W87", ven: "bc", date: "7.7" },
  ];
  const QF = [
    { id: "M97", home: "W89", away: "W90", ven: "gil", date: "7.9" },
    { id: "M98", home: "W93", away: "W94", ven: "sofi", date: "7.10" },
    { id: "M99", home: "W91", away: "W92", ven: "hard", date: "7.11" },
    { id: "M100", home: "W95", away: "W96", ven: "arrow", date: "7.11" },
  ];
  const SF = [
    { id: "M101", home: "W97", away: "W98", ven: "att", date: "7.14" },
    { id: "M102", home: "W99", away: "W100", ven: "mbs", date: "7.15" },
  ];
  const TP = [{ id: "M103", home: "L101", away: "L102", ven: "hard", date: "7.18" }];
  const FN = [{ id: "M104", home: "W101", away: "W102", ven: "mtlf", date: "7.19" }];

  [R32, R16, QF, SF, TP, FN].forEach((rd) =>
    rd.forEach((m) => {
      m.stage = "ko";
      m.st = "UP";
      m.venName = VEN[m.ven];
    })
  );

  window.WC = {
    T, GROUPS, VEN, MATCHES, STANDINGS, computeStandings,
    BRACKET: { R32, R16, QF, SF, TP, FN },
    byId: (id) => MATCHES.find((m) => m.id === id),
    groupMatches: (g) => MATCHES.filter((m) => m.group === g).sort((a, b) => a.dt - b.dt),
  };
})();
