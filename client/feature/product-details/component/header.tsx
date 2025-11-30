"use client";

import { Heart, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  productName: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const Header = ({ productName, isFavorite, onToggleFavorite }: HeaderProps) => {
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </Link>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleFavorite}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "fill-accent text-accent" : "text-foreground"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
