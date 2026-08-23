"use client";

import { X, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "../CartContext";
import { motion, AnimatePresence } from "framer-motion";

export function CartSidebar({ whatsappNumber }: { whatsappNumber: string }) {
  const { cartItems, isCartOpen, toggleCart, updateQuantity, removeFromCart, cartTotal } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    let message = "Hola, quisiera hacer el siguiente pedido:\n\n";
    cartItems.forEach(item => {
      message += `- ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})\n`;
    });
    message += `\n*Total a pagar: $${cartTotal.toFixed(2)}*`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={toggleCart}
          />
          
          {/* Sidebar */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-surface shadow-2xl flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-surface-border">
              <h2 className="text-2xl font-serif text-foreground font-bold flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-accent" />
                Tu Pedido
              </h2>
              <button 
                onClick={toggleCart}
                className="p-2 text-foreground/50 hover:text-foreground hover:bg-background rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-foreground/50 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="text-lg font-medium">Tu carrito está vacío</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.id} 
                    className="flex gap-4 items-center bg-background p-4 rounded-2xl"
                  >
                    <div className="w-20 h-20 relative bg-surface rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground line-clamp-1">{item.name}</h3>
                      <div className="text-accent font-bold mt-1">${item.price.toFixed(2)}</div>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center bg-surface rounded-full border border-surface-border">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-foreground hover:text-accent transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-foreground hover:text-accent transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-foreground/40 hover:text-red-500 transition-colors ml-auto"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 bg-background border-t border-surface-border">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-foreground/70 font-medium">Total Estimado</span>
                  <span className="text-3xl font-serif font-bold text-foreground">${cartTotal.toFixed(2)}</span>
                </div>
                {cartTotal < 5.00 && (
                  <p className="text-center text-accent text-sm font-bold mb-3">
                    El pedido mínimo para domicilio es de $5.00
                  </p>
                )}
                <button 
                  onClick={handleCheckout}
                  disabled={cartTotal < 5.00}
                  className={`w-full py-4 rounded-full font-bold text-lg transition-all shadow-lg ${
                    cartTotal >= 5.00 
                      ? 'bg-accent text-white hover:bg-accent-hover shadow-accent/30 hover:shadow-xl hover:-translate-y-1' 
                      : 'bg-surface-border text-foreground/50 cursor-not-allowed shadow-none'
                  }`}
                >
                  Pedir por WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
