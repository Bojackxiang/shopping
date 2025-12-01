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

const sampleAddresses = [
  {
    id: 1,
    label: "Home",
    name: "Sarah Zhang",
    phone: "+1 (555) 123-4567",
    address: "123 Pearl Street, Apt 5B, San Francisco, CA 94102",
    isDefault: true,
  },
  {
    id: 2,
    label: "Office",
    name: "Sarah Zhang",
    phone: "+1 (555) 123-4567",
    address: "456 Crystal Tower, 15th Floor, San Francisco, CA 94105",
    isDefault: false,
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

export default function DashboardPage() {
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
    <div className="space-y-6">
      <div className="bg-linear-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary">
            <img
              src={sampleUser.avatar}
              alt={sampleUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-light text-foreground">
              {sampleUser.name}
            </h2>
            <p className="text-muted-foreground">{sampleUser.email}</p>
            <p className="text-sm text-muted-foreground">
              Member since: {sampleUser.memberSince}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <Package className="w-8 h-8 text-accent mx-auto mb-3" />
          <div className="text-2xl font-medium text-foreground">
            {sampleUser.totalOrders}
          </div>
          <div className="text-sm text-muted-foreground">Total Orders</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <ShoppingBag className="w-8 h-8 text-accent mx-auto mb-3" />
          <div className="text-2xl font-medium text-foreground">
            ${sampleUser.totalSpent}
          </div>
          <div className="text-sm text-muted-foreground">Total Spent</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <Heart className="w-8 h-8 text-accent mx-auto mb-3" />
          <div className="text-2xl font-medium text-foreground">
            {sampleFavorites.length}
          </div>
          <div className="text-sm text-muted-foreground">Favorite Items</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-light text-foreground mb-4">
          Recent Orders
        </h3>
        <div className="space-y-4">
          {sampleOrders.slice(0, 3).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                  <img
                    src={order.image}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-foreground">{order.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-foreground">
                  ${order.total}
                </div>
                <div className="text-sm text-accent">{order.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-foreground">My Orders</h2>
      </div>

      <div className="space-y-4">
        {sampleOrders.map((order) => (
          <div
            key={order.id}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-medium text-foreground">{order.id}</div>
                <div className="text-sm text-muted-foreground flex items-center space-x-4 mt-1">
                  <span>Order Date: {order.date}</span>
                  <span>Items: {order.items}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-foreground">
                  ${order.total}
                </div>
                <div
                  className={`text-sm px-2 py-1 rounded-full text-center mt-1 ${
                    order.status === "Completed"
                      ? "bg-accent/10 text-accent"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {order.status}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                  <img
                    src={order.image}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Link
                  href={linkToProductDetail(order.id)}
                  className="text-accent hover:text-accent/80 transition-colors"
                >
                  View Details <ChevronRight className="w-4 h-4 inline" />
                </Link>
              </div>

              {order.canConfirm && (
                <Button
                  onClick={() => confirmDelivery(order.id)}
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Delivery
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-foreground">
          Shipping Addresses
        </h2>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleAddresses.map((address) => (
          <div
            key={address.id}
            className="bg-card border border-border rounded-xl p-6 relative"
          >
            {address.isDefault && (
              <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs">
                Default Address
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-accent" />
                <span className="font-medium text-foreground">
                  {address.label}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <div className="text-foreground">{address.name}</div>
                <div className="text-muted-foreground">{address.phone}</div>
                <div className="text-muted-foreground">{address.address}</div>
              </div>

              <div className="flex space-x-2 pt-3">
                <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-foreground">
          Personal Information
        </h2>
        {!editingProfile && (
          <Button onClick={() => setEditingProfile(true)} size="sm">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Information
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="space-y-6">
          {/* Read-only information */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground border-b border-border pb-2">
              Basic Information (from Clerk)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <div className="mt-1 p-3 bg-secondary rounded-lg text-foreground">
                  {sampleUser.name}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <div className="mt-1 p-3 bg-secondary rounded-lg text-foreground">
                  {sampleUser.email}
                </div>
              </div>
            </div>
          </div>

          {/* Editable information */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground border-b border-border pb-2">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                {editingProfile ? (
                  <Input
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="p-3 bg-secondary rounded-lg text-foreground">
                    {profileData.phone}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  <Home className="w-4 h-4 inline mr-2" />
                  Home Address
                </label>
                {editingProfile ? (
                  <Input
                    value={profileData.homeAddress}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        homeAddress: e.target.value,
                      })
                    }
                    placeholder="Enter home address"
                  />
                ) : (
                  <div className="p-3 bg-secondary rounded-lg text-foreground">
                    {profileData.homeAddress}
                  </div>
                )}
              </div>
            </div>

            {editingProfile && (
              <div className="flex space-x-3 pt-4">
                <Button onClick={handleProfileSave}>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileData({
                      phone: sampleUser.phone,
                      homeAddress: sampleUser.homeAddress,
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-foreground">My Favorites</h2>
        <span className="text-sm text-muted-foreground">
          {sampleFavorites.length} items
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleFavorites.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-xl overflow-hidden group"
          >
            <div className="relative aspect-square bg-secondary">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {!item.inStock && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <span className="text-muted-foreground font-medium">
                    Out of Stock
                  </span>
                </div>
              )}
              <button
                onClick={() => removeFavorite(item.id)}
                className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4">
              <h3 className="font-light text-foreground mb-2">{item.name}</h3>
              <div className="flex items-center justify-between">
                <span className="font-medium text-accent">{item.price}</span>
                <Link href={linkToProductDetail(item.id)}>
                  <Button size="sm" disabled={!item.inStock}>
                    {item.inStock ? "View Details" : "Out of Stock"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-foreground">Coupons</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`bg-card border rounded-xl p-6 relative overflow-hidden ${
              coupon.status === "available"
                ? "border-accent/30 bg-accent/5"
                : "border-border opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-accent" />
                  <h3 className="font-medium text-foreground">
                    {coupon.title}
                  </h3>
                </div>
                <p className="text-lg font-light text-accent">
                  {coupon.description}
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center space-x-2">
                    <span>Coupon Code:</span>
                    <code className="bg-background px-2 py-1 rounded text-foreground font-mono">
                      {coupon.code}
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Valid until: {coupon.expiry}</span>
                  </div>
                  <div>Minimum spend: ${coupon.minAmount}</div>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  coupon.status === "available"
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {coupon.status === "available" ? "Available" : "Used"}
              </div>
            </div>

            {coupon.status === "available" && (
              <div className="absolute bottom-0 right-0 w-16 h-16 opacity-10">
                <Ticket className="w-full h-full text-accent" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Gift className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-lg font-light text-foreground mb-2">
          More Coupons
        </h3>
        <p className="text-muted-foreground mb-4">
          Follow our promotions page to get more exclusive coupons
        </p>
        <Link href="/promotions">
          <Button>Get Coupons</Button>
        </Link>
      </div>
    </div>
  );

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
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-2xl font-light tracking-tight text-foreground">
              Dashboard
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        activeTab === item.id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-light">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
