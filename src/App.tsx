import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { getPublicKey, generateSecretKey } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Install from "./pages/Install";
import Join from "./pages/Join";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const existingKey = localStorage.getItem("nostr_sk");
    if (!existingKey) {
      // Generate a new key if one doesn't exist
      const newSk = generateSecretKey();
      localStorage.setItem("nostr_sk", bytesToHex(newSk));
      console.log("New Nostr key generated and saved locally.");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Index />} />
            <Route path='/auth' element={<Auth />} />
            <Route path='/community' element={<Community />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/install' element={<Install />} />
            <Route path='/join' element={<Join />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
