import { useState } from "react";

interface UseGalleryReturn {
  selectedImage: number;
  setSelectedImage: (index: number) => void;
  nextImage: () => void;
  prevImage: () => void;
  showZoom: boolean;
  setShowZoom: (show: boolean) => void;
}

export const useGallery = (imageCount: number = 1): UseGalleryReturn => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showZoom, setShowZoom] = useState(false);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % imageCount);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + imageCount) % imageCount);
  };

  return {
    selectedImage,
    setSelectedImage,
    nextImage,
    prevImage,
    showZoom,
    setShowZoom,
  };
};

export default useGallery;
