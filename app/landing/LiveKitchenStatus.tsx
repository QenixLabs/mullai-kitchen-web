"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import dynamic from "next/dynamic";
import { Truck, Users, Star, ChefHat, Clock, Flame, Phone, ArrowRight, Zap } from "lucide-react";
import { fadeInUp, staggerContainer } from "./animations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type L from "leaflet";

// Dynamic imports for map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const ZoomControl = dynamic(
  () => import("react-leaflet").then((mod) => mod.ZoomControl),
  { ssr: false }
);

// Chennai coordinates
const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];

// Delivery zones with real Chennai coordinates
const deliveryZones = [
  { id: 1, name: "Anna Nagar", lat: 13.0878, lng: 80.2087, active: true, time: "12:15", orders: 45 },
  { id: 2, name: "T. Nagar", lat: 13.0416, lng: 80.2341, active: true, time: "12:30", orders: 38 },
  { id: 3, name: "Adyar", lat: 13.0067, lng: 80.2206, active: false, time: "13:00", orders: 0 },
  { id: 4, name: "Velachery", lat: 12.9816, lng: 80.2182, active: true, time: "12:45", orders: 52 },
  { id: 5, name: "Mylapore", lat: 13.0337, lng: 80.2687, active: true, time: "12:20", orders: 31 },
  { id: 6, name: "Nungambakkam", lat: 13.0674, lng: 80.2426, active: false, time: "13:15", orders: 0 },
  { id: 7, name: "Porur", lat: 13.0358, lng: 80.1583, active: true, time: "12:50", orders: 28 },
  { id: 8, name: "Guindy", lat: 13.0067, lng: 80.2206, active: true, time: "12:35", orders: 41 },
];

// Counter animation hook
function useCounter(target: number, duration: number = 2) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, {
        duration,
        ease: "easeOut"
      });
      return controls.stop;
    }
  }, [isInView, target, duration, count]);

  return { ref, rounded };
}

// Stat Card Component
function StatCard({
  value,
  suffix = "",
  label,
  icon: Icon,
  trend,
  delay = 0
}: {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}) {
  const { ref, rounded } = useCounter(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-100/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#39070F] via-[#D4A574] to-[#39070F] opacity-80" />

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#39070F] to-[#5a0f1a] shadow-lg shadow-[#39070F]/20">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <motion.span className="text-3xl font-bold text-gray-900 tracking-tight">
              {rounded}
            </motion.span>
            {suffix && (
              <span className="text-lg font-semibold text-[#D4A574]">{suffix}</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            trend === "up" && "bg-emerald-50 text-emerald-600",
            trend === "down" && "bg-red-50 text-red-600",
            trend === "neutral" && "bg-gray-100 text-gray-600"
          )}>
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            Live
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Map Skeleton
function MapSkeleton() {
  return (
    <div className="w-full h-full bg-gray-900 rounded-2xl animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  );
}

// Delivery Zone Card
function DeliveryZoneCard({
  zone,
  index
}: {
  zone: typeof deliveryZones[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className={cn(
        "group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 cursor-pointer",
        zone.active
          ? "bg-gradient-to-r from-emerald-50 to-transparent border-emerald-200/50 hover:border-emerald-300 hover:shadow-md"
          : "bg-gray-50/50 border-gray-200/50 hover:border-gray-300"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            zone.active ? "bg-emerald-500" : "bg-gray-400"
          )} />
          {zone.active && (
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>
        <div>
          <p className={cn(
            "font-semibold text-sm",
            zone.active ? "text-emerald-900" : "text-gray-700"
          )}>
            {zone.name}
          </p>
          <p className="text-xs text-gray-500">
            {zone.active ? `${zone.orders} orders in progress` : `Next delivery ${zone.time}`}
          </p>
        </div>
      </div>

      {zone.active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.2 }}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 rounded-full">
            <Truck className="h-3 w-3 text-white" />
            <span className="text-xs font-semibold text-white">{zone.time}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Live Badge Component
function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#39070F] to-[#5a0f1a] shadow-lg shadow-[#39070F]/30">
      <div className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </div>
      <span className="text-sm font-semibold text-white tracking-wide">LIVE FROM KITCHEN</span>
    </div>
  );
}

export function LiveKitchenStatus() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [mounted, setMounted] = useState(false);
  const [activeOrders, setActiveOrders] = useState(2847);
  const [icons, setIcons] = useState<{
    kitchen: L.DivIcon | null;
    activeZone: L.DivIcon | null;
    inactiveZone: L.DivIcon | null;
  }>({ kitchen: null, activeZone: null, inactiveZone: null });

  // Load icons on client side
  useEffect(() => {
    setMounted(true);
    import("@/components/ui/map").then((mod) => {
      setIcons({
        kitchen: mod.kitchenIcon,
        activeZone: mod.activeZoneIcon,
        inactiveZone: mod.inactiveZoneIcon,
      });
    });
  }, []);

  // Simulate live order updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrders(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeZones = deliveryZones.filter(z => z.active);
  const totalOrdersInProgress = activeZones.reduce((acc, z) => acc + z.orders, 0);

  return (
    <section ref={ref} className="relative min-h-[900px] overflow-hidden">
      {/* Map Background - Full Width */}
      <div className="absolute inset-0 z-0">
        {mounted && (
          <MapContainer
            center={CHENNAI_CENTER}
            zoom={12}
            className="!rounded-none h-full w-full"
            zoomControl={false}
            scrollWheelZoom={true}
          >
            {/* Satellite Layer */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            />

            {/* Kitchen Marker with Pulse */}
            {icons.kitchen && (
              <Marker position={CHENNAI_CENTER} icon={icons.kitchen}>
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#39070F] flex items-center justify-center">
                        <ChefHat className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Mullai Kitchen</p>
                        <p className="text-xs text-gray-500">Cloud Kitchen HQ</p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Delivery Zone Markers */}
            {deliveryZones.map((zone) => {
              const zoneIcon = zone.active ? icons.activeZone : icons.inactiveZone;
              if (!zoneIcon) return null;
              return (
                <Marker
                  key={zone.id}
                  position={[zone.lat, zone.lng]}
                  icon={zoneIcon}
                >
                  <Popup>
                    <div className="p-1">
                      <p className="font-semibold text-gray-900">{zone.name}</p>
                      <p className="text-xs text-gray-500">
                        {zone.active ? `${zone.orders} orders in progress` : `Next delivery ${zone.time}`}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Delivery Zone Circles */}
            {deliveryZones.map((zone) => (
              <Circle
                key={`circle-${zone.id}`}
                center={[zone.lat, zone.lng]}
                radius={zone.active ? 1500 : 800}
                pathOptions={{
                  color: zone.active ? "#10B981" : "#9CA3AF",
                  fillColor: zone.active ? "#10B981" : "#9CA3AF",
                  fillOpacity: zone.active ? 0.2 : 0.1,
                  weight: 2,
                }}
              />
            ))}

            <ZoomControl position="bottomright" />
          </MapContainer>
        )}
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12">
          {/* Left Content */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <LiveBadge />

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
                Live from Our
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#e8c4a0]">
                  Cloud Kitchen
                </span>
              </h2>

              <p className="text-lg text-white/70 leading-relaxed">
                Watch your meals being prepared and delivered in real-time across Chennai.
                Fresh, hot, and on time — every single time.
              </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatCard
                value={activeOrders}
                label="Meals Served Today"
                icon={ChefHat}
                trend="up"
                delay={0}
              />
              <StatCard
                value={1563}
                suffix="+"
                label="Active Subscribers"
                icon={Users}
                delay={0.1}
              />
              <StatCard
                value={totalOrdersInProgress}
                label="Orders in Transit"
                icon={Truck}
                trend="up"
                delay={0.2}
              />
              <StatCard
                value={4.9}
                suffix="★"
                label="Customer Rating"
                icon={Star}
                delay={0.3}
              />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="h-14 px-8 bg-gradient-to-r from-[#39070F] to-[#5a0f1a] hover:from-[#4a0a15] hover:to-[#6b1020] text-white font-semibold rounded-full shadow-xl shadow-[#39070F]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-5 h-5 mr-2" />
                Order Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 font-semibold rounded-full transition-all"
              >
                <Phone className="w-5 h-5 mr-2" />
                Contact Kitchen
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Sidebar - Delivery Schedule */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Schedule Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Delivery Zones</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <div className="relative w-2 h-2">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping" />
                    <div className="relative w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">{activeZones.length} Active</span>
                </div>
              </div>

              {/* Zone List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {deliveryZones.map((zone, index) => (
                  <DeliveryZoneCard key={zone.id} zone={zone} index={index} />
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Next batch in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#39070F]">12:30</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A574]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-gradient-to-br from-[#39070F] to-[#5a0f1a] rounded-2xl p-5 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-6 h-6 text-[#D4A574]" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Fresh Daily Promise</p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Every meal is prepared fresh each morning. Never frozen, always delicious.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Leaflet custom styles */
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 8px 12px;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #39070F !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f3f4f6 !important;
        }
      `}</style>
    </section>
  );
}
