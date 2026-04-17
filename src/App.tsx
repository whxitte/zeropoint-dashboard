import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api"; // Ensure apiFetch is updated for cookie handling
import { AppLayout } from "@/components/AppLayout";
import { LoginPage } from "./pages/LoginPage"; // Import the new LoginPage
import { LogoutHandler } from "./pages/LogoutHandler"; // Import the new LogoutHandler
import DashboardPage from "./pages/DashboardPage";
import AssetsPage from "./pages/AssetsPage";
import FindingsPage from "./pages/FindingsPage";
import SecretsPage from "./pages/SecretsPage";
import LeaksPage from "./pages/LeaksPage";
import PortsPage from "./pages/PortsPage";
import DorksPage from "./pages/DorksPage";
import EndpointsPage from "./pages/EndpointsPage";
import ReportPage from "./pages/ReportPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";


const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Auth check must hit a protected endpoint.
        await apiFetch<{ programs: any[] }>("/api/v1/programs/", { suppressAuthRedirect: true });
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutHandler />} />
          {isAuthenticated ? (
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/assets" element={<AssetsPage />} />
              <Route path="/findings" element={<FindingsPage />} />
              <Route path="/secrets" element={<SecretsPage />} />
              <Route path="/leaks" element={<LeaksPage />} />
              <Route path="/ports" element={<PortsPage />} />
              <Route path="/dorks" element={<DorksPage />} />
              <Route path="/endpoints" element={<EndpointsPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
