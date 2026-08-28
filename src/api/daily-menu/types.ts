export interface AllergenData {
  id: number;
  name: string;
  description?: string | null;
  icon?: unknown;
}

export interface DishData {
  id: number;
  documentId: string;
  name: string;
  type: string;
  price?: number | null;
  allergenList?: AllergenData[] | null;
  popularity: number;
}

export interface DailyMenuData {
  id: number;
  documentId: string;
  day: string;
  first?: DishData | null;
  second?: DishData | null;
  dessert?: DishData | null;
  price?: number | null;
  sumPrice?: number | null;
}
