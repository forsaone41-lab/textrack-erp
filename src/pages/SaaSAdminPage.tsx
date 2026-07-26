import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SaaSGodModeAdminModal from '../components/Tools/SaaSGodModeAdminModal';
import { PageLoader } from '../components/PageLoader';

export default function SaaSAdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user || null;
        setCurrentUser(user);

        const { data: storesData } = await supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false });

        if (storesData) {
          setStores(storesData);
        }
      } catch (err) {
        console.error('Error in SaaSAdminPage init:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <SaaSGodModeAdminModal
        isOpen={true}
        onClose={() => {
          window.location.hash = '#/';
        }}
        currentUser={currentUser}
        stores={stores}
        onRefreshStores={() => window.location.reload()}
        isAr={true}
      />
    </div>
  );
}
