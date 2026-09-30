import React, { useState, useEffect } from 'react';
import { User, Order, FuelType } from './types';
import { store } from './services/store';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { CustomerDashboard } from './components/CustomerDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { OrderHistoryView } from './components/OrderHistoryView';
import { TrackingView } from './components/TrackingView';
import { OrderModal } from './components/OrderModal';
import { InvoiceModal } from './components/InvoiceModal';
import { PetrolBunkProofModal } from './components/PetrolBunkProofModal';
import { AIFuelAssistantModal } from './components/AIFuelAssistantModal';
import { SafetyCenterModal } from './components/SafetyCenterModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { GovtSanctionModal } from './components/GovtSanctionModal';
import { GovtDeliveryVideoModal } from './components/GovtDeliveryVideoModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());
  const [activeView, setActiveView] = useState<'landing' | 'customer' | 'driver' | 'admin' | 'history' | 'tracking'>('landing');
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);

  // Live Customer GPS state
  const [liveCustomerLocation, setLiveCustomerLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [initialOrderFuel, setInitialOrderFuel] = useState<FuelType>('Petrol');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isGovtSanctionOpen, setIsGovtSanctionOpen] = useState<boolean>(false);
  const [isGovtVideoOpen, setIsGovtVideoOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);

  // Auto-acquire device GPS on App mount and stream continuous live updates
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const handlePosition = async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        let addr = `Live GPS (${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E)`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'FuelGo-Delivery/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              addr = data.display_name.split(',').slice(0, 3).join(',').trim();
            }
          }
        } catch {
          // fallback
        }

        setLiveCustomerLocation({
          lat: latitude,
          lng: longitude,
          address: addr,
        });
      };

      navigator.geolocation.getCurrentPosition(
        handlePosition,
        () => {
          // default coordinates if permission denied
          setLiveCustomerLocation({
            lat: 12.926,
            lng: 77.6762,
            address: 'Bellandur, Bengaluru, Karnataka',
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLiveCustomerLocation((prev) => ({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: prev?.address || `Live Spot (${pos.coords.latitude.toFixed(5)}°N, ${pos.coords.longitude.toFixed(5)}°E)`,
          }));
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      if (selectedTrackingOrder) {
        const refreshed = store.getOrderById(selectedTrackingOrder.id);
        if (refreshed) setSelectedTrackingOrder(refreshed);
      }
    });
    return unsubscribe;
  }, [selectedTrackingOrder]);

  const unreadNotificationsCount = store.getNotifications(currentUser.id).filter((n) => !n.read).length;

  const handleOpenOrder = (fuelType: FuelType = 'Petrol') => {
    setInitialOrderFuel(fuelType);
    setIsOrderModalOpen(true);
  };

  const handleOpenOrderAtLocation = (
    fuelType: FuelType = 'Petrol',
    coords: { lat: number; lng: number; address: string }
  ) => {
    setLiveCustomerLocation(coords);
    setInitialOrderFuel(fuelType);
    setIsOrderModalOpen(true);
  };

  const handleOrderCreated = (newOrder: Order) => {
    setSelectedTrackingOrder(newOrder);
    setActiveView('tracking');
  };

  const handleTrackOrder = (order: Order) => {
    setSelectedTrackingOrder(order);
    setActiveView('tracking');
  };

  const handleOpenTrackingFromHero = () => {
    const userOrders = store.getOrdersForUser(currentUser);
    const active = userOrders.find((o) =>
      ['Confirmed', 'Driver Assigned', 'On The Way', 'Arriving Soon'].includes(o.orderStatus)
    );
    if (active) {
      handleTrackOrder(active);
    } else if (userOrders.length > 0) {
      handleTrackOrder(userOrders[0]);
    } else {
      handleOpenOrder('Petrol');
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        currentUser={currentUser}
        onNavigate={(view) => setActiveView(view)}
        activeView={activeView}
        onOpenOrderModal={() => handleOpenOrder('Petrol')}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onOpenSafetyCenter={() => setIsSafetyModalOpen(true)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        unreadCount={unreadNotificationsCount}
        onOpenGovtSanction={() => setIsGovtSanctionOpen(true)}
        onOpenDeliveryVideo={() => setIsGovtVideoOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        {activeView === 'landing' && (
          <LandingPage
            onOrderNow={handleOpenOrder}
            onOpenTracking={handleOpenTrackingFromHero}
            onOpenAiAssistant={() => setIsAiModalOpen(true)}
            onOpenSafetyCenter={() => setIsSafetyModalOpen(true)}
            customerLocation={liveCustomerLocation}
            onOrderAtLocation={handleOpenOrderAtLocation}
            onOpenGovtSanction={() => setIsGovtSanctionOpen(true)}
            onOpenDeliveryVideo={() => setIsGovtVideoOpen(true)}
          />
        )}

        {activeView === 'customer' && (
          <CustomerDashboard
            currentUser={currentUser}
            onOpenOrderModal={handleOpenOrder}
            onTrackOrder={handleTrackOrder}
            onViewInvoice={(ord) => setSelectedInvoiceOrder(ord)}
            onViewProof={(ord) => setSelectedProofOrder(ord)}
            onOpenAiAssistant={() => setIsAiModalOpen(true)}
            onOpenSafetyCenter={() => setIsSafetyModalOpen(true)}
            onViewHistory={() => setActiveView('history')}
          />
        )}

        {activeView === 'driver' && (
          <DriverDashboard currentUser={currentUser} />
        )}

        {activeView === 'admin' && (
          <AdminDashboard currentUser={currentUser} />
        )}

        {activeView === 'history' && (
          <OrderHistoryView
            currentUser={currentUser}
            onTrackOrder={handleTrackOrder}
            onNewOrder={() => handleOpenOrder('Petrol')}
          />
        )}

        {activeView === 'tracking' && selectedTrackingOrder && (
          <TrackingView
            order={selectedTrackingOrder}
            currentUser={currentUser}
            customerLiveCoords={liveCustomerLocation || undefined}
            onBack={() => setActiveView('history')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenSafetyCenter={() => setIsSafetyModalOpen(true)}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onNavigateToHistory={() => setActiveView('history')}
      />

      {/* Modals & Drawers */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        currentUser={currentUser}
        defaultCoords={liveCustomerLocation || undefined}
        onOrderCreated={handleOrderCreated}
        initialFuelType={initialOrderFuel}
      />

      {selectedInvoiceOrder && (
        <InvoiceModal
          invoice={store.getInvoiceForOrder(selectedInvoiceOrder.id)}
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {selectedProofOrder && (
        <PetrolBunkProofModal
          order={selectedProofOrder}
          isOpen={!!selectedProofOrder}
          onClose={() => setSelectedProofOrder(null)}
          currentUser={currentUser}
          onProofUpdated={() => {
            // refresh
          }}
        />
      )}

      <AIFuelAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onOpenSafetyCenter={() => setIsSafetyModalOpen(true)}
        onOpenGovtSanction={() => setIsGovtSanctionOpen(true)}
      />

      <SafetyCenterModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />

      <GovtSanctionModal
        isOpen={isGovtSanctionOpen}
        onClose={() => setIsGovtSanctionOpen(false)}
        initialCoords={liveCustomerLocation || undefined}
        onFastTrackOrder={(type, coords) => handleOpenOrderAtLocation(type, coords)}
      />

      <GovtDeliveryVideoModal
        isOpen={isGovtVideoOpen}
        onClose={() => setIsGovtVideoOpen(false)}
        onOpenSanctionModal={() => setIsGovtSanctionOpen(true)}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        userId={currentUser.id}
        onSelectOrder={(orderId) => {
          const ord = store.getOrderById(orderId);
          if (ord) handleTrackOrder(ord);
        }}
      />
    </div>
  );
}
