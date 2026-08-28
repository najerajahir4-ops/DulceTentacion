"use client";

import { useState } from "react";
import { X, Trash2, Minus, Plus, ShoppingBag, MapPin, User, CreditCard, FileText } from "lucide-react";
import { useCart } from "../CartContext";
import { motion, AnimatePresence } from "framer-motion";

export function CartSidebar({ whatsappNumber }: { whatsappNumber: string }) {
  const { cartItems, isCartOpen, toggleCart, updateQuantity, removeFromCart, cartTotal } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [deliveryType, setDeliveryType] = useState<"domicilio" | "retiro">("domicilio");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [notes, setNotes] = useState("");

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    let message = `🧇 *NUEVO PEDIDO — DULCE TENTACIÓN* 🧇\n\n`;

    if (customerName.trim()) {
      message += `👤 *Cliente:* ${customerName.trim()}\n`;
    }

    if (deliveryType === "domicilio") {
      message += `📍 *Entrega:* Domicilio${address.trim() ? ` — ${address.trim()}` : ""}\n`;
    } else {
      message += `📍 *Entrega:* Retiro en Sucursal (Parque Helen Tenka)\n`;
    }

    message += `💳 *Método de Pago:* ${paymentMethod}\n\n`;
    message += `🛒 *DETALLE DEL PEDIDO:*\n`;

    cartItems.forEach((item) => {
      let optionsStr = "";
      if (item.options && Object.keys(item.options).length > 0) {
        optionsStr = ` (${Object.entries(item.options)
          .map(([, v]) => `${v}`)
          .join(", ")})`;
      }
      message += `• ${item.quantity}x ${item.name}${optionsStr} — $${(item.price * item.quantity).toFixed(2)}\n`;
    });

    if (notes.trim()) {
      message += `\n📝 *Notas:* ${notes.trim()}\n`;
    }

    message += `\n💰 *TOTAL A PAGAR: $${cartTotal.toFixed(2)}*\n\n`;
    message += `¡Gracias por elegir Dulce Tentación! 🍓✨`;

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, "_blank");
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
            className="absolute inset-0 bg-[#2C1A14]/30 backdrop-blur-xs"
            onClick={toggleCart}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md h-full bg-[#FAF4EC] text-[#2C1A14] shadow-2xl flex flex-col z-10 border-l border-[#E5D5C0]"
          >
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-[#E5D5C0] bg-[#F4EBDC]">
              <h2 className="text-xl font-serif text-[#2C1A14] font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D49B4B]" />
                Tu Pedido
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 text-[#2C1A14]/60 hover:text-[#2C1A14] hover:bg-[#FAF4EC] rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#2C1A14]/40 space-y-3">
                  <ShoppingBag className="w-14 h-14 opacity-30" />
                  <p className="text-base font-serif font-medium">Tu carrito está vacío</p>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={item.cartItemId}
                        className="flex gap-3.5 items-center bg-[#F4EBDC] p-3.5 rounded-2xl border border-[#E5D5C0] shadow-xs"
                      >
                        <div className="w-16 h-16 relative bg-[#FAF4EC] rounded-xl overflow-hidden flex-shrink-0 border border-[#E5D5C0]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1.5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif font-bold text-sm text-[#2C1A14] truncate">{item.name}</h3>
                          {item.options && (
                            <div className="text-[11px] text-[#2C1A14]/70 mt-0.5 font-sans leading-tight">
                              {Object.entries(item.options).map(([key, value]) => (
                                <span key={key} className="block truncate">
                                  • {value}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-[#D49B4B] font-serif font-bold text-sm mt-1">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>

                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center bg-[#FAF4EC] rounded-full border border-[#E5D5C0]">
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#2C1A14] hover:text-[#D49B4B] transition-colors cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-5 text-center font-sans font-medium text-xs text-[#2C1A14]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#2C1A14] hover:text-[#D49B4B] transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="p-1.5 text-[#2C1A14]/40 hover:text-red-600 transition-colors ml-auto cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Customer Information Form */}
                  <div className="pt-4 border-t border-[#E5D5C0] space-y-4">
                    <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#D49B4B]">
                      Datos para el Envío por WhatsApp
                    </h3>

                    {/* Customer Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-sans font-medium text-[#2C1A14]/80 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#D49B4B]" />
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. María López"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F4EBDC] border border-[#E5D5C0] rounded-xl text-xs text-[#2C1A14] placeholder:text-[#2C1A14]/40 focus:outline-none focus:ring-1 focus:ring-[#2C1A14] font-sans"
                      />
                    </div>

                    {/* Delivery Option */}
                    <div className="space-y-1">
                      <label className="text-xs font-sans font-medium text-[#2C1A14]/80 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#D49B4B]" />
                        Tipo de Entrega
                      </label>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setDeliveryType("domicilio")}
                          className={`py-2 px-3 rounded-xl text-xs font-sans font-medium border transition-colors cursor-pointer ${
                            deliveryType === "domicilio"
                              ? "bg-[#2C1A14] text-[#FAF4EC] border-[#2C1A14]"
                              : "bg-[#F4EBDC] text-[#2C1A14] border-[#E5D5C0]"
                          }`}
                        >
                          Domicilio
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryType("retiro")}
                          className={`py-2 px-3 rounded-xl text-xs font-sans font-medium border transition-colors cursor-pointer ${
                            deliveryType === "retiro"
                              ? "bg-[#2C1A14] text-[#FAF4EC] border-[#2C1A14]"
                              : "bg-[#F4EBDC] text-[#2C1A14] border-[#E5D5C0]"
                          }`}
                        >
                          Retiro Sucursal
                        </button>
                      </div>
                    </div>

                    {/* Address (If Domicilio) */}
                    {deliveryType === "domicilio" && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="Dirección o referencia de entrega..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#F4EBDC] border border-[#E5D5C0] rounded-xl text-xs text-[#2C1A14] placeholder:text-[#2C1A14]/40 focus:outline-none focus:ring-1 focus:ring-[#2C1A14] font-sans"
                        />
                      </div>
                    )}

                    {/* Payment Method */}
                    <div className="space-y-1">
                      <label className="text-xs font-sans font-medium text-[#2C1A14]/80 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#D49B4B]" />
                        Método de Pago
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F4EBDC] border border-[#E5D5C0] rounded-xl text-xs text-[#2C1A14] focus:outline-none focus:ring-1 focus:ring-[#2C1A14] font-sans cursor-pointer"
                      >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                        <option value="Tarjeta / Payphone">Tarjeta / Payphone</option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="text-xs font-sans font-medium text-[#2C1A14]/80 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#D49B4B]" />
                        Notas u Observaciones (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Sin salsa de chocolate en el waffle..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F4EBDC] border border-[#E5D5C0] rounded-xl text-xs text-[#2C1A14] placeholder:text-[#2C1A14]/40 focus:outline-none focus:ring-1 focus:ring-[#2C1A14] font-sans"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Checkout Button */}
            {cartItems.length > 0 && (
              <div className="p-5 bg-[#F4EBDC] border-t border-[#E5D5C0]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#2C1A14]/70 text-xs font-sans font-medium">Total Estimado</span>
                  <span className="text-2xl font-serif font-bold text-[#2C1A14]">${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-full font-sans font-medium text-sm transition-colors shadow-sm bg-[#2C1A14] text-[#FAF4EC] hover:bg-[#3D2817] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Enviar Pedido por WhatsApp</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
