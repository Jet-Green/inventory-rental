export type LegalStatus = "person" | "ip" | "ooo";
/** Роль кабинета бизнеса в API — `business` (в старых данных могло быть `lessor`). */
export type UserRole = "renter" | "business" | "admin" | "lessor";

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

/** Организация (верификация бизнеса); в админке приходит с populate orgManagers. */
export interface IOrganizationManagerSnippet {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
}

export interface IOrganization {
  _id: string;
  legalStatus: LegalStatus;
  inn?: string;
  ogrnOrOgrnip?: string;
  companyName?: string;
  payoutPhone?: string;
  moderationStatus: "pending" | "approved" | "rejected";
  moderatorComment?: string;
  orgManagers?: IOrganizationManagerSnippet[] | string[];
}

/** Профиль пользователя (реквизиты организации — в коллекции organizations). */
export interface IUserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  passport?: string;
  isRenterVerified: boolean;
  roles: UserRole[];
}
