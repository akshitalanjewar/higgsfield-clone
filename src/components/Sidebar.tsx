import {
  Film,
  Megaphone,
  UserRound,
  Images,
  WandSparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type NavSection = 'cinema' | 'marketing' | 'soul-id' | 'gallery' | 'upscale';

type Props = {
  active: NavSection;
  onChange: (section: NavSection) => void;
  open: boolean;
  onToggle: () => void;
  historyCount: number;
};

const items = [
  {
    id: 'cinema' as const,
    label: 'Cinema Studio',
    icon: Film,
  },
  {
    id: 'marketing' as const,
    label: 'Marketing',
    icon: Megaphone,
  },
  {
    id: 'soul-id' as const,
    label: 'Soul ID',
    icon: UserRound,
  },
  {
    id: 'gallery' as const,
    label: 'Gallery',
    icon: Images,
  },
  {
    id: 'upscale' as const,
    label: 'Upscale',
    icon: WandSparkles,
  },
];

export function Sidebar({
  active,
  onChange,
  open,
  onToggle,
  historyCount,
}: Props) {
  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-dark-border bg-dark-bg transition-all duration-200 ${
        open ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-dark-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600">
          <span className="text-sm font-bold text-white">H</span>
        </div>

        {open && (
          <div className="ml-3 min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              Higgsfield
            </p>
            <p className="text-[10px] text-dark-muted">Studio Pro</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p
          className={`mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-dark-muted ${
            !open ? 'text-center' : ''
          }`}
        >
          {open ? 'Create' : '•••'}
        </p>

        <div className="space-y-1">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                title={!open ? item.label : undefined}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left transition ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400'
                    : 'text-slate-400 hover:bg-dark-surface hover:text-white'
                } ${!open ? 'justify-center' : ''}`}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className="shrink-0"
                />

                {open && (
                  <span className="ml-3 flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                )}

                {open && item.id === 'gallery' && historyCount > 0 && (
                  <span className="rounded-full bg-dark-card px-2 py-0.5 text-[10px] text-dark-muted">
                    {historyCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-dark-border p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2.5 text-dark-muted transition hover:bg-dark-surface hover:text-white"
          title={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {open ? (
            <>
              <ChevronLeft size={18} />
              <span className="ml-2 text-xs">Collapse</span>
            </>
          ) : (
            <ChevronRight size={18} />
          )}
        </button>
      </div>
    </aside>
  );
}