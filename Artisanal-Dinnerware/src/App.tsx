import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthSheet } from "./components/auth/AuthSheet";
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
const Orders = lazy(() => import("@/pages/Orders"));
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
      <div className="flex min-h-screen flex-col bg-[#FAF9F6] font-sans selection:bg-[#E8E3D9] selection:text-[#3E3A06]">
        <Header />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/product/:id" component={ProductDetail} />
            <Route path="/bundles/:type" component={BundleBuilder} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/orders" component={Orders} />
            <Route path="/drinkware" component={Drinkware} />
            <Route path="/tableware" component={Tableware} />
            <Route path="/serveware" component={Serveware} />
            <Route path="/kitchenware" component={Kitchenware} />
            <Route path="/about" component={About} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route>
              <div className="flex min-h-[50vh] items-center justify-center">
                <h1 className="font-serif text-3xl text-[#3E3A06]">
                  404 - Page Not Found
                </h1>
              </div>
            </Route>
          </Switch>
        </main>
        <Footer />
        <AuthSheet />
      </div>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AnnouncementBar />
            <Router />
            <CartDrawer />
            <CookieConsent />
          </WouterRouter>
          <Toaster />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
