import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import CookieConsent from "@/components/layout/CookieConsent";
import Home from "@/pages/Home";

// Lazy-loaded pages — only downloaded when the user navigates to them
const Drinkware = lazy(() => import("@/pages/Drinkware"));
const Tableware = lazy(() => import("@/pages/Tableware"));
const Serveware = lazy(() => import("@/pages/Serveware"));
const Kitchenware = lazy(() => import("@/pages/Kitchenware"));
const About = lazy(() => import("@/pages/About"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const BundleBuilder = lazy(() => import("@/pages/BundleBuilder"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#D6CBB7]">
      <p className="text-[#3E3A06] font-medium animate-pulse">Loading...</p>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/bundles/:type" component={BundleBuilder} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/drinkware" component={Drinkware} />
        <Route path="/tableware" component={Tableware} />
        <Route path="/serveware" component={Serveware} />
        <Route path="/kitchenware" component={Kitchenware} />
        <Route path="/about" component={About} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AnnouncementBar />
            <Header />
            <Router />
            <Footer />
            <CartDrawer />
            <CookieConsent />
          </WouterRouter>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
