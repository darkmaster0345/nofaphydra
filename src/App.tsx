import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Journal from "./pages/Journal";
import Join from "./pages/Join";
import NotFound from "./pages/NotFound";
import { NostrProvider } from "./context/NostrContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NostrProvider>
          <Toaster />
          <Sonner />
          <SpeedInsights />
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Index />} />
              <Route path='/auth' element={<Auth />} />
              <Route path='/journal' element={<Journal />} />
              <Route path='/community' element={<Community />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/join' element={<Join />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path='*' element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NostrProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
