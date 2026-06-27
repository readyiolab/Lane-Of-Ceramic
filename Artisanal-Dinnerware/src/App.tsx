import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import CookieConsent from "@/components/layout/CookieConsent";
import Home from "@/pages/Home";
import Drinkware from "@/pages/Drinkware";
import Tableware from "@/pages/Tableware";
import Serveware from "@/pages/Serveware";
import Kitchenware from "@/pages/Kitchenware";
import About from "@/pages/About";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ProductDetail from "@/pages/ProductDetail";
import BundleBuilder from "@/pages/BundleBuilder";
import Checkout from "@/pages/Checkout";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
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
