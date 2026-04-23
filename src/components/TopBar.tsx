import { Bell, Moon, Sun, LogOut, ChevronDown, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { mockNotifications } from '@/data/mock-data';
import type { UserRole } from '@/data/mock-data';

export function TopBar() {
  const { user, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const unreadCount = mockNotifications.filter(n => n.userId === user?.id && !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="h-14 border-b flex items-center gap-3 px-4 bg-card/80 backdrop-blur shrink-0 sticky top-0 z-30">
      <SidebarTrigger className="shrink-0" />

      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search items, locations, categories..."
          className="w-72 lg:w-96 h-9 pl-9 bg-background/60 text-sm"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          size="sm"
          className="hidden sm:inline-flex h-8 gap-1"
          onClick={() => navigate('/app/post?type=lost')}
        >
          <Plus className="h-3.5 w-3.5" />Report
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          )}
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-2 px-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-rose-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium">{user?.name}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{user?.role}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">
              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-muted-foreground font-normal">{user?.email}</span>
              </div>
              <Badge variant="secondary" className="mt-2 text-[10px] px-1.5 capitalize">{user?.role}</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Switch role (demo)</DropdownMenuLabel>
            {(['student', 'moderator', 'admin'] as UserRole[]).map(role => (
              <DropdownMenuItem key={role} onClick={() => switchRole(role)} className="text-xs capitalize">
                {role} {user?.role === role && '✓'}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-xs text-destructive">
              <LogOut className="h-3.5 w-3.5 mr-2" />Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
