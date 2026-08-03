import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import "leaflet/dist/leaflet.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { SosProvider } from "./context/SosContext.tsx";
import SosIncomingOverlay from "./components/Sos/SosIncomingOverlay.tsx";
import SosActiveCallBar from "./components/Sos/SosActiveCallBar.tsx";
import Footer from "./components/footer/Footer.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { queryClient } from "./lib/queryClient.ts";
import ErrorBoundary from "./components/common/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/*
            SosProvider sits inside AuthProvider (it needs the admin token) and
            inside QueryClientProvider (it invalidates SOS queries on incoming
            alerts). The overlay and call bar are siblings of <App/>, like
            <Toaster/> — they must NOT live inside a page, because AppLayout
            renders <main key={location.pathname}> and would remount them on
            every navigation, dropping a live emergency call.
          */}
          <SosProvider>
            <ThemeProvider>
              <AppWrapper>
                <ErrorBoundary>
                  <App />
                  <Footer />
                </ErrorBoundary>
                <Toaster position="top-right" richColors closeButton />
                <SosIncomingOverlay />
                <SosActiveCallBar />
              </AppWrapper>
            </ThemeProvider>
          </SosProvider>
        </AuthProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
