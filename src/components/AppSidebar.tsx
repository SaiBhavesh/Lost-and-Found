import {
  LayoutDashboard, Search, MapPin, GitCompare, FileText, Shield, Plus, Map,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const mainNav = [
  { title: 'Dashboard', url: '/app', icon: LayoutDashboard },
  { title: 'Lost Items', url: '/app/lost', icon: Search },
  { title: 'Found Items', url: '/app/found', icon: MapPin },
  { title: 'Campus Map', url: '/app/map', icon: Map },
  { title: 'Matches', url: '/app/matches', icon: GitCompare },
  { title: 'My Posts', url: '/app/my-posts', icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-4 flex items-center gap-2 border-b">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">Lost &amp; Found</span>
              <span className="text-[10px] text-muted-foreground">Stevens Campus</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="px-3 pt-3">
            <Button
              className="w-full justify-start gap-2 h-9"
              onClick={() => navigate('/app/post?type=lost')}
            >
              <Plus className="h-4 w-4" />
              Report item
            </Button>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/app'}
                      className="hover:bg-accent rounded-md"
                      activeClassName="bg-primary/10 text-primary font-medium hover:bg-primary/15"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdminOrMod && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/app/admin"
                      className="hover:bg-accent rounded-md"
                      activeClassName="bg-primary/10 text-primary font-medium hover:bg-primary/15"
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>Moderation</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
