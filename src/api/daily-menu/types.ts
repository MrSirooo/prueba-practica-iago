export interface DishData {
  id: number;
  documentId: string;
  name: string;
  price?: number | null;
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
