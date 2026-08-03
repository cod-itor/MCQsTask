"use client";

import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  darkMode: boolean;
}

async function getCroppedImg(
  image: HTMLImageElement,
  pixelCrop: PixelCrop
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Set canvas size to the cropped area in natural pixels
  canvas.width = Math.floor(pixelCrop.width * scaleX);
  canvas.height = Math.floor(pixelCrop.height * scaleY);

  // Draw the image onto the canvas, cropping it
  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Return base64 string
  return canvas.toDataURL('image/jpeg', 0.9);
}

export function ImageCropperModal({ isOpen, onClose, imageSrc, onCropComplete, darkMode }: ImageCropperModalProps) {
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);
    try {
      const croppedBase64 = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedBase64);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl h-[90vh] flex flex-col ${darkMode ? "bg-slate-900 border-slate-700 text-white" : ""}`}>
        <DialogHeader>
          <DialogTitle>Adjust Image</DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 bg-black/5 rounded-md overflow-hidden flex flex-col items-center justify-center p-4">
          <div className="flex gap-2 mb-4">
            <Button size="sm" variant={aspect === 16/9 ? "default" : "outline"} onClick={() => setAspect(16/9)}>16:9</Button>
            <Button size="sm" variant={aspect === 4/3 ? "default" : "outline"} onClick={() => setAspect(4/3)}>4:3</Button>
            <Button size="sm" variant={aspect === 1 ? "default" : "outline"} onClick={() => setAspect(1)}>1:1</Button>
            <Button size="sm" variant={aspect === undefined ? "default" : "outline"} onClick={() => setAspect(undefined)}>Free</Button>
          </div>
          <ReactCrop 
            crop={crop} 
            aspect={aspect}
            onChange={(_, percentCrop) => setCrop(percentCrop)} 
            onComplete={(c) => setCompletedCrop(c)}
            className="max-h-full"
          >
            <img 
              ref={imgRef}
              src={imageSrc} 
              alt="Crop preview" 
              className="max-h-[55vh] object-contain"
              onLoad={(e) => {
                const { width, height } = e.currentTarget;
                // Default crop area covering most of the image
                setCrop({
                  unit: '%',
                  x: 10,
                  y: 10,
                  width: 80,
                  height: 80
                });
              }}
            />
          </ReactCrop>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isProcessing} className={darkMode ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700" : ""}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isProcessing ? "Processing..." : "Save Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
