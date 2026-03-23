"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, X, Upload } from "lucide-react";
import { createSalon } from "@/lib/salonService";
import { uploadSalonImage } from "@/lib/firebase";
import { toast } from "sonner";

export default function AddSalonDialog({ open, onOpenChange, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([{ name: "", price: "", duration: "" }]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [salonName, setSalonName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addService = () => setServices([...services, { name: "", price: "", duration: "" }]);
  
  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (salonCode: string) => {
    if (imageFiles.length === 0) return [];

    try {
      const uploadPromises = imageFiles.map(file =>
        uploadSalonImage(file, salonCode)
      );
      const uploadedImages = await Promise.all(uploadPromises);
      return uploadedImages.map(img => img.url);
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error("Failed to upload images");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const salonNameValue = formData.get("salonName") as string;
    
    try {
      // Generate a salonCode (could be more sophisticated)
      const salonCode = salonNameValue.toLowerCase().replace(/\s+/g, '_');
      
      // Upload images first
      const imageUrls = await uploadImages(salonCode);
      
      const payload = {
        salonName: salonNameValue,
        description: formData.get("description"),
        address: formData.get("address"),
        city: formData.get("city"),
        phoneNumber: formData.get("phoneNumber"),
        isActive: true,
        openingTime: new Date().toISOString(),
        closingTime: new Date().toISOString(),
        images: imageUrls.length > 0 ? imageUrls : ["https://placehold.co/600x400"],
        services: services.map(s => ({
          name: s.name,
          price: Number(s.price),
          duration: Number(s.duration)
        }))
      };

      await createSalon(payload);
      toast.success("Salon registered successfully!");
      
      // Reset form
      setImageFiles([]);
      setImagePreviews([]);
      setSalonName("");
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.message || "Error creating salon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl">Register Your Salon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Salon Name</label>
              <Input name="salonName" required placeholder="Elegant Hair Studio" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input name="city" required placeholder="Colombo" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea name="description" required placeholder="Describe your services..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input name="address" required placeholder="123 Main Street" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input name="phoneNumber" required placeholder="+9477..." />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-neutral-700">Services</h3>
              <Button type="button" variant="outline" size="sm" onClick={addService}>
                <Plus className="w-4 h-4 mr-2" /> Add Service
              </Button>
            </div>
            {services.map((service, index) => (
              <div key={index} className="flex gap-3 items-end border-b pb-4">
                <div className="flex-1 space-y-1">
                  <Input 
                    placeholder="Name" 
                    value={service.name}
                    onChange={(e) => {
                      const s = [...services];
                      s[index].name = e.target.value;
                      setServices(s);
                    }}
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Input 
                    placeholder="Price" 
                    type="number"
                    value={service.price}
                    onChange={(e) => {
                      const s = [...services];
                      s[index].price = e.target.value;
                      setServices(s);
                    }}
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Input 
                    placeholder="Min" 
                    type="number"
                    value={service.duration}
                    onChange={(e) => {
                      const s = [...services];
                      s[index].duration = e.target.value;
                      setServices(s);
                    }}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500"
                  onClick={() => removeService(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-neutral-700">Images</h3>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload Images
                </Button>
              </div>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No images selected. Click "Upload Images" to add salon photos.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-black text-white hover:bg-neutral-800" disabled={loading}>
              {loading ? "Registering..." : "Complete Registration"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}