export type LegalStatus = "person" | "ip" | "ooo";
/** Роль бизнеса в ответе API — строка `lessor` (контракт с бэкендом). */
export type UserRole = "renter" | "lessor" | "admin";
export type LessorVerificationStatus =
  | "not_requested"
  | "pending"
  | "approved"
  | "rejected";

export interface ICategory {
  _id: string;
  key: string;
  name: string;
  isVisible: boolean;
}

export interface IAvailabilityRange {
  from: string;
  to: string;
  isBooked: boolean;
}

export interface IRentalListing {
  _id: string;
  title: string;
  description: string;
  categories: ICategory[];
  photos: string[];
  pricePerDay: number;
  minDays: number;
  unitsTotal: number;
  unitsAvailable: number;
  pickupType: "pickup" | "delivery" | "both";
  pickupAddress?: string;
  deliveryZone?: string;
  calendar: IAvailabilityRange[];
  ownerId: string;
  moderationStatus: "active" | "pending" | "rejected" | "hidden";
}

export interface ICatalogFilters {
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  priceFrom?: number;
  priceTo?: number;
  pickupType?: "pickup" | "delivery" | "both";
  unitsNeeded?: number;
  search?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IBookingRequest {
  listingId: string;
  dateFrom: string;
  dateTo: string;
  units: number;
  acceptedPersonalData: boolean;
}

export interface IBookingResult {
  bookingId: string;
  rentalAgreementPdfUrl: string;
  agencyAgreementPdfUrl: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface IBookingItem {
  _id: string;
  listingId: IRentalListing;
  dateFrom: string;
  dateTo: string;
  units: number;
  status: "pending" | "confirmed" | "cancelled";
  rentalAgreementPdfUrl: string;
  agencyAgreementPdfUrl: string;
}

export interface IUserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  status: LegalStatus;
  companyName?: string;
  inn?: string;
  ogrnOrOgrnip?: string;
  sbpPhone?: string;
  payoutPhone?: string;
  address?: string;
  passport?: string;
  isLessorVerified: boolean;
  lessorVerificationStatus: LessorVerificationStatus;
  lessorVerificationComment?: string;
  isRenterVerified: boolean;
  roles: UserRole[];
}
