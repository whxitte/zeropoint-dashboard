import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";
import { isConfigured } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { SetupModal } from "@/components/SetupModal";
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

const queryClient = new QueryClient();

const App = () => {
  const [configured, setConfigured] = useState(isConfigured());

  if (!configured) {
    return (
      <QueryClientProvider client={queryClient}>
        <SetupModal onComplete={() => setConfigured(true)} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
