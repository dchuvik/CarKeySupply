export interface CompanyConfig {
  name: string;
  fullName: string;
  branding: {
    icon: string;
    font: string;
    tagline?: string;
    logoSuffix?: string;
    logoImage?: string;
    favicon?: string;
  };
  address: string;
  zipCode: string;
  city: string;
  state?: string;
  country?: string;
  areaServed?: string[];
  services?: string[];
  phone: string;
  email: string;
  priceRange?: string;
  description?: string;
  geo?: {
    lat: number;
    lng: number;
  };
}
