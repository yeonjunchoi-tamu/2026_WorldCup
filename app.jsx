/* 앱 셸 — 네비 / 테마 / 라우팅 / 패널 */

function App() {
  const [view, setView] = useState(() => localStorage.getItem("wc_view") || "dash");
  const [theme, setTheme] = useState(() => localStorage.getItem("wc_theme") || "dark");
  const [sel, setSel] = useState(null); // 선택된 경기

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("wc_theme", theme); }, [theme]);
  const go = (v) => { setView(v); localStorage.setItem("wc_view", v); window.scrollTo(0, 0); };

  const nav = [["dash", "대시보드", "home"], ["groups", "조별리그", "group"], ["bracket", "토너먼트", "bracket"], ["leaders", "기록실", "chart"]];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo"><img src="assets/wc26-logo.png" alt="FIFA World Cup 26" /></div>
          <div>
            <div className="brand-tt">2026 북중미 월드컵</div>
            <div className="brand-sub">CANADA · MEXICO · USA</div>
          </div>
        </div>
        <nav className="nav">
          {nav.map(([k, l]) => <button key={k} className={"nav-btn" + (view === k ? " on" : "")} onClick={() => go(k)}>{l}</button>)}
        </nav>
        <div className="spacer" />
        <div className="theme-toggle">
          <button className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")} title="라이트"><Icon name="sun" size={16} /></button>
          <button className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")} title="다크"><Icon name="moon" size={16} /></button>
        </div>
      </header>

      <main className="main">
        {view === "dash" && <Dashboard onMatch={setSel} onGroup={() => go("groups")} />}
        {view === "groups" && <GroupsView onMatch={setSel} />}
        {view === "bracket" && <BracketView onMatch={setSel} />}
        {view === "leaders" && <LeadersView />}
      </main>

      <nav className="mobnav">
        {nav.map(([k, l, ic]) => (
          <button key={k} className={view === k ? "on" : ""} onClick={() => go(k)}>
            <Icon name={ic} size={20} />{l}
          </button>
        ))}
      </nav>

      <MatchDetailPanel m={sel} onClose={() => setSel(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
