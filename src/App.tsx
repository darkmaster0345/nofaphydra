import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Journal from "./pages/Journal";
import Join from "./pages/Join";
import Vitals from "./pages/Vitals";
import NotFound from "./pages/NotFound";
import { NostrProvider } from "./context/NostrContext";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { PageTransition } from "./components/PageTransition";

const queryClient = new QueryClient();

// Internal component to handle location-based transitions
const AnimatedRoutes = () => {
  return (
    <PageTransition>
      <Routes>
        <Route path='/' element={<Index />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/journal' element={<Journal />} />
        <Route path='/vitals' element={<Vitals />} />
        <Route path='/community' element={<Community />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/join' element={<Join />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => {
  useEffect(() => {
    console.log("[FURSAN] App component mounted");
    document.title = "NoFap Fursan";
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <NostrProvider>
              <Toaster />
              <Sonner />
              <HashRouter>
                <AnimatedRoutes />
              </HashRouter>
            </NostrProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
