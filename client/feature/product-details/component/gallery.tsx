"use client";

import { product_images } from "@/types/prisma";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface GalleryProps {
  images: product_images[];
  productName: string;
  sale: boolean;
  salePercentage?: number;
  selectedImage: number;
  onSelectImage: (index: number) => void;
  onNextImage: () => void;
  onPrevImage: () => void;
  onZoom: () => void;
}

const Gallery = ({
  images,
  productName,
  sale,
  salePercentage,
  selectedImage,
  onSelectImage,
  onNextImage,
  onPrevImage,
  onZoom,
}: GalleryProps) => {
  const {} = images;
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
        <img
          src={images[selectedImage].url}
          alt={productName}
          className="w-full h-full object-cover"
        />
        {sale && (
          <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
            Save {salePercentage}%
          </div>
        )}
        <button
          onClick={onZoom}
          className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex space-x-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onSelectImage(index)}
            className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === index ? "border-primary" : "border-transparent"
            }`}
          >
            <img
              src={image.url}
              alt={`${productName} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
