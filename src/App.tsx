import {
  Activity,
  Bell,
  Bot,
  CalendarDays,
  ChevronLeft,
  Command,
  CreditCard,
  DollarSign,
  FileText,
  Gauge,
  Home,
  Inbox,
  LineChart as LineChartIcon,
  Link,
  Mail,
  Menu,
  MessageSquare,
  Network,
  Search,
  Send,
  Settings,
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
import type { ReactNode } from 'react';

type View = 'dashboard' | 'outreach' | 'money' | 'settings' | 'billing';
type OutreachTab = 'campaigns' | 'contacts' | 'sequences' | 'templates' | 'linkedin' | 'social' | 'analytics';

type NavItem<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

type Stat = {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  tone?: 'yellow' | 'green' | 'red' | 'blue';
};

const mainNav: NavItem<View>[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'outreach', label: 'Outreach', icon: Send },
  { id: 'money', label: 'Money', icon: DollarSign },
];

const accountNav: NavItem<View>[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const outreachTabs: NavItem<OutreachTab>[] = [
  { id: 'campaigns', label: 'Campaigns', icon: Gauge },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'sequences', label: 'Sequences', icon: Network },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'linkedin', label: 'LinkedIn', icon: Link },
  { id: 'social', label: 'Social', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: LineChartIcon },
];

const pageTitles: Record<View, string> = {
  dashboard: 'Command Center',
  outreach: 'Outreach',
  money: 'Money Stats',
  settings: 'Settings',
  billing: 'Billing',
};

const trendData = [
  { day: 'Mon', sent: 42, reply: 18, meetings: 2, mrr: 1200, cash: 182 },
  { day: 'Tue', sent: 56, reply: 21, meetings: 3, mrr: 1280, cash: 180 },
  { day: 'Wed', sent: 50, reply: 16, meetings: 2, mrr: 1290, cash: 178 },
  { day: 'Thu', sent: 64, reply: 27, meetings: 5, mrr: 1390, cash: 176 },
  { day: 'Fri', sent: 48, reply: 24, meetings: 4, mrr: 1510, cash: 174 },
  { day: 'Sat', sent: 20, reply: 31, meetings: 2, mrr: 1530, cash: 173 },
  { day: 'Sun', sent: 18, reply: 28, meetings: 3, mrr: 1575, cash: 172 },
];

const monthlyMoney = Array.from({ length: 10 }, (_, index) => ({
  month: `M${index + 1}`,
  mrr: 2800 + index * 920 + (index % 3) * 240,
  revenue: 4100 + index * 1180,
  burn: 18800 + index * 360,
  runway: 16.5 - index * 0.42,
}));

const campaigns = [
  { name: 'Design partner push', type: 'Customers', status: 'Active', progress: 71, sent: 388, open: '62%', reply: '24%', meetings: 18, last: '12m' },
  { name: 'Agency operators', type: 'Partners', status: 'Draft', progress: 16, sent: 42, open: '48%', reply: '31%', meetings: 5, last: '2h' },
  { name: 'Founder newsletter', type: 'Content', status: 'Paused', progress: 44, sent: 820, open: '41%', reply: '9%', meetings: 7, last: '1d' },
];

const contacts = [
  { name: 'Leah Kim', title: 'Founder', company: 'Tandem', email: 'verified', source: 'CSV', enriched: true, campaign: 'Design partner push', status: 'in sequence', last: 'today' },
  { name: 'Marco Pena', title: 'CEO', company: 'Vector', email: 'verified', source: 'LinkedIn', enriched: true, campaign: 'Agency operators', status: 'replied', last: '1d' },
  { name: 'Nadia Shah', title: 'Growth', company: 'Orbit', email: 'risky', source: 'Inbound', enriched: false, campaign: 'Design partner push', status: 'not contacted', last: '2d' },
  { name: 'Evan Ross', title: 'Founder', company: 'Relay', email: 'verified', source: 'Manual', enriched: true, campaign: 'Founder newsletter', status: 'meeting booked', last: '3d' },
  { name: 'Ava Li', title: 'Ops Lead', company: 'Northline', email: 'invalid', source: 'CSV', enriched: false, campaign: 'none', status: 'bounced', last: '4d' },
];

const aiProviders = [
  { name: 'Ollama local', model: 'llama3.1 / mistral', cost: 'free self-hosted', status: 'active' },
  { name: 'LM Studio', model: 'OpenAI-compatible local', cost: 'free self-hosted', status: 'ready' },
  { name: 'Hugging Face', model: 'serverless endpoint', cost: 'free tier key', status: 'configure' },
  { name: 'OpenRouter', model: 'free model presets', cost: 'free quota varies', status: 'configure' },
  { name: 'Gemini', model: 'Flash free tier', cost: 'free tier key', status: 'configure' },
  { name: 'Claude', model: 'claude-sonnet-4-20250514', cost: 'paid fallback', status: 'optional' },
];

const integrations: Array<{ name: string; desc: string; icon: LucideIcon }> = [
  { name: 'Resend', desc: 'send, inbound replies, webhooks', icon: Mail },
  { name: 'Stripe', desc: 'revenue and subscription events', icon: DollarSign },
  { name: 'PostHog / Plausible', desc: 'activation and conversion metrics', icon: LineChartIcon },
  { name: 'Apollo / Hunter', desc: 'contact enrichment and email verification', icon: Users },
  { name: 'PhantomBuster', desc: 'LinkedIn queue execution', icon: Link },
  { name: 'Twitter/X API', desc: 'engagement and DM automation', icon: MessageSquare },
];

export function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [activeOutreachTab, setActiveOutreachTab] = useState<OutreachTab>('campaigns');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('foundry-sidebar') === 'collapsed');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('foundry-sidebar', collapsed ? 'collapsed' : 'open');
  }, [collapsed]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') setSearchOpen(false);
      if (!searchOpen && (key === 'j' || key === 'k')) {
        const all = [...mainNav, ...accountNav];
        const index = all.findIndex((item) => item.id === activeView);
        setActiveView(all[(index + (key === 'j' ? 1 : -1) + all.length) % all.length].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeView, searchOpen]);

  const content = useMemo(() => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'outreach':
        return <Outreach activeTab={activeOutreachTab} setActiveTab={setActiveOutreachTab} />;
      case 'money':
        return <Money />;
      case 'settings':
        return <SettingsView />;
      case 'billing':
        return <Billing />;
    }
  }, [activeView, activeOutreachTab]);

  return (
    <div className="min-h-screen bg-canvas font-mono text-ink">
      <StatusBar />
      <aside className={`fixed bottom-6 left-0 top-7 z-30 border-r border-grid bg-panel transition-all ${collapsed ? 'w-12' : 'w-[220px]'}`}>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center gap-2 border-b border-grid px-3">
            <button className="icon-control" aria-label="Toggle sidebar" onClick={() => setCollapsed((value) => !value)}>
              {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
            </button>
            {!collapsed && (
              <div>
                <div className="text-sm text-ink">Foundry</div>
                <div className="text-[10px] uppercase text-muted">outreach + money</div>
              </div>
            )}
          </div>
          <NavSection title="foundry" items={mainNav} activeView={activeView} setActiveView={setActiveView} collapsed={collapsed} />
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

      <main className={`min-h-screen pb-6 pt-7 transition-all ${collapsed ? 'pl-12' : 'pl-[220px]'}`}>
        <header className="sticky top-7 z-20 flex h-16 items-center justify-between border-b border-grid bg-canvas/95 px-5 backdrop-blur">
          <div>
            <div className="text-[10px] uppercase text-muted">foundry · {activeView}</div>
            <h1 className="text-xl leading-tight text-ink">{pageTitles[activeView]}</h1>
          </div>
          <button className="search-strip" onClick={() => setSearchOpen(true)}>
            <Search size={15} />
            <span>search contacts, campaigns, replies</span>
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
        <span className="text-yellow">ok: j/k nav · cmd+k search · ai drafts editable</span>
        <span>api: fastapi · ai: free-first provider router · jobs: apscheduler/rq scaffold</span>
      </div>

      {searchOpen && <CommandPalette onClose={() => setSearchOpen(false)} setActiveView={setActiveView} />}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-40 flex h-7 items-center justify-between border-b border-grid bg-panel px-3 text-[11px] text-muted">
      <div className="flex items-center gap-2">
        <span className="text-yellow">foundry</span>
        <span>·</span>
        <span>workspace / go-to-market / default</span>
      </div>
      <div className="flex items-center gap-3">
        <span>ai: ollama local</span>
        <span className="text-greenline">status: draft-only</span>
      </div>
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
  items: NavItem<View>[];
  activeView: View;
  setActiveView: (view: View) => void;
  collapsed: boolean;
}) {
  return (
    <div className="py-3">
      {!collapsed && <div className="px-3 pb-2 text-[10px] uppercase text-dim">-- {title} --</div>}
      <div className="space-y-1 px-1.5">
        {items.map((item) => (
          <NavButton key={item.id} item={item} active={item.id === activeView} collapsed={collapsed} onClick={() => setActiveView(item.id)} />
        ))}
      </div>
    </div>
  );
}

function NavButton<T extends string>({ item, active, collapsed, onClick }: { item: NavItem<T>; active: boolean; collapsed: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button className={`nav-item ${active ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`} title={item.label} onClick={onClick}>
      <Icon size={15} />
      {!collapsed && <span>{item.label}</span>}
    </button>
  );
}

function Dashboard({ setActiveView }: { setActiveView: (view: View) => void }) {
  const stats: Stat[] = [
    { label: 'MRR', value: '$15.7k', delta: '+12.4%', icon: DollarSign },
    { label: 'cash runway', value: '13.4mo', delta: '$172k cash', icon: Gauge, tone: 'green' },
    { label: 'meetings booked', value: '28', delta: '+9 this week', icon: CalendarDays, tone: 'blue' },
    { label: 'reply rate', value: '24%', delta: '+3.1 pts', icon: Mail },
  ];

  return (
    <ModuleStack>
      <section className="panel-card border-yellow/60">
        <PanelHeader eyebrow="daily brief · editable ai output" title="What needs attention" badge="draft" />
        <div className="grid gap-3 text-sm text-muted md:grid-cols-3">
          <p>Outreach is producing booked calls at a lower cost than paid acquisition. Keep the Design partner push active and increase the daily cap from 50 to 70.</p>
          <p>Cash remains stable, but burn is trending up by $360 per month. Revenue growth covers it if the current 24% reply rate holds.</p>
          <p className="text-ink">Next moves: enrich 38 risky contacts, launch the inbound fast-follow sequence, and pause the losing subject variant.</p>
        </div>
      </section>

      <StatGrid stats={stats} />

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="panel-card">
          <PanelHeader title="Operating queue" badge="ai ranked" />
          {['38 contacts need enrichment before next send window.', 'Variant B is underperforming by 8.2 reply-rate points.', '5 inbound leads are waiting for first-response approval.', 'LinkedIn queue has 14 eligible connection requests.'].map((item, index) => (
            <ActionRow key={item} index={index + 1} text={item} action="open" onClick={() => setActiveView('outreach')} />
          ))}
        </section>
        <section className="panel-card">
          <PanelHeader title="Money pulse" badge="stripe" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyMoney}>
                <CartesianGrid stroke="#2A2A2A" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="mrr" stroke="#E5C07B" strokeWidth={2} />
                <Line type="monotone" dataKey="burn" stroke="#E06C6C" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {[
          ['sent', 'sent'],
          ['reply rate', 'reply'],
          ['meetings', 'meetings'],
          ['cash', 'cash'],
        ].map(([label, key]) => (
          <SparkCard key={label} label={label} dataKey={key} />
        ))}
      </div>
    </ModuleStack>
  );
}

function Outreach({ activeTab, setActiveTab }: { activeTab: OutreachTab; setActiveTab: (tab: OutreachTab) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[180px_minmax(0,1fr)_320px]">
      <section className="panel-card h-fit">
        <PanelHeader title="Outreach" badge="module" />
        <div className="space-y-1">
          {outreachTabs.map((tab) => (
            <NavButton key={tab.id} item={tab} active={tab.id === activeTab} collapsed={false} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>
      </section>
      <section className="min-w-0">{renderOutreachTab(activeTab)}</section>
      <ContextPanel activeTab={activeTab} />
    </div>
  );
}

function renderOutreachTab(activeTab: OutreachTab) {
  switch (activeTab) {
    case 'campaigns':
      return <CampaignsTab />;
    case 'contacts':
      return <ContactsTab />;
    case 'sequences':
      return <SequencesTab />;
    case 'templates':
      return <TemplatesTab />;
    case 'linkedin':
      return <LinkedInTab />;
    case 'social':
      return <SocialTab />;
    case 'analytics':
      return <OutreachAnalyticsTab />;
  }
}

function CampaignsTab() {
  return (
    <ModuleStack>
      <Toolbar items={['new campaign', 'wizard', 'export csv']} active="new campaign" />
      <div className="grid gap-3 2xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <section className="panel-card" key={campaign.name}>
            <PanelHeader title={campaign.name} badge={campaign.status} />
            <div className="mb-3 text-xs text-muted">{campaign.type} · last activity {campaign.last}</div>
            <Progress value={campaign.progress} />
            <div className="mt-4 grid grid-cols-4 gap-2">
              <MiniStat value={String(campaign.sent)} label="sent" />
              <MiniStat value={campaign.open} label="open" />
              <MiniStat value={campaign.reply} label="reply" />
              <MiniStat value={String(campaign.meetings)} label="meetings" />
            </div>
            <div className="mt-4 flex gap-2">
              {['pause', 'duplicate', 'archive'].map((item) => <span className="badge" key={item}>{item}</span>)}
            </div>
          </section>
        ))}
      </div>
      <WizardPreview />
    </ModuleStack>
  );
}

function ContactsTab() {
  return (
    <ModuleStack>
      <Toolbar items={['status', 'source', 'campaign', 'enriched', 'date', 'tags']} active="status" />
      <section className="panel-card overflow-auto">
        <table className="data-table">
          <thead>
            <tr>{['', 'Name', 'Title', 'Company', 'Email', 'Source', 'Enriched', 'Campaign', 'Status', 'Last'].map((head) => <th key={head}>{head}</th>)}</tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.name}>
                <td><input type="checkbox" aria-label={`Select ${contact.name}`} /></td>
                <td><div className="flex items-center gap-2"><Avatar name={contact.name} />{contact.name}</div></td>
                <td>{contact.title}</td>
                <td>{contact.company}</td>
                <td><span className={`badge ${contact.email === 'verified' ? 'green' : contact.email === 'invalid' ? 'red' : 'yellow'}`}>{contact.email}</span></td>
                <td>{contact.source}</td>
                <td>{contact.enriched ? <span className="badge green">yes</span> : <span className="badge">no</span>}</td>
                <td>{contact.campaign}</td>
                <td>{contact.status}</td>
                <td>{contact.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="grid gap-3 lg:grid-cols-3">
        {['CSV import + mapping', 'LinkedIn CSV import', 'Manual add drawer'].map((title) => <AbstractionCard key={title} title={title} lines={['validate', 'dedupe', 'enrich async']} />)}
      </div>
    </ModuleStack>
  );
}

function SequencesTab() {
  const nodes = ['Email · day 0', 'Wait · 3d', 'Condition · opened?', 'Email A/B', 'LinkedIn connect', 'End'];
  return (
    <ModuleStack>
      <Toolbar items={['cold email', 'warm intro', 'inbound fast-follow']} active="cold email" />
      <section className="panel-card">
        <PanelHeader title="Sequence builder" badge="adaptive" />
        <div className="grid gap-3 lg:grid-cols-6">
          {nodes.map((node, index) => (
            <div className="sequence-node" key={node}>
              <div className="text-yellow">{String(index + 1).padStart(2, '0')}</div>
              <div className="mt-3 text-sm">{node}</div>
              <div className="mt-2 text-[11px] text-muted">{index < nodes.length - 1 ? 'routes next step' : 'complete'}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-3 lg:grid-cols-3">
        {['evaluate condition', 'send window guard', 'daily cap guard'].map((title) => <AbstractionCard key={title} title={title} lines={['redis counter', 'timezone aware', 'pause on reply']} />)}
      </div>
    </ModuleStack>
  );
}

function TemplatesTab() {
  return (
    <ModuleStack>
      <Toolbar items={['editor', 'variables', 'preview', 'quality check']} active="editor" />
      <section className="panel-card grid gap-4 lg:grid-cols-[1fr_260px]">
        <div>
          <label className="field-label">subject</label>
          <div className="input-shell">quick question about {'{{company}}'} growth</div>
          <label className="field-label mt-4">body</label>
          <div className="editor-shell">
            <p>Hi {'{{first_name}}'},</p>
            <p>{'{{personalized_opener}}'}</p>
            <p>Foundry helps founders turn raw contacts into booked meetings with AI-personalized sequences. Worth a 15 minute compare-notes call?</p>
          </div>
        </div>
        <div>
          <PanelHeader title="Variables" badge="insert" />
          {['first_name', 'company', 'title', 'personalized_opener', 'industry', 'company_size'].map((variable) => <div className="list-row" key={variable}>{`{{${variable}}}`}</div>)}
        </div>
      </section>
    </ModuleStack>
  );
}

function LinkedInTab() {
  return (
    <ModuleStack>
      <Toolbar items={['connection requests', 'messages']} active="connection requests" />
      <section className="panel-card overflow-auto">
        <table className="data-table">
          <thead>
            <tr>{['Name', 'Company', 'Title', 'Status', 'Sent date', 'Note'].map((head) => <th key={head}>{head}</th>)}</tr>
          </thead>
          <tbody>
            {contacts.slice(0, 4).map((contact, index) => (
              <tr key={contact.name}>
                <td>{contact.name}</td><td>{contact.company}</td><td>{contact.title}</td><td>{index % 2 ? 'accepted' : 'pending'}</td><td>{contact.last}</td><td>ai note queued</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <AbstractionCard title="Safety layer" lines={['20/day max', '2-5 minute gap', 'pause on warning', 'skip email replies']} />
    </ModuleStack>
  );
}

function SocialTab() {
  return (
    <ModuleStack>
      <Toolbar items={['x engagement', 'content calendar', 'newsletter', 'inbound forms']} active="content calendar" />
      <section className="panel-card">
        <PanelHeader title="Content calendar" badge="weekly" />
        <div className="grid gap-2 md:grid-cols-7">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div className="calendar-cell" key={day}>
              <div className="text-yellow">{day}</div>
              <div className="mt-3 text-xs text-muted">{index % 2 ? 'LinkedIn post' : 'Newsletter section'}</div>
              <span className="badge mt-4">{index < 5 ? 'draft' : 'empty'}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-3 lg:grid-cols-3">
        {['Twitter thread', 'LinkedIn post', 'Newsletter section'].map((title) => <AbstractionCard key={title} title={title} lines={['3 variants', 'edit inline', 'schedule']} />)}
      </div>
    </ModuleStack>
  );
}

function OutreachAnalyticsTab() {
  const funnel = [
    { name: 'sent', value: 1240 },
    { name: 'opened', value: 744 },
    { name: 'replied', value: 298 },
    { name: 'booked', value: 74 },
  ];
  return (
    <ModuleStack>
      <StatGrid stats={[
        { label: 'total sent', value: '1,240', delta: 'this month', icon: Send },
        { label: 'open rate', value: '60%', delta: '+4 pts', icon: Mail },
        { label: 'reply rate', value: '24%', delta: '+3 pts', icon: Inbox },
        { label: 'meetings booked', value: '74', delta: '+18', icon: CalendarDays },
      ]} />
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel-card">
          <PanelHeader title="Reply rate over time" badge="30d" />
          <ChartLine data={trendData} keys={['reply', 'meetings']} />
        </section>
        <section className="panel-card">
          <PanelHeader title="Funnel" badge="step" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnel}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value">
                {funnel.map((_, index) => <Cell key={index} fill={['#E5C07B', '#7BB7C7', '#9CC88E', '#B78FD4'][index]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
      <section className="panel-card">
        <PanelHeader title="A/B results" badge="significance pending" />
        <div className="grid gap-3 md:grid-cols-2">
          <MiniStat value="A · 27%" label="control reply rate" />
          <MiniStat value="B · 18.8%" label="challenger reply rate" />
        </div>
      </section>
    </ModuleStack>
  );
}

function ContextPanel({ activeTab }: { activeTab: OutreachTab }) {
  return (
    <section className="panel-card h-fit">
      <PanelHeader title="Context" badge={activeTab} />
      <div className="space-y-3">
        <PreviewBlock label="Selected contact" value="Leah Kim · Founder at Tandem" />
        <PreviewBlock label="Email preview" value="AI opener resolved from enrichment context before launch." />
        <AiWorkbench />
      </div>
    </section>
  );
}

function AiWorkbench() {
  const [draft, setDraft] = useState('Click generate to test the configured AI provider route.');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer demo-token',
        },
        body: JSON.stringify({
          feature: 'personalized_opener',
          context: {
            contact: 'Leah Kim, Founder at Tandem',
            enrichment_context: 'Tandem just launched a workflow automation feature for small teams and Leah writes about founder-led sales.',
          },
        }),
      });
      const data = await response.json();
      setDraft(data.draft ?? data.detail ?? 'No draft returned.');
    } catch (error) {
      setDraft(error instanceof Error ? error.message : 'AI request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-sm border border-grid bg-panel p-3">
      <div className="mb-2 flex items-center gap-2 text-sm text-yellow"><Bot size={15} /> AI draft route</div>
      <p className="text-xs leading-5 text-muted">{draft}</p>
      <button className="badge yellow mt-3" onClick={generate} disabled={loading}>{loading ? 'generating' : 'generate'}</button>
    </div>
  );
}

function Money() {
  return (
    <ModuleStack>
      <StatGrid stats={[
        { label: 'MRR', value: '$15.7k', delta: '+12.4%', icon: DollarSign },
        { label: 'cash balance', value: '$172k', delta: '13.4mo runway', icon: CreditCard, tone: 'green' },
        { label: 'monthly burn', value: '$31k', delta: '+$360', icon: Activity, tone: 'red' },
        { label: 'conversion', value: '8.7%', delta: '+1.2 pts', icon: Gauge },
      ]} />
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <section className="panel-card">
          <PanelHeader title="Revenue vs burn" badge="stripe" />
          <ChartLine data={monthlyMoney} keys={['mrr', 'burn']} />
        </section>
        <section className="panel-card">
          <PanelHeader title="Runway" badge="cash" />
          <div className="mt-6 text-5xl text-greenline">13.4</div>
          <div className="mt-2 text-sm text-muted">months remaining at current burn</div>
          <Progress value={67} />
        </section>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {['Top traffic sources', 'Revenue by cohort', 'Conversion funnel'].map((title) => <AbstractionCard key={title} title={title} lines={['stripe', 'analytics', 'postgres aggregate']} />)}
      </div>
    </ModuleStack>
  );
}

function SettingsView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <section className="panel-card">
        <PanelHeader title="Integrations" badge="connectors" />
        <div className="grid gap-3 md:grid-cols-2">
          {integrations.map(({ name, desc, icon: Icon }) => (
            <div className="integration-card" key={name}>
              <Icon size={18} />
              <div><div>{name}</div><div className="text-xs text-muted">{desc}</div></div>
              <span className="badge ml-auto">connect</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel-card">
        <PanelHeader title="AI providers" badge="free-first" />
        <p className="mb-4 text-sm text-muted">Foundry routes AI work through a provider abstraction. Local and free providers are tried first; Claude remains an optional paid fallback.</p>
        {aiProviders.map((provider) => (
          <div className="provider-row" key={provider.name}>
            <Bot size={16} className="text-yellow" />
            <div className="min-w-0">
              <div className="truncate text-sm">{provider.name}</div>
              <div className="truncate text-[11px] text-muted">{provider.model} · {provider.cost}</div>
            </div>
            <span className="badge ml-auto">{provider.status}</span>
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
        ['Solo', '$19', '1 user · outreach + money stats · 500 emails/mo'],
        ['Team', '$49', '3 users · unlimited emails · all integrations'],
        ['Growth', '$199', 'white label · unlimited users · automation queues'],
      ].map(([name, price, details], index) => (
        <section className={`panel-card ${index === 0 ? 'border-yellow/70' : ''}`} key={name}>
          <PanelHeader title={name} badge={index === 0 ? 'current' : 'stripe'} />
          <div className="text-4xl text-yellow">{price}<span className="text-sm text-muted">/mo</span></div>
          <p className="mt-4 text-sm text-muted">{details}</p>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted"><CreditCard size={14} /> plan gates enforced by API middleware</div>
        </section>
      ))}
    </div>
  );
}

function ModuleStack({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function PanelHeader({ title, badge, eyebrow }: { title: string; badge?: string; eyebrow?: string }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {badge && <span className="badge yellow">{badge}</span>}
    </div>
  );
}

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-4">
      {stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  const color = stat.tone === 'green' ? 'text-greenline' : stat.tone === 'red' ? 'text-redline' : stat.tone === 'blue' ? 'text-teBlue' : 'text-yellow';
  return (
    <div className="metric-card">
      <Icon size={16} className="text-muted" />
      <div className={`mt-4 text-2xl ${color}`}>{stat.value}</div>
      <div className="text-[11px] uppercase text-muted">{stat.label}</div>
      <div className="mt-2 text-xs text-greenline">{stat.delta}</div>
    </div>
  );
}

function SparkCard({ label, dataKey }: { label: string; dataKey: string }) {
  return (
    <section className="panel-card h-36">
      <div className="mb-2 text-xs uppercase text-muted">{label}</div>
      <ResponsiveContainer width="100%" height="75%">
        <LineChart data={trendData}>
          <Line type="monotone" dataKey={dataKey} stroke="#E5C07B" strokeWidth={2} dot={false} />
          <Tooltip contentStyle={tooltipStyle} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

function ChartLine({ data, keys }: { data: Array<Record<string, string | number>>; keys: string[] }) {
  const colors = ['#E5C07B', '#E06C6C', '#7BB7C7'];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="#2A2A2A" />
        <XAxis dataKey={data[0].month ? 'month' : 'day'} stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip contentStyle={tooltipStyle} />
        {keys.map((key, index) => <Line key={key} type="monotone" dataKey={key} stroke={colors[index]} strokeWidth={2} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}

function Toolbar({ items, active }: { items: string[]; active: string }) {
  return (
    <div className="toolbar">
      {items.map((item) => <span className={`badge ${item === active ? 'yellow' : ''}`} key={item}>{item}</span>)}
    </div>
  );
}

function ActionRow({ index, text, action, onClick }: { index: number; text: string; action: string; onClick: () => void }) {
  return (
    <button className="list-row flex w-full text-left" onClick={onClick}>
      <span className="index">{String(index).padStart(2, '0')}</span>
      <span>{text}</span>
      <span className="ml-auto text-yellow">{action}</span>
    </button>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="mini-stat">
      <div className="text-sm text-ink">{value}</div>
      <div className="mt-1 text-[10px] uppercase text-muted">{label}</div>
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return <div className="mt-3 h-1.5 bg-active"><div className="h-full bg-yellow" style={{ width: `${value}%` }} /></div>;
}

function Avatar({ name }: { name: string }) {
  return <span className="grid h-7 w-7 place-items-center rounded-sm border border-grid bg-active text-[10px] text-yellow">{name.split(' ').map((part) => part[0]).join('')}</span>;
}

function PreviewBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-grid bg-panel p-3">
      <div className="text-[10px] uppercase text-muted">{label}</div>
      <div className="mt-2 text-sm text-ink">{value}</div>
    </div>
  );
}

function AbstractionCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <section className="panel-card bg-panel">
      <PanelHeader title={title} badge="layer" />
      {lines.map((line) => <div className="feed-line" key={line}><span className="h-2 w-2 bg-yellow" /><span>{line}</span></div>)}
    </section>
  );
}

function WizardPreview() {
  return (
    <section className="panel-card">
      <PanelHeader title="Campaign wizard" badge="5 steps" />
      <div className="grid gap-3 lg:grid-cols-5">
        {['setup', 'contacts', 'sequence', 'templates', 'review'].map((step, index) => (
          <div className="sequence-node" key={step}>
            <div className="text-yellow">{String(index + 1).padStart(2, '0')}</div>
            <div className="mt-3 text-sm">{step}</div>
            <div className="mt-2 text-[11px] text-muted">abstracted panel</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CommandPalette({ onClose, setActiveView }: { onClose: () => void; setActiveView: (view: View) => void }) {
  const entries = [...mainNav, ...accountNav];
  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="mx-auto mt-24 w-[min(680px,calc(100vw-32px))] rounded-md border border-yellow bg-elevated shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-grid p-3">
          <Command size={16} className="text-yellow" />
          <input autoFocus className="w-full bg-transparent text-sm outline-none placeholder:text-dim" placeholder=": open outreach, search contact, generate opener..." />
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

const tooltipStyle = {
  background: '#262626',
  border: '1px solid #2A2A2A',
  color: '#F2F2F2',
};
