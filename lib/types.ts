export interface Salon {
  id: string;
  name: string;
  category: 'ACADEMY & SALON' | 'CSI' | 'Gampaha';
  location: string;
  district: string;
  image: string;
  rating?: number;
  reviews?: number;
  description: string;
  services: Service[];
  gallery: string[];
  contact: {
    phone: string;
    whatsapp: string;
    email?: string;
    address: string;
  };
  qualifications: string[];
  experience: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
}

export interface Service {
  id: string;
  name: string;
  products?: string[];
  category: string;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface PricingPackage {
  id: string;
  duration: string;
  price: number;
  pricePerDay: number;
  billed: string;
  benefits: string[];
  extraBenefits?: ExtraBenefit[];
  isPopular?: boolean;
}

export interface ExtraBenefit {
  label: string;
  amount: string;
}
