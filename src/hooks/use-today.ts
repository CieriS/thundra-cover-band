import { useSyncExternalStore } from "react";

import { getTodayIsoDate } from "@/lib/format";

const subscribe = () => () => {};
const getBuildDate = () => __BUILD_DATE__;
const getClientDate = () => getTodayIsoDate();

/**
 * Data odierna (`YYYY-MM-DD`) compatibile con il prerender: markup statico e
 * idratazione usano la data della build, poi React ri-renderizza con quella reale.
 * Così le date passate nel frattempo spariscono senza errori di idratazione.
 */
export function useToday(): string {
  return useSyncExternalStore(subscribe, getClientDate, getBuildDate);
}
