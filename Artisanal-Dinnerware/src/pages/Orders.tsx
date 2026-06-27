import { useQuery } from "@tanstack/react-query";
import { fetchMyOrders } from "@/api/orders";
import { Package, Clock, Truck, CheckCircle, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

export default function Orders() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  if (!user) {
    setLocation("/login?redirect=/orders");
    return null;
  }

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock size={14} className="mr-1" />;
      case "shipped": return <Truck size={14} className="mr-1" />;
      case "delivered": return <CheckCircle size={14} className="mr-1" />;
      default: return <Package size={14} className="mr-1" />;
    }
  };

  return (
    <main className="min-h-[80vh] bg-[#D6CBB7] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3E3A06] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          My Orders
        </h1>

        {isLoading ? (
          <div className="text-center py-12 text-[#6E6E6E]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-[#E8E0D0] p-12 text-center rounded-sm">
            <Package size={48} className="mx-auto text-[#6B6A2A]/40 mb-4" />
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              No orders yet
            </h2>
            <p className="text-[#6E6E6E] mb-6">You haven't placed any orders with us.</p>
            <button
              onClick={() => setLocation("/")}
              className="px-6 py-2.5 bg-[#3E3A06] text-[#D6CBB7] font-medium hover:bg-[#6B6A2A] transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#E8E0D0] border border-[#6B6A2A]/20 shadow-sm">
                <div className="flex flex-wrap items-center justify-between p-4 bg-[#E0D8C8] border-b border-[#6B6A2A]/20 gap-4">
                  <div>
                    <p className="text-xs text-[#6E6E6E] uppercase font-semibold tracking-wide">Order ID</p>
                    <p className="text-sm font-bold text-[#1A1A1A] font-mono">{order.orderId || `ORD-${order.id}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6E6E6E] uppercase font-semibold tracking-wide">Date Placed</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6E6E6E] uppercase font-semibold tracking-wide">Total Amount</p>
                    <p className="text-sm font-bold text-[#3E3A06]">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      {order.previewItemImage ? (
                         <img src={order.previewItemImage} alt={order.previewItemName} className="w-16 h-16 object-cover border border-[#6B6A2A]/20" />
                      ) : (
                         <div className="w-16 h-16 bg-[#D6CBB7] flex items-center justify-center border border-[#6B6A2A]/20">
                           <Package size={20} className="text-[#6B6A2A]/40" />
                         </div>
                      )}
                      <div>
                        <h3 className="font-bold text-[#1A1A1A]">{order.previewItemName}</h3>
                        <p className="text-sm text-[#6E6E6E]">Order Preview</p>
                      </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
