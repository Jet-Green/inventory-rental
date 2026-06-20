export type LegalStatus = "person" | "ip" | "ooo";
export type UserRole = "renter" | "business" | "admin";

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
  ownerId: string | { _id: string; fullName?: string; phone?: string };
  rejectionReason?: string;
  moderationStatus: ListingStatus;
}

export type ListingStatus = "draft" | "active" | "pending" | "rejected" | "hidden";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export interface ICatalogFilters {
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  priceFrom?: number;
  priceTo?: number;
  pickupType?: "pickup" | "delivery" | "both";
  unitsNeeded?: number;
  search?: string;
  sortBy?: "priceAsc" | "priceDesc";
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
  status: BookingStatus;
  days?: number;
  pricePerDay?: number;
  totalPrice?: number;
  agentCommission?: number;
  rentalAgreementPdfUrl: string;
  agencyAgreementPdfUrl: string;
}

export interface IBookingRenterSnippet {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface IBookingItem {
  _id: string;
  listingId: IRentalListing;
  renterId?: IBookingRenterSnippet | string;
  dateFrom: string;
  dateTo: string;
  units: number;
  days?: number;
  pricePerDay?: number;
  totalPrice?: number;
  agentCommission?: number;
  status: BookingStatus;
  rentalAgreementPdfUrl: string;
  agencyAgreementPdfUrl: string;
}

export interface IPayResult {
  bookingId: string;
  status: "confirmed";
  paid: boolean;
}

export interface IContractsResult {
  rentalAgreementPdfUrl: string;
  agencyAgreementPdfUrl: string;
}

export interface IBookedRange {
  bookingId: string;
  dateFrom: string;
  dateTo: string;
  units: number;
  status: "pending" | "confirmed";
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

/** Полная категория (админка), включая icon/order — формат backend Category. */
export interface ICategoryFull extends ICategory {
  icon?: string;
  order: number;
}

export interface IUploadResult {
  urls: string[];
  storage: "cloud" | "local";
}

/** Компания из проксирования DaData по ИНН. */
export interface IDadataCompany {
  inn: string;
  ogrn: string;
  name: string;
  shortName?: string;
  address: string;
  kpp?: string | null;
  type?: string;
  raw?: Record<string, unknown>;
}

/** Пользователь в админ-таблице (агрегаты по объявлениям/броням). */
export interface IAdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roles: UserRole[];
  isBlocked: boolean;
  isRenterVerified: boolean;
  organizationStatus: "pending" | "approved" | "rejected" | "none";
  listingsCount: number;
  bookingsCount: number;
  createdAt?: string;
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
