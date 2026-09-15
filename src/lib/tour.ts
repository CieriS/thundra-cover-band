import type { TourDate } from "@/data/band-data";
import { getTodayIsoDate } from "@/lib/format";

/** Solo le date di oggi o future (già ordinate): quelle passate spariscono da sole. */
export function getUpcomingShows(shows: readonly TourDate[], today: string = getTodayIsoDate()): TourDate[] {
  return shows.filter((show) => show.date >= today);
}
