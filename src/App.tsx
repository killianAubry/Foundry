import {
  Activity,
  Bell,
  Bot,
  Briefcase,
  Building2,
  ChevronLeft,
  Command,
  CreditCard,
  Database,
  DollarSign,
  FileText,
  Gauge,
  Home,
  Inbox,
  LineChart as LineChartIcon,
  Lock,
  Mail,
  Menu,
  Network,
  Search,
  Send,
  Settings,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useEffect, useMemo, useState } from 'react';

type View =
  | 'dashboard'
  | 'investors'
  | 'outreach'
  | 'competitors'
  | 'discovery'
  | 'metrics'
  | 'fundraising'
  | 'settings'
  | 'billing';

type NavItem = {
  id: View;
  label: string;
  icon: typeof Home;
};

const workspaceNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'investors', label: 'Investor CRM', icon: Briefcase },
  { id: 'outreach', label: 'Outreach', icon: Send },
  { id: 'competitors', label: 'Competitors', icon: Building2 },
  { id: 'discovery', label: 'Discovery', icon: Inbox },
  { id: 'metrics', label: 'Metrics', icon: Gauge },
  { id: 'fundraising', label: 'Fundraising', icon: DollarSign },
];

const accountNav: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const pageTitles: Record<View, string> = {
  dashboard: 'Weekly Brief',
  investors: 'Investor CRM',
  outreach: 'Auto Outreach Engine',
  competitors: 'Competitor Tracker',
  discovery: 'Customer Discovery Hub',
  metrics: 'Metrics Dashboard',
  fundraising: 'Fundraising Pipeline',
  settings: 'Settings',
  billing: 'Billing',
};

const sevenDay = [
  { day: 'M', reply: 18, contacts: 4, sent: 42, revenue: 1200 },
  { day: 'T', reply: 21, contacts: 7, sent: 56, revenue: 1280 },
  { day: 'W', reply: 16, contacts: 5, sent: 50, revenue: 1290 },
  { day: 'T', reply: 27, contacts: 10, sent: 64, revenue: 1390 },
  { day: 'F', reply: 24, contacts: 8, sent: 48, revenue: 1510 },
  { day: 'S', reply: 31, contacts: 3, sent: 20, revenue: 1530 },
  { day: 'S', reply: 28, contacts: 2, sent: 18, revenue: 1575 },
];

const investors = [
  { name: 'Maya Chen', firm: 'Northstar', stage: 'Researching', days: 2, next: 'score fit', amount: '$250k', source: 'warm' },
  { name: 'Andre Williams', firm: 'A16Z', stage: 'Outreach sent', days: 12, next: 'follow up', amount: '$500k', source: 'cold' },
  { name: 'Priya Nair', firm: 'Operator Fund', stage: 'Intro requested', days: 4, next: 'nudge Sarah', amount: '$150k', source: 'intro' },
  { name: 'Jon Bell', firm: 'Seedcamp', stage: 'First meeting', days: 1, next: 'prep brief', amount: '$300k', source: 'warm' },
  { name: 'Rina Sol', firm: 'TinySeed', stage: 'In diligence', days: 7, next: 'send metrics', amount: '$200k', source: 'warm' },
  { name: 'Ari Katz', firm: 'SignalFire', stage: 'Committed', days: 0, next: 'wire docs', amount: '$250k', source: 'intro' },
];

const stages = ['Researching', 'Outreach sent', 'Intro requested', 'First meeting', 'In diligence', 'Passed', 'Committed'];

const campaigns = [
  { name: 'Seed investor wedge', type: 'investors', status: 'active', sent: 188, reply: '24%' },
  { name: 'Design partners', type: 'customers', status: 'draft', sent: 42, reply: '31%' },
  { name: 'Press launch', type: 'press', status: 'paused', sent: 16, reply: '12%' },
];

const competitors = [
  { name: 'Clay', signal: 'Pricing changed', changes: 4, last: 'today', color: '#E5C07B' },
  { name: 'Attio', signal: 'Hiring surge', changes: 9, last: '1d', color: '#9CC88E' },
  { name: 'Folk', signal: 'New feature', changes: 2, last: '2d', color: '#B78FD4' },
  { name: 'Affinity', signal: 'News spike', changes: 6, last: '3d', color: '#7BB7C7' },
];

const interviews = [
  { name: 'Leah K.', company: 'Tandem', role: 'Founder', status: 'processed', pain: 9 },
  { name: 'Marco P.', company: 'Vector', role: 'CEO', status: 'reviewed', pain: 7 },
  { name: 'Nadia S.', company: 'Orbit', role: 'Growth', status: 'raw', pain: 6 },
  { name: 'Evan R.', company: 'Relay', role: 'Founder', status: 'processed', pain: 8 },
];

const metricSeries = Array.from({ length: 12 }, (_, i) => ({
  month: `D${i * 7}`,
  mrr: 900 + i * 180 + (i % 3) * 90,
  churn: 7 - i * 0.22,
  users: 120 + i * 38,
  burn: 28000 + i * 350,
}));

const aiProviders = [
  { name: 'Ollama local', model: 'llama3.1 / mistral', cost: 'free self-hosted', status: 'recommended' },
  { name: 'LM Studio', model: 'OpenAI-compatible local', cost: 'free self-hosted', status: 'ready' },
  { name: 'Hugging Face', model: 'serverless endpoint', cost: 'free tier key', status: 'configure' },
  { name: 'OpenRouter', model: 'free model presets', cost: 'free quota varies', status: 'configure' },
  { name: 'Gemini', model: 'Flash free tier', cost: 'free tier key', status: 'configure' },
  { name: 'Claude', model: 'sonnet-4-20250514', cost: 'paid fallback', status: 'optional' },
];

const integrations: Array<{ name: string; desc: string; icon: LucideIcon }> = [
  { name: 'Stripe', desc: 'revenue + subscriptions', icon: DollarSign },
  { name: 'PostHog / Plausible / Mixpanel', desc: 'product analytics', icon: LineChartIcon },
  { name: 'GitHub', desc: 'technical health', icon: Network },
  { name: 'Linear / Jira', desc: 'velocity + bugs', icon: Activity },
  { name: 'Brex / Mercury', desc: 'burn + runway', icon: CreditCard },
  { name: 'Resend', desc: 'email sending', icon: Mail },
];

export function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('founder-os-sidebar') === 'collapsed');
  const [searchOpen, setSearchOpen] = useState(false);
  const [tableMode, setTableMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('founder-os-sidebar', collapsed ? 'collapsed' : 'open');
  }, [collapsed]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') setSearchOpen(false);
      if (!searchOpen && event.key.toLowerCase() === 'j') {
        const all = [...workspaceNav, ...accountNav];
        const index = all.findIndex((item) => item.id === activeView);
        setActiveView(all[(index + 1) % all.length].id);
      }
      if (!searchOpen && event.key.toLowerCase() === 'k') {
        const all = [...workspaceNav, ...accountNav];
        const index = all.findIndex((item) => item.id === activeView);
        setActiveView(all[(index - 1 + all.length) % all.length].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeView, searchOpen]);

  const content = useMemo(() => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'investors':
        return <InvestorCrm tableMode={tableMode} onToggleMode={() => setTableMode((value) => !value)} />;
      case 'outreach':
        return <Outreach />;
      case 'competitors':
        return <Competitors />;
      case 'discovery':
        return <Discovery />;
      case 'metrics':
        return <Metrics />;
      case 'fundraising':
        return <Fundraising />;
      case 'settings':
        return <SettingsView />;
      case 'billing':
        return <Billing />;
    }
  }, [activeView, tableMode]);

  return (
    <div className="min-h-screen bg-canvas text-ink font-mono">
      <div className="fixed inset-x-0 top-0 z-40 h-7 border-b border-grid bg-panel px-3 text-[11px] text-muted flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-yellow">founder-os</span>
          <span>·</span>
          <span>workspace / pre-seed / default</span>
        </div>
        <div className="flex items-center gap-3">
          <span>ai: ollama local</span>
          <span className="text-greenline">status: synced</span>
        </div>
      </div>

      <aside className={`fixed left-0 top-7 bottom-6 z-30 border-r border-grid bg-panel transition-all ${collapsed ? 'w-12' : 'w-[220px]'}`}>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center gap-2 border-b border-grid px-3">
            <button className="icon-control" aria-label="Toggle sidebar" onClick={() => setCollapsed((value) => !value)}>
              {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
            </button>
            {!collapsed && (
              <div>
                <div className="text-sm text-ink">Founder OS</div>
                <div className="text-[10px] uppercase text-muted">0 to 1 control surface</div>
              </div>
            )}
          </div>
          <NavSection title="workspace" items={workspaceNav} activeView={activeView} setActiveView={setActiveView} collapsed={collapsed} />
          <div className="mt-auto">
            <NavSection title="account" items={accountNav} activeView={activeView} setActiveView={setActiveView} collapsed={collapsed} />
            <div className="border-t border-grid p-2">
              <div className="flex items-center gap-2 rounded bg-elevated p-2">
                <div className="grid h-7 w-7 place-items-center rounded-sm border border-grid bg-active text-[10px] text-yellow">KA</div>
                {!collapsed && (
                  <div className="min-w-0">
                    <div className="truncate text-xs">Killian</div>
                    <div className="truncate text-[10px] text-muted">solo plan</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className={`min-h-screen pt-7 pb-6 transition-all ${collapsed ? 'pl-12' : 'pl-[220px]'}`}>
        <header className="sticky top-7 z-20 flex h-16 items-center justify-between border-b border-grid bg-canvas/95 px-5 backdrop-blur">
          <div>
            <div className="text-[10px] uppercase tracking-normal text-muted">workspace · {activeView}</div>
            <h1 className="text-xl leading-tight text-ink">{pageTitles[activeView]}</h1>
          </div>
          <button className="search-strip" onClick={() => setSearchOpen(true)}>
            <Search size={15} />
            <span>search contacts, emails, companies</span>
            <kbd>cmd+k</kbd>
          </button>
          <div className="flex items-center gap-2">
            <button className="icon-control relative" aria-label="Notifications">
              <Bell size={16} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-redline" />
            </button>
            <button className="icon-control" aria-label="Avatar dropdown">
              <Users size={16} />
            </button>
          </div>
        </header>
        <section className="p-5">{content}</section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 flex h-6 items-center justify-between border-t border-grid bg-panel px-3 text-[11px] text-muted">
        <span className="text-yellow">ok: j/k nav · cmd+k search · esc close</span>
        <span>docker/self-hostable · postgres · redis · fastapi api contract mocked</span>
      </div>

      {searchOpen && <CommandPalette onClose={() => setSearchOpen(false)} setActiveView={setActiveView} />}
    </div>
  );
}

function NavSection({
  title,
  items,
  activeView,
  setActiveView,
  collapsed,
}: {
  title: string;
  items: NavItem[];
  activeView: View;
  setActiveView: (view: View) => void;
  collapsed: boolean;
}) {
  return (
    <div className="py-3">
      {!collapsed && <div className="px-3 pb-2 text-[10px] uppercase text-dim">-- {title} --</div>}
      <div className="space-y-1 px-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeView;
          return (
            <button
              key={item.id}
              className={`nav-item ${active ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={item.label}
              onClick={() => setActiveView(item.id)}
            >
              <Icon size={15} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard() {
  const metricCards = [
    { label: 'MRR / stripe', value: '$15.7k', delta: '+12.4%', icon: DollarSign },
    { label: 'active users', value: '1,284', delta: '+98', icon: Users },
    { label: 'open investor convos', value: '21', delta: '4 stale', icon: Briefcase },
    { label: 'emails sent this week', value: '348', delta: 'cap 500', icon: Mail },
  ];

  return (
    <div className="space-y-4">
      <section className="panel-card border-yellow/60">
        <div className="section-head">
          <div>
            <div className="eyebrow">monday 08:00 cron · editable ai output</div>
            <h2>Weekly brief</h2>
          </div>
          <span className="badge yellow">dismiss</span>
        </div>
        <div className="grid gap-3 text-sm text-muted md:grid-cols-3">
          <p>MRR rose 12.4% while active users crossed 1.2k. Reply quality improved on design partner outreach, but investor follow-up latency is drifting.</p>
          <p>Competitor monitoring flagged Clay pricing changes and an Attio enterprise hiring spike. Discovery calls keep clustering around pipeline hygiene and follow-up anxiety.</p>
          <p className="text-ink">Top priorities: follow up with A16Z, ship pricing comparison copy, and run 6 more customer interviews before Friday.</p>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div className="metric-card" key={metric.label}>
              <Icon size={16} className="text-muted" />
              <div className="mt-4 text-2xl text-yellow">{metric.value}</div>
              <div className="text-[11px] uppercase text-muted">{metric.label}</div>
              <div className="mt-2 text-xs text-greenline">{metric.delta}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="panel-card">
          <div className="section-head">
            <h2>Action items</h2>
            <span className="badge">ai ranked</span>
          </div>
          {['Follow up with Andre Williams at A16Z after 12 silent days.', '3 competitor job postings suggest enterprise sales push.', 'Reply rate dropped on press launch variant B.', 'Generate meeting prep for Seedcamp first meeting.'].map((item, index) => (
            <div className="list-row" key={item}>
              <span className="index">{String(index + 1).padStart(2, '0')}</span>
              <span>{item}</span>
              <span className="ml-auto text-yellow">open</span>
            </div>
          ))}
        </section>
        <section className="panel-card">
          <div className="section-head">
            <h2>Activity feed</h2>
            <span className="badge">live</span>
          </div>
          {['Email opened · Maya Chen · 4m', 'Investor stage changed · TinySeed · 1h', 'Competitor diff stored · Clay pricing · 3h', 'Interview processed · Leah K. · 5h', 'Stripe invoice paid · Team plan · 7h'].map((event) => (
            <div className="feed-line" key={event}>
              <span className="h-2 w-2 bg-greenline" />
              <span>{event}</span>
            </div>
          ))}
        </section>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {[
          ['reply rate', 'reply'],
          ['new contacts', 'contacts'],
          ['outreach sent', 'sent'],
          ['revenue', 'revenue'],
        ].map(([label, key]) => (
          <SparkCard key={label} label={label} dataKey={key} />
        ))}
      </div>
    </div>
  );
}

function SparkCard({ label, dataKey }: { label: string; dataKey: string }) {
  return (
    <section className="panel-card h-36">
      <div className="mb-2 text-xs uppercase text-muted">{label}</div>
      <ResponsiveContainer width="100%" height="75%">
        <LineChart data={sevenDay}>
          <Line type="monotone" dataKey={dataKey} stroke="#E5C07B" strokeWidth={2} dot={false} />
          <Tooltip contentStyle={{ background: '#262626', border: '1px solid #2A2A2A', color: '#F2F2F2' }} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

function InvestorCrm({ tableMode, onToggleMode }: { tableMode: boolean; onToggleMode: () => void }) {
  return (
    <div className="space-y-4">
      <div className="toolbar">
        <span className="badge yellow">+ add investor</span>
        <span className="badge">csv export</span>
        <span className="badge">warm intro mapper</span>
        <button className="badge" onClick={onToggleMode}>{tableMode ? 'kanban view' : 'table view'}</button>
      </div>
      {tableMode ? (
        <section className="panel-card overflow-auto">
          <table className="data-table">
            <thead>
              <tr>{['Name', 'Firm', 'Stage', 'Last contact', 'Next action', 'Amount', 'Source', 'Tags'].map((head) => <th key={head}>{head}</th>)}</tr>
            </thead>
            <tbody>
              {investors.map((investor) => (
                <tr key={investor.name}>
                  <td>{investor.name}</td><td>{investor.firm}</td><td>{investor.stage}</td><td>{investor.days}d</td><td>{investor.next}</td><td>{investor.amount}</td><td>{investor.source}</td><td>seed, b2b</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <div className="grid min-w-0 gap-3 xl:grid-cols-7">
          {stages.map((stage) => (
            <section className="kanban-col" key={stage}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs uppercase text-muted">{stage}</h2>
                <span className="badge">{investors.filter((i) => i.stage === stage).length}</span>
              </div>
              <div className="space-y-2">
                {investors.filter((i) => i.stage === stage).map((investor) => (
                  <div className="investor-card" key={investor.name}>
                    <div className="flex justify-between gap-2">
                      <span className="text-sm text-ink">{investor.name}</span>
                      <span className={`badge ${investor.source === 'cold' ? 'red' : 'green'}`}>{investor.source}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted">{investor.firm}</div>
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className={investor.days > 10 ? 'text-redline' : 'text-muted'}>{investor.days}d idle</span>
                      <span className="text-yellow">{investor.next}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <section className="panel-card grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="section-head"><h2>AI investor workspace</h2><span className="badge">editable before send</span></div>
          <div className="grid gap-3 md:grid-cols-3">
            {['Auto-draft follow-up', 'Investor fit score', 'Meeting prep brief'].map((name) => <AiTile key={name} title={name} />)}
          </div>
        </div>
        <div className="border-l border-grid pl-4">
          <h2 className="mb-3 text-sm">Timeline drawer</h2>
          {['email sent', 'meeting logged', 'stage changed', 'note added'].map((row) => <div className="feed-line" key={row}><span className="h-2 w-2 bg-yellow" /><span>{row}</span></div>)}
        </div>
      </section>
    </div>
  );
}

function Outreach() {
  const heat = ['M', 'T', 'W', 'T', 'F'].flatMap((day, dayIndex) => [9, 10, 11, 14, 15].map((hour, hourIndex) => ({ day, hour, value: (dayIndex + 1) * (hourIndex + 2) })));
  return (
    <div className="grid gap-4 xl:grid-cols-[280px_1fr_240px]">
      <section className="panel-card">
        <div className="section-head"><h2>Campaigns</h2><span className="badge yellow">new</span></div>
        {campaigns.map((campaign) => (
          <div className="list-row block" key={campaign.name}>
            <div className="flex justify-between"><span>{campaign.name}</span><span className="badge">{campaign.status}</span></div>
            <div className="mt-2 text-[11px] text-muted">{campaign.type} · {campaign.sent} sent · {campaign.reply} replies</div>
          </div>
        ))}
      </section>
      <section className="panel-card min-h-[620px]">
        <div className="toolbar">
          {['target list', 'templates', 'sequence', 'schedule'].map((tab, index) => <span key={tab} className={`badge ${index === 1 ? 'yellow' : ''}`}>{tab}</span>)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="field-label">subject</label>
            <div className="input-shell">quick question about {'{{company}}'} pipeline</div>
            <label className="field-label mt-4">body</label>
            <div className="editor-shell">
              <p>Hi {'{{first_name}}'},</p>
              <p>{'{{personalized_opener}}'}</p>
              <p>We help solo founders turn investor, customer, and competitor signal into one operating surface. Worth comparing notes next week?</p>
            </div>
          </div>
          <div className="space-y-3">
            <AiTile title="Personalization engine" />
            <AiTile title="Subject line generator" />
            <AiTile title="Tone analyzer" />
            <div className="panel-card bg-panel">
              <h2 className="mb-2 text-sm">Sequence</h2>
              {['day 0 · intro', 'day 3 · follow-up', 'day 7 · last touch'].map((step) => <div className="list-row" key={step}>{step}<span className="ml-auto text-muted">if no reply</span></div>)}
            </div>
          </div>
        </div>
      </section>
      <section className="panel-card">
        <div className="section-head"><h2>Analytics</h2><span className="badge">collapse</span></div>
        <div className="grid grid-cols-2 gap-2">
          {['sent 188', 'opened 91', 'replied 45', 'bounced 3'].map((metric) => <div className="mini-stat" key={metric}>{metric}</div>)}
        </div>
        <div className="mt-4 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'A', v: 24 }, { name: 'B', v: 31 }, { name: 'C', v: 18 }]}>
              <Bar dataKey="v" fill="#E5C07B" />
              <XAxis dataKey="name" stroke="#888" />
              <Tooltip contentStyle={{ background: '#262626', border: '1px solid #2A2A2A' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-1">
          {heat.map((cell) => <div key={`${cell.day}${cell.hour}`} className="heat-cell" style={{ opacity: 0.25 + cell.value / 35 }} title={`${cell.day} ${cell.hour}:00`} />)}
        </div>
      </section>
    </div>
  );
}

function Competitors() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {competitors.map((competitor) => (
          <section className="panel-card min-h-48" key={competitor.name}>
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-sm border border-grid bg-active text-sm" style={{ color: competitor.color }}>{competitor.name[0]}</div>
              <span className="badge">{competitor.last}</span>
            </div>
            <h2 className="mt-5 text-lg">{competitor.name}</h2>
            <div className="mt-2 text-sm text-yellow">{competitor.signal}</div>
            <div className="mt-6 h-1.5 bg-active"><div className="h-full bg-yellow" style={{ width: `${competitor.changes * 9}%` }} /></div>
            <div className="mt-2 text-xs text-muted">{competitor.changes} changes this week</div>
          </section>
        ))}
      </div>
      <section className="panel-card">
        <div className="section-head"><h2>Detail drawer</h2><span className="badge">Clay</span></div>
        <div className="toolbar">{['pricing', 'features', 'jobs', 'news', 'notes'].map((tab) => <span className="badge" key={tab}>{tab}</span>)}</div>
        <div className="diff-block">
          <div className="text-redline">- starter plan $149/mo, 1k credits</div>
          <div className="text-greenline">+ starter plan $179/mo, 1.5k credits</div>
        </div>
        <AiTile title="Change summarizer" />
        <AiTile title="Strategic inference" />
        <AiTile title="Competitive moat analyzer" />
      </section>
    </div>
  );
}

function Discovery() {
  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <section className="panel-card">
        <div className="section-head"><h2>Interviews</h2><span className="badge yellow">add</span></div>
        {interviews.map((interview) => (
          <div className="list-row block" key={interview.name}>
            <div className="flex justify-between"><span>{interview.name}</span><span className="badge">{interview.status}</span></div>
            <div className="mt-1 text-[11px] text-muted">{interview.company} · {interview.role} · pain {interview.pain}/10</div>
          </div>
        ))}
      </section>
      <section className="panel-card">
        <div className="grid gap-3 md:grid-cols-4">
          {['24 interviews', '18 companies', '7.8 avg pain', '3 themes'].map((stat) => <div className="mini-stat" key={stat}>{stat}</div>)}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {['Follow-up anxiety', 'Investor data scattered', 'Manual competitor checking'].map((theme) => (
            <div className="panel-card bg-panel" key={theme}>
              <div className="section-head"><h2>{theme}</h2><span className="badge">quotes 8</span></div>
              <p className="text-sm text-muted">Representative quotes and company mentions are grouped with evidence. Clicking opens all transcript excerpts.</p>
            </div>
          ))}
          <div className="panel-card bg-panel">
            <h2 className="mb-2 text-sm">Living synthesis doc</h2>
            <p className="text-sm text-muted">What customers actually need: a single place that tells them what to do next, with every AI output editable and exportable.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metrics() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <section className="panel-card xl:col-span-2">
        <div className="section-head"><h2>MRR + growth rate</h2><span className="badge">90d</span></div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metricSeries}>
              <CartesianGrid stroke="#2A2A2A" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ background: '#262626', border: '1px solid #2A2A2A' }} />
              <Line type="monotone" dataKey="mrr" stroke="#E5C07B" strokeWidth={2} />
              <Line type="monotone" dataKey="users" stroke="#7BB7C7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="panel-card">
        <div className="text-[11px] uppercase text-muted">burn + runway</div>
        <div className="mt-4 text-5xl text-redline">$31k</div>
        <div className="mt-2 text-sm text-muted">monthly burn · 13.4 months remaining</div>
        <div className="mt-5 h-2 bg-active"><div className="h-full w-[67%] bg-greenline" /></div>
      </section>
      {['Churn rate', 'DAU / WAU / MAU', 'Revenue by cohort', 'Traffic sources', 'Conversion funnel', 'Anomaly alerts'].map((widget, index) => (
        <section className="panel-card" key={widget}>
          <div className="section-head"><h2>{widget}</h2><span className="badge">drag</span></div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricSeries.slice(0, 6)}>
                <Bar dataKey={index % 2 ? 'users' : 'churn'} fill={index % 2 ? '#7BB7C7' : '#B78FD4'} />
                <Tooltip contentStyle={{ background: '#262626', border: '1px solid #2A2A2A' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      ))}
    </div>
  );
}

function Fundraising() {
  const segments = [
    { label: 'soft-circled', value: 28, color: '#E5C07B' },
    { label: 'diligence', value: 18, color: '#B78FD4' },
    { label: 'committed', value: 22, color: '#9CC88E' },
  ];
  return (
    <div className="space-y-4">
      <section className="panel-card">
        <div className="section-head"><h2>$1.5m seed target</h2><span className="badge">SAFE · cap $12m</span></div>
        <div className="flex h-4 overflow-hidden rounded-sm bg-active">
          {segments.map((segment) => <div key={segment.label} style={{ width: `${segment.value}%`, background: segment.color }} />)}
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {['target $1.5m', 'soft $420k', 'diligence $270k', 'committed $330k'].map((item) => <div className="mini-stat" key={item}>{item}</div>)}
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-3">
        <section className="panel-card">
          <div className="section-head"><h2>Round summary</h2><span className="badge">live</span></div>
          {['Lead investor status: open', 'Round type: SAFE', 'Valuation cap: $12m', 'Discount: 20%', 'Pro-rata: standard'].map((item) => <div className="list-row" key={item}>{item}</div>)}
        </section>
        <section className="panel-card">
          <div className="section-head"><h2>Data room</h2><span className="badge yellow">share</span></div>
          {['Pitch deck', 'Financials', 'Cap table', 'Legal', 'Team bios', 'Product demo'].map((doc, index) => <div className="list-row" key={doc}>{doc}<span className="ml-auto badge">{index < 3 ? 'uploaded' : 'draft'}</span></div>)}
        </section>
        <section className="panel-card">
          <div className="section-head"><h2>Diligence requests</h2><span className="badge red">2 overdue</span></div>
          {['TinySeed · cohort retention · due today', 'Seedcamp · churn notes · overdue', 'Ari Katz · cap table · answered'].map((request) => <div className="list-row" key={request}>{request}</div>)}
        </section>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {['SAFE/term sheet summarizer', 'Pitch deck reviewer', 'Closing update drafter'].map((name) => <AiTile key={name} title={name} />)}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <section className="panel-card">
        <div className="section-head"><h2>Integrations</h2><span className="badge">oauth/read-only where possible</span></div>
        <div className="grid gap-3 md:grid-cols-2">
          {integrations.map(({ name, desc, icon: Icon }) => (
            <div className="integration-card" key={name}>
              <Icon size={18} />
              <div><div>{name}</div><div className="text-xs text-muted">{desc}</div></div>
              <span className="ml-auto badge">connect</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel-card">
        <div className="section-head"><h2>AI providers</h2><span className="badge yellow">free-first</span></div>
        <p className="mb-4 text-sm text-muted">Provider routing is user-configurable. Local/free providers are prioritized; paid Claude can remain as a fallback for teams that add a key.</p>
        {aiProviders.map((provider) => (
          <div className="provider-row" key={provider.name}>
            <Bot size={16} className="text-yellow" />
            <div className="min-w-0">
              <div className="truncate text-sm">{provider.name}</div>
              <div className="truncate text-[11px] text-muted">{provider.model} · {provider.cost}</div>
            </div>
            <span className="ml-auto badge">{provider.status}</span>
          </div>
        ))}
        <div className="mt-4 space-y-3">
          <label className="field-label">api base url</label>
          <div className="input-shell">http://localhost:11434/v1</div>
          <label className="field-label">routing policy</label>
          <div className="input-shell">free local first, fallback by task complexity</div>
        </div>
      </section>
    </div>
  );
}

function Billing() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {[
        ['Solo', '$19', '1 user · all modules · 500 outreach emails/mo'],
        ['Team', '$49', '3 users · unlimited emails · all integrations'],
        ['Accelerator', '$199', 'white label · unlimited users · cohort analytics'],
      ].map(([name, price, details], index) => (
        <section className={`panel-card ${index === 0 ? 'border-yellow/70' : ''}`} key={name}>
          <div className="section-head"><h2>{name}</h2><span className="badge">{index === 0 ? 'current' : 'stripe'}</span></div>
          <div className="text-4xl text-yellow">{price}<span className="text-sm text-muted">/mo</span></div>
          <p className="mt-4 text-sm text-muted">{details}</p>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted"><Lock size={14} /> plan gates enforced by API middleware</div>
        </section>
      ))}
    </div>
  );
}

function AiTile({ title }: { title: string }) {
  return (
    <div className="ai-tile">
      <Sparkles size={16} />
      <div>
        <div className="text-sm text-ink">{title}</div>
        <div className="text-[11px] text-muted">draft only · editable · no auto-send</div>
      </div>
    </div>
  );
}

function CommandPalette({ onClose, setActiveView }: { onClose: () => void; setActiveView: (view: View) => void }) {
  const entries = [...workspaceNav, ...accountNav];
  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="mx-auto mt-24 w-[min(680px,calc(100vw-32px))] rounded-md border border-yellow bg-elevated shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-grid p-3">
          <Command size={16} className="text-yellow" />
          <input autoFocus className="w-full bg-transparent text-sm outline-none placeholder:text-dim" placeholder=": open investors, search maya, export csv..." />
          <kbd className="text-xs text-muted">esc</kbd>
        </div>
        <div className="p-2">
          {entries.map((entry) => {
            const Icon = entry.icon;
            return (
              <button
                key={entry.id}
                className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-hover"
                onClick={() => {
                  setActiveView(entry.id);
                  onClose();
                }}
              >
                <Icon size={15} className="text-muted" />
                <span>{entry.label}</span>
                <span className="ml-auto text-[11px] text-muted">open</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
