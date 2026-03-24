"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2, Upload, X } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import HeaderSalon from "@/components/HeaderSalon";
import SidebarSalon from "@/components/SidebarSalon";
import { fetchByOwner } from "@/lib/salonService";
import { createAd } from "@/lib/adsService";
import { fetchPlanUsage } from "@/lib/planService";
import { createPayment } from "@/lib/paymentService";
import { uploadAdImages, uploadTransactionImage } from "@/lib/firebase";
import { getStoredSalonId, setStoredSalonId } from "@/lib/salonSelection";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PlanOption = {
  id: string;
  planName: string;
};

function extractAdId(response: any): string | null {
  if (!response) return null;
  if (typeof response === "string") return response;
  if (response.id) return String(response.id);
  if (response.adId) return String(response.adId);
  if (response.data?.id) return String(response.data.id);
  if (response.data?.adId) return String(response.data.adId);
  if (response.ad?.id) return String(response.ad.id);
  if (response.createdAd?.id) return String(response.createdAd.id);
  return null;
}

export default function CreateAdPage() {
  const router = useRouter();
  const adImageInputRef = useRef<HTMLInputElement>(null);
  const paymentFileInputRef = useRef<HTMLInputElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [salons, setSalons] = useState<any[]>([]);
  const [selectedSalonId, setSelectedSalonId] = useState<string>("");
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loadingPageData, setLoadingPageData] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [planId, setPlanId] = useState("");

  const [adImageFiles, setAdImageFiles] = useState<File[]>([]);
  const [adImagePreviews, setAdImagePreviews] = useState<string[]>([]);

  const [creatingAd, setCreatingAd] = useState(false);
  const [createdAdId, setCreatedAdId] = useState<string>("");

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const selectedSalon = useMemo(
    () => salons.find((salon) => salon.id === selectedSalonId),
    [salons, selectedSalonId]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken") || "";
        if (!accessToken) {
          toast.error("Please login again.");
          return;
        }

        const [ownerSalons, usagePlans] = await Promise.all([
          fetchByOwner(accessToken),
          fetchPlanUsage(accessToken),
        ]);

        const salonList = Array.isArray(ownerSalons) ? ownerSalons : [];
        setSalons(salonList);

        if (salonList.length > 0) {
          const storedSalonId = getStoredSalonId();
          const existingSalon = salonList.find((salon: any) => salon.id === storedSalonId);
          const nextSalonId = existingSalon?.id || salonList[0].id;
          setSelectedSalonId(nextSalonId);
          setStoredSalonId(nextSalonId);
        }

        const planList = Array.isArray(usagePlans) ? usagePlans : [];
        setPlans(planList);
        if (planList.length > 0) {
          setPlanId(planList[0].id);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load create-ad data");
      } finally {
        setLoadingPageData(false);
      }
    };

    loadData();
  }, []);

  const handleSalonChange = (salonId: string) => {
    setSelectedSalonId(salonId);
    setStoredSalonId(salonId);
  };

  const handleAdImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files);
    setAdImageFiles((prev) => [...prev, ...selectedFiles]);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdImagePreviews((prev) => [...prev, String(reader.result)]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdImage = (index: number) => {
    setAdImageFiles((prev) => prev.filter((_, i) => i !== index));
    setAdImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAdPhotos = async (files: File[], salonCode: string): Promise<string[]> => {
    if (files.length === 0) return [];

    const uploadBatchKey = `draft_${Date.now()}`;
    const uploaded = await Promise.all(
      files.map((file) => uploadAdImages(file, salonCode, uploadBatchKey))
    );
    return uploaded.map((item) => item.url);
  };

  const handleCreateAd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSalonId) {
      toast.error("Please select a salon first.");
      return;
    }
    if (!planId) {
      toast.error("Please select a plan.");
      return;
    }

    try {
      setCreatingAd(true);
      const salonCode = selectedSalon?.salonCode || selectedSalon?.id || selectedSalonId;
      const imageUrl = await uploadAdPhotos(adImageFiles, salonCode);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        imageUrl,
        planId,
        salonId: selectedSalonId,
      };

      const created = await createAd(payload);
      const adId = extractAdId(created);

      if (!adId) {
        throw new Error("Ad was created but the response did not include an ad id.");
      }

      setCreatedAdId(adId);
      setPaymentDialogOpen(true);
      toast.success("Ad created. Now upload payment proof to continue.");
    } catch (error: any) {
      toast.error(error?.message || error?.response?.data?.message || "Failed to create ad");
    } finally {
      setCreatingAd(false);
    }
  };

  const handlePaymentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setPaymentFile(file);
  };

  const handleSubmitPayment = async () => {
    if (!createdAdId) {
      toast.error("Missing ad reference id.");
      return;
    }

    if (!paymentFile) {
      toast.error("Please upload a payment slip first.");
      return;
    }

    try {
      setSubmittingPayment(true);

      const rawUser = sessionStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      const userId = user?.id || "unknown-user";

      const salonCode =
        selectedSalon?.salonCode ||
        selectedSalon?.salonName?.toLowerCase?.().replace(/\s+/g, "_") ||
        selectedSalon?.id ||
        selectedSalonId;

      const uploadResult = await uploadTransactionImage(
        paymentFile,
        userId,
        salonCode,
        createdAdId
      );

      const paymentPayload = {
        referenceId: createdAdId,
        paymentProofUrl: uploadResult.url,
        paymentMethod: "BANK_TRANSFER",
      };

      await createPayment(paymentPayload);
      toast.success("Payment submitted successfully. Your ad is now in review.");
      setPaymentDialogOpen(false);
      router.push("/salon_owner/myads");
    } catch (error: any) {
      toast.error(error?.message || error?.response?.data?.message || "Failed to submit payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <AuthGuard allowedRole="SALON_OWNER">
      <div className="flex h-screen bg-gray-50">
        <div className="hidden md:block">
          <SidebarSalon />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-64 z-50">
              <SidebarSalon />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <HeaderSalon sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <div className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-4xl font-playfair font-bold text-gray-900">Create Ad</h1>
                  <p className="text-gray-500 mt-1 text-sm md:text-base">
                    Add your ad details, then upload payment proof to complete submission.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => router.push("/salon_owner/myads")}
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to My Ads
                </Button>
              </div>

              <Card className="border-none shadow-sm text-gray-900">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Ad Information</CardTitle>
                  <CardDescription className="text-gray-600">
                    Fill all required fields and click Proceed to Payment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPageData ? (
                    <div className="py-8 text-center text-gray-500">Loading form data...</div>
                  ) : (
                    <form onSubmit={handleCreateAd} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-800">Select Salon</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="justify-between w-full text-left font-normal bg-white text-black border-gray-300 hover:bg-gray-100"
                                disabled={salons.length === 0}
                              >
                                {selectedSalon?.salonName || selectedSalon?.name || "No salon available"}
                                <ChevronDown size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-72 bg-white border border-gray-200 text-gray-900">
                              {salons.length > 0 ? (
                                salons.map((salon) => (
                                  <DropdownMenuItem
                                    key={salon.id}
                                    onClick={() => handleSalonChange(salon.id)}
                                    className="cursor-pointer text-gray-900"
                                  >
                                    {salon.salonName || salon.name}
                                  </DropdownMenuItem>
                                ))
                              ) : (
                                <DropdownMenuItem disabled>No salons available</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="planId" className="text-gray-800">Plan</Label>
                          <select
                            id="planId"
                            value={planId}
                            onChange={(event) => setPlanId(event.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C8A84B]"
                            required
                          >
                            <option value="" disabled>
                              Select a plan
                            </option>
                            {plans.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.planName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-gray-800">Ad Title</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder="Premium Hair Styling Service"
                          className="text-gray-900 placeholder:text-gray-400"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-gray-800">Description</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          placeholder="Describe your offer, package, and highlights..."
                          rows={5}
                          className="text-gray-900 placeholder:text-gray-400"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-800">Ad Images</Label>
                          <div>
                            <input
                              ref={adImageInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              multiple
                              className="hidden"
                              onChange={handleAdImageSelect}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="bg-white text-black border-gray-300 hover:bg-gray-100"
                              onClick={() => adImageInputRef.current?.click()}
                            >
                              <Upload size={16} className="mr-2" />
                              Upload Images
                            </Button>
                          </div>
                        </div>

                        {adImagePreviews.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {adImagePreviews.map((preview, index) => (
                              <div key={`${preview}-${index}`} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Ad Preview ${index + 1}`}
                                  className="w-full h-28 object-cover rounded-md border border-gray-200"
                                />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                                  onClick={() => removeAdImage(index)}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-sm text-center text-gray-600">
                            No images selected yet.
                          </div>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={creatingAd || salons.length === 0 || plans.length === 0}
                        className="bg-[#C8A84B] hover:bg-[#B39740] text-black font-semibold"
                      >
                        {creatingAd ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Creating Ad...
                          </>
                        ) : (
                          "Proceed to Payment"
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#1F1F1F] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Payment Slip</DialogTitle>
            <DialogDescription className="text-gray-200">
              Upload your payment proof to complete your ad submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-white">Payment Proof</Label>
              <input
                ref={paymentFileInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePaymentFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full bg-white text-black border-gray-300 hover:bg-gray-100"
                onClick={() => paymentFileInputRef.current?.click()}
              >
                <Upload size={16} className="mr-2" />
                {paymentFile ? "Change Slip" : "Upload Slip"}
              </Button>
              {paymentFile && (
                <p className="text-xs text-white">Selected: {paymentFile.name}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="text-white border-gray-500 hover:bg-gray-800"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitPayment}
              className="bg-[#C8A84B] hover:bg-[#B39740] text-black font-semibold"
              disabled={submittingPayment}
            >
              {submittingPayment ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
