import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BadgeNotification } from '@/components/shared/BadgeNotification';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const badgeContext = useBadgeContextOptional();

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuClick={handleMenuClick}
        showMenuButton={true}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
      
      {/* Badge Notification */}
      {badgeContext?.recentBadge && (
        <BadgeNotification
          badge={badgeContext.recentBadge}
          show={badgeContext.showNotification}
          onDismiss={badgeContext.dismissNotification}
        />
      )}
    </div>
  );
};