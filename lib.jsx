/* 공용 컴포넌트 & 헬퍼 */
const { useState, useEffect, useRef, useMemo } = React;

// ── 사용자 로컬 시간대 변환 (모든 킥오프는 CST 기준 절대시각 dt로 저장) ──
const LOCAL_TZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return "현지"; } })();
const TZ_ABBR = (() => {
  try {
    const p = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(new Date());
    return (p.find((x) => x.type === "timeZoneName") || {}).value || "";
  } catch (e) { return ""; }
})();
function locDate(dt) { const d = new Date(dt); return (d.getMonth() + 1) + "." + d.getDate(); }
function locTime(dt) {
  return new Date(dt).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
}
function locWeekday(dt) { return new Date(dt).toLocaleDateString("ko-KR", { weekday: "short" }); }
// 오늘/내일/날짜 라벨 (사용자 로컬 날짜 기준, 기준일 = 환경 현재 = 2026-06-13)
function dayKey(dt) { const d = new Date(dt); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
function dayLabel(dt) {
  const now = new Date();
  const d = new Date(dt);
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((b - a) / 86400000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  if (diff === -1) return "어제";
  return (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + locWeekday(dt) + "요일";
}

// ── 오늘 날짜 + 대회 단계 라벨 (매일 자동 갱신) ──
// 기준 일정: 조별리그 MD1 6.11~6.17 / MD2 6.18~6.23 / MD3 6.24~6.27
//           32강 6.28~7.3 / 16강 7.4~7.8 / 8강 7.9~7.13 / 4강 7.14~7.17 / 3·4위전 7.18 / 결승 7.19
function tourPhase(mo, da) {
  const v = mo * 100 + da; // 월·일 비교용 정수
  if (v < 611) return "개막 대기";
  if (v <= 617) return "조별리그 1라운드";
  if (v <= 623) return "조별리그 2라운드";
  if (v <= 627) return "조별리그 3라운드";
  if (v <= 703) return "토너먼트 32강";
  if (v <= 708) return "토너먼트 16강";
  if (v <= 713) return "토너먼트 8강";
  if (v <= 717) return "토너먼트 4강";
  if (v === 718) return "3·4위전";
  if (v === 719) return "결승";
  return "폐막";
}
function todayLabel() {
  const d = new Date();
  const mo = d.getMonth() + 1, da = d.getDate();
  const p = (n) => (n < 10 ? "0" + n : "" + n);
  return d.getFullYear() + " · " + p(mo) + " · " + p(da) + " — " + tourPhase(mo, da);
}

const FLAG = {
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz", CAN: "ca", BIH: "ba", QAT: "qa", SUI: "ch",
  BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct", USA: "us", PAR: "py", AUS: "au", TUR: "tr",
  GER: "de", CUW: "cw", CIV: "ci", ECU: "ec", NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz", ESP: "es", CPV: "cv", KSA: "sa", URU: "uy",
  FRA: "fr", SEN: "sn", IRQ: "iq", NOR: "no", ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo",
  POR: "pt", COD: "cd", UZB: "uz", COL: "co", ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
};

// ── 팀 배지 (실제 국기) ──
function TeamBadge({ code, size = 28 }) {
  const t = WC.T[code];
  const iso = FLAG[code];
  if (!iso) return <span className="badge-flag" style={{ width: size, height: size, background: "var(--line)" }} />;
  return (
    <span className="badge-flag" style={{ width: size, height: size }} title={t ? t.ko : code}>
      <img src={"https://flagcdn.com/" + iso + ".svg"} alt={code} loading="lazy" draggable="false" />
    </span>
  );
}

// ── 팀 셀 (배지+이름) ──
function TeamCell({ code, size = 28, rev = false, bold }) {
  const t = WC.T[code];
  return (
    <div className={"team-cell" + (rev ? " rev" : "")}>
      <TeamBadge code={code} size={size} />
      <span className="nm" style={bold ? { fontWeight: 750 } : null}>{t ? t.ko : code}</span>
    </div>
  );
}

// ── 슬롯 라벨 해석 (브래킷용) ──
function slotLabel(sl) {
  if (!sl) return { txt: "—", sub: "" };
  if (sl[0] === "W") return { txt: sl.slice(1) + "경기 승자", sub: sl };
  if (sl[0] === "L") return { txt: sl.slice(1) + "경기 패자", sub: sl };
  if (sl.startsWith("3:")) return { txt: sl.slice(2).split("").join("/") + "조 3위", sub: "3위" };
  const rank = sl[0], grp = sl[1];
  return { txt: grp + "조 " + (rank === "1" ? "1위" : "2위"), sub: rank + grp };
}

// ── 아이콘 (단순 SVG path) ──
const ICONS = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  group: "M4 5h7v7H4zM13 5h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  bracket: "M3 6h6v4h4M3 18h6v-4M15 12h6",
  moon: "M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z",
  sun: "M12 4v2M12 18v2M4 12H2M22 12h-2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z",
  close: "M6 6l12 12M18 6L6 18",
  chev: "M9 6l6 6-6 6",
  chevD: "M6 9l6 6 6-6",
  ball: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7l3 2-1 4h-4l-1-4z",
  whistle: "M3 12a4 4 0 004 4h6l5 3v-6a6 6 0 00-6-6H7a4 4 0 00-4 4z",
  pin: "M12 21s7-6.4 7-11a7 7 0 10-14 0c0 4.6 7 11 7 11zM12 8a2 2 0 100 4 2 2 0 000-4z",
  cal: "M4 6h16v15H4zM4 9h16M8 3v4M16 3v4",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v4l3 2",
  chart: "M3 21h18M6 21V11M12 21V5M18 21v-8",
};
function Icon({ name, size = 18, sw = 1.8, fill }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke={fill ? "none" : "currentColor"}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

// ── 평점 등급 색 ──
function ratingClass(r) { return r >= 7.5 ? "hi" : r >= 6.6 ? "mid" : "lo"; }
function ratingBg(r) { return r >= 7.5 ? "var(--win)" : r >= 6.6 ? "var(--blue)" : "var(--loss)"; }

// ── 배경색 대비 글자색 (밝은 색=어두운 글자) ──
function txtOn(hex) {
  if (!hex || hex[0] !== "#") return "#fff";
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#1a1410" : "#fff";
}
// ── 경기 표시 색 (detail.colors 우선, 없으면 팀 c1) ──
function matchColors(detail, homeCode, awayCode) {
  const c = (detail && detail.colors) || {};
  return { home: c.home || WC.T[homeCode].c1, away: c.away || WC.T[awayCode].c1 };
}

// ── 통계 바 (항상 값 비례) ──
function StatBar({ s }) {
  const tot = s.h + s.a;
  const hp = tot ? (s.h / tot) * 100 : 50;
  const ap = tot ? (s.a / tot) * 100 : 50;
  const fmt = (v) => (s.dec ? v.toFixed(2) : v) + (s.unit || "");
  const hWin = s.h > s.a, aWin = s.a > s.h;
  return (
    <div className="stat-bar">
      <div className="sb-top">
        <span style={{ color: hWin ? "var(--blue-bright)" : "var(--tx2)", fontWeight: hWin ? 800 : 600 }}>{fmt(s.h)}</span>
        <span style={{ color: aWin ? "var(--tx)" : "var(--tx2)", fontWeight: aWin ? 800 : 600 }}>{fmt(s.a)}</span>
      </div>
      <div className="sb-lbl">{s.label}</div>
      <div className="sb-track">
        <div className="h" style={{ width: hp + "%" }} />
        <div className="a" style={{ width: ap + "%" }} />
      </div>
    </div>
  );
}

// ── 경기 한 줄 ──
function MatchRow({ m, onClick }) {
  const live = m.st === "LIVE", up = m.st === "UP";
  return (
    <div className="match-row" onClick={() => onClick && onClick(m)}>
      <div className="when">
        {live ? <span style={{ color: "var(--live)", fontWeight: 800 }}>{m.min}</span>
          : <>{m.dt ? locDate(m.dt) : m.date}<br /><span style={{ opacity: .7 }}>{m.dt ? locTime(m.dt) : m.time}</span></>}
      </div>
      <div className="team-cell rev home" style={{ justifyContent: "flex-end" }}>
        <span className="nm">{WC.T[m.home] ? WC.T[m.home].ko : ""}</span>
        <TeamBadge code={m.home} size={26} />
      </div>
      <div className={"score " + (live ? "live" : up ? "up" : "")}>
        {up ? "VS" : <>{m.hg}<span style={{ opacity: .4 }}>:</span>{m.ag}</>}
      </div>
      <div className="team-cell">
        <TeamBadge code={m.away} size={26} />
        <span className="nm">{WC.T[m.away] ? WC.T[m.away].ko : ""}</span>
      </div>
      <div className="chev"><Icon name="chev" size={16} /></div>
    </div>
  );
}

// ── 폼 점 (최근 결과) ──
function FormDots({ code, group }) {
  const ms = WC.MATCHES.filter((m) => m.group === group && (m.home === code || m.away === code) && (m.st === "FT" || m.st === "LIVE"));
  const res = ms.map((m) => {
    const gf = m.home === code ? m.hg : m.ag, ga = m.home === code ? m.ag : m.hg;
    return gf > ga ? "W" : gf < ga ? "L" : "D";
  });
  while (res.length < 3) res.push("x");
  return <div className="form-dots">{res.slice(0, 3).map((r, i) => <span key={i} className={"fd " + r}>{r === "x" ? "·" : r}</span>)}</div>;
}

Object.assign(window, { TeamBadge, TeamCell, Icon, StatBar, MatchRow, FormDots, slotLabel, ratingClass, ratingBg, txtOn, matchColors, locDate, locTime, locWeekday, dayLabel, dayKey, LOCAL_TZ, TZ_ABBR });
