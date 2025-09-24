import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Settings, LogOut, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton }) => {
  const { user, logout } = useAuth();
  const badgeContext = useBadgeContextOptional();

  if (!user) return null;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Menu */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <Button variant="ghost" size="sm" onClick={onMenuClick}>
              <Menu className="h-4 w-4" />
            </Button>
          )}
          
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="gradient-primary rounded-lg p-2">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ActiveLearn Hub
            </span>
          </motion.div>
        </div>

        {/* User Name */}
        <div className="flex items-center">
          <span className="text-sm font-medium text-foreground">
            {user.name}
          </span>
        </div>
      </div>
    </motion.header>
  );
};