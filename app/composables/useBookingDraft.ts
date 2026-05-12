import type { IRentalListing } from "~/types/rental";

export interface IBookingDraft {
  listingId: string;
  title: string;
  photo?: string;
  dateFrom: string;
  dateTo: string;
  units: number;
  pricePerDay: number;
  minDays: number;
  pickupLabel: string;
  categoriesLine: string;
  listingNumericId?: string;
}

export function useBookingDraft() {
  return useState<IBookingDraft | null>("booking-draft", () => null);
}

export function listingToDraft(
  listing: IRentalListing,
  form: { dateFrom: string; dateTo: string; units: number },
  pickupLabel: string,
): IBookingDraft {
  const categoriesLine =
    listing.categories?.map((c) => c.name).join(" · ") || "";
  return {
    listingId: listing._id,
    title: listing.title,
    photo: listing.photos?.[0],
    dateFrom: form.dateFrom,
    dateTo: form.dateTo,
    units: form.units,
    pricePerDay: listing.pricePerDay,
    minDays: listing.minDays,
    pickupLabel,
    categoriesLine,
    listingNumericId: String(listing._id).slice(-5),
  };
}
