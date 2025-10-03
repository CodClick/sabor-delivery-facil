
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import Orders from "./pages/Orders";
import AdminOrders from "./pages/AdminOrders";
import Entregador from "./pages/Entregador";
import PDV from "./pages/PDV";
import Api from "./pages/Api";
import NotFound from "./pages/NotFound";
import ShoppingCart from "./components/ShoppingCart";
import ChatAssistant from "./components/ChatAssistant";
import Checkout from "./pages/Checkout";
import ForgotPassword from "./pages/ForgotPassword";
import AdminCupons from "@/pages/AdminCupons";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-full flex items-center justify-center">Carregando...</div>;
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin-dashboard" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute>
          <Admin />
        </AdminRoute>
      } />
      <Route path="/orders" element={<Orders />} />
      <Route path="/admin-orders" element={
        <AdminRoute>
          <AdminOrders />
        </AdminRoute>
      } />
      <Route path="/entregador" element={
        <AdminRoute>
          <Entregador />
        </AdminRoute>
      } />
      <Route path="/pdv" element={
        <AdminRoute>
          <PDV />
        </AdminRoute>
      } />

      <Route  path="/admin-cupons" element={
    <AdminRoute>
        <AdminCupons />
    </AdminRoute>
  }
/>
      
      <Route path="/api/*" element={<Api />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <ShoppingCart />
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
