import { UtensilsCrossed, Store, Bike } from 'lucide-react';
import type { Role } from '@/types';

interface NavbarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

const ROLES: { id: Role; label: string; icon: typeof UtensilsCrossed; description: string }[] = [
  { id: 'customer', label: 'Customer', icon: UtensilsCrossed, description: 'Browse & order' },
  { id: 'restaurant', label: 'Restaurant', icon: Store, description: 'Kitchen orders' },
  { id: 'delivery', label: 'Delivery', icon: Bike, description: 'Pickup & deliver' },
];

export function Navbar({ role, onRoleChange }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-soft">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-sans text-lg font-extrabold tracking-tight text-stone-900">Forkly</p>
            <p className="hidden text-xs font-medium text-stone-400 sm:block">Food, delivered fresh</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 rounded-2xl bg-stone-100 p-1">
          {ROLES.map(({ id, label, icon: Icon }) => {
            const active = role === id;
            return (
              <button
                key={id}
                onClick={() => onRoleChange(id)}
                className={`group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 sm:px-4 ${
                  active
                    ? 'bg-white text-brand-700 shadow-soft'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                aria-pressed={active}
              >
                <Icon className={`h-4 w-4 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
