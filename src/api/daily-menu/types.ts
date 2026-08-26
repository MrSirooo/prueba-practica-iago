export interface DishData {
  documentId: string;
  name: string;
  price?: number | null;
}

export interface DailyMenuData {
  documentId: string;
  day: string;
  first?: DishData | null;
  second?: DishData | null;
  dessert?: DishData | null;
  price?: number | null;
  sumPrice?: number | null;
}
