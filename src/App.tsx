import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CustomerPortal } from '@/views/CustomerPortal';
import { RestaurantDashboard } from '@/views/RestaurantDashboard';
import { DeliveryDashboard } from '@/views/DeliveryDashboard';
import type { Role } from '@/types';

function App() {
  const [role, setRole] = useState<Role>('customer');

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar role={role} onRoleChange={setRole} />
      <main>
        {role === 'customer' && <CustomerPortal />}
        {role === 'restaurant' && <RestaurantDashboard />}
        {role === 'delivery' && <DeliveryDashboard />}
      </main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-stone-400 sm:px-6">
          Forkly — a demo food delivery experience. Switch roles in the top bar to see orders flow live between customer, restaurant, and delivery.
        </div>
      </footer>
    </div>
  );
}

export default App;
