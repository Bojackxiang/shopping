"use client";

import { useState } from "react";
import {
  User,
  Package,
  MapPin,
  Heart,
  Ticket,
  ChevronRight,
  ArrowLeft,
  Check,
  Calendar,
  Phone,
  Home,
  Edit3,
  Trash2,
  Plus,
  Star,
  Clock,
  Gift,
  ShoppingBag,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { linkToProductDetail } from "@/utils";
import Header from "../component/header";
import SideBarNav from "../component/side-bar-nav";
import OverviewContent from "../component/overview-content";
import OrdersContent from "../component/orders-content";
import AddressesContent from "../component/addresses-content";
import ProfileContent from "../component/profile-content";
import FavoritesContent from "../component/favorites-content";
import CouponsContent from "../component/coupons-content";

// Dashboard navigation items
const navigationItems = [
  { id: "overview", label: "Account Overview", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "addresses", label: "Shipping Addresses", icon: MapPin },
  { id: "profile", label: "Personal Information", icon: Settings },
  { id: "favorites", label: "My Favorites", icon: Heart },
  { id: "coupons", label: "Coupons", icon: Ticket },
];

// Sample data
const sampleUser = {
  name: "Sarah Zhang",
  email: "sarah.zhang@example.com",
  phone: "+1 (555) 123-4567",
  homeAddress: "123 Pearl Street, Apt 5B, San Francisco, CA 94102",
  avatar:
    "https://images.unsplash.com/photo-1494790108755-2616b612b1-5?w=100&h=100&fit=crop&crop=face",
  memberSince: "March 2023",
  totalOrders: 12,
  totalSpent: 2580.5,
};

const sampleOrders = [
  {
    id: "PC-2024-001234",
    date: "2024-11-01",
    status: "Shipped",
    total: 255.99,
    items: 3,
    canConfirm: true,
    image: "/classic-white-pearl-beaded-bracelet.jpg",
  },
  {
    id: "PC-2024-001233",
    date: "2024-10-28",
    status: "Completed",
    total: 189.99,
    items: 2,
    canConfirm: false,
    image: "/amethyst-crystal-beaded-bracelet.jpg",
  },
  {
    id: "PC-2024-001232",
    date: "2024-10-15",
    status: "Completed",
    total: 320.0,
    items: 1,
    canConfirm: false,
    image: "/golden-pearl-beaded-bracelet-luxury.jpg",
  },
];

const sampleFavorites = [
  {
    id: 1,
    name: "Rose Quartz Harmony",
    price: "$95.00",
    image: "/rose-quartz-crystal-beaded-bracelet.jpg",
    inStock: true,
  },
  {
    id: 2,
    name: "Golden Pearl Luxe",
    price: "$105.00",
    image: "/golden-pearl-beaded-bracelet-luxury.jpg",
    inStock: true,
  },
  {
    id: 3,
    name: "Moonstone Dreams",
    price: "$88.00",
    image: "/moonstone-pearl-beaded-bracelet.jpg",
    inStock: false,
  },
];

const sampleCoupons = [
  {
    id: 1,
    title: "New Customer Exclusive",
    description: "$20 off orders over $100",
    code: "WELCOME20",
    expiry: "2024-12-31",
    status: "available",
    minAmount: 100,
  },
  {
    id: 2,
    title: "Pearl Collection Special",
    description: "10% off Pearl jewelry",
    code: "PEARL10",
    expiry: "2024-11-30",
    status: "available",
    minAmount: 50,
  },
  {
    id: 3,
    title: "Birthday Special",
    description: "20% off birthday month",
    code: "BIRTHDAY20",
    expiry: "2024-11-15",
    status: "used",
    minAmount: 80,
  },
];

export default function DashboardView() {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    phone: sampleUser.phone,
    homeAddress: sampleUser.homeAddress,
  });

  const handleProfileSave = () => {
    // In real app, this would save to API
    setEditingProfile(false);
  };

  const confirmDelivery = (orderId: string) => {
    // In real app, this would update order status
    console.log("Confirming delivery for order:", orderId);
  };

  const removeFavorite = (itemId: number) => {
    // In real app, this would remove from favorites
    console.log("Removing from favorites:", itemId);
  };

  const renderOverview = () => (
    <OverviewContent
      user={sampleUser}
      recentOrders={sampleOrders.slice(0, 3)}
      favoritesCount={sampleFavorites.length}
    />
  );

  const renderOrders = () => (
    <OrdersContent orders={sampleOrders} onConfirmDelivery={confirmDelivery} />
  );

  const renderAddresses = () => <AddressesContent />;

  const renderProfile = () => (
    <ProfileContent
      user={sampleUser}
      editingProfile={editingProfile}
      profileData={profileData}
      onEditClick={() => setEditingProfile(true)}
      onSave={handleProfileSave}
      onCancel={() => {
        setEditingProfile(false);
        setProfileData({
          phone: sampleUser.phone,
          homeAddress: sampleUser.homeAddress,
        });
      }}
      onProfileDataChange={setProfileData}
    />
  );

  const renderFavorites = () => (
    <FavoritesContent
      favorites={sampleFavorites}
      onRemoveFavorite={removeFavorite}
    />
  );

  const renderCoupons = () => <CouponsContent coupons={sampleCoupons} />;

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "orders":
        return renderOrders();
      case "addresses":
        return renderAddresses();
      case "profile":
        return renderProfile();
      case "favorites":
        return renderFavorites();
      case "coupons":
        return renderCoupons();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <SideBarNav
            navigationItems={navigationItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Main Content */}
          <div className="lg:col-span-3">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
