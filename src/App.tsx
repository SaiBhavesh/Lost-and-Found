import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/AppLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import DashboardPage from "@/pages/DashboardPage";
import ItemFeedPage from "@/pages/ItemFeedPage";
import PostItemPage from "@/pages/PostItemPage";
import ItemDetailPage from "@/pages/ItemDetailPage";
import MatchCenterPage from "@/pages/MatchCenterPage";
import MyPostsPage from "@/pages/MyPostsPage";
import CampusMapPage from "@/pages/CampusMapPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<PublicOnly><LandingPage /></PublicOnly>} />
              <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
              <Route path="/signup" element={<PublicOnly><SignUpPage /></PublicOnly>} />

              {/* Authenticated app */}
              <Route
                path="/app"
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="lost" element={<ItemFeedPage type="lost" />} />
                <Route path="found" element={<ItemFeedPage type="found" />} />
                <Route path="post" element={<PostItemPage />} />
                <Route path="item/:id" element={<ItemDetailPage />} />
                <Route path="map" element={<CampusMapPage />} />
                <Route path="matches" element={<MatchCenterPage />} />
                <Route path="my-posts" element={<MyPostsPage />} />
                <Route path="admin" element={<AdminPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
