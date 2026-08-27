import { errors } from "@strapi/utils";
import type { DishData, DailyMenuData } from "../../types";

const { ApplicationError } = errors;

interface RelationChange {
  connect?: Array<{
    id: number;
  }>;
  set?: Array<{
    id: number;
  }>;
}

interface DailyMenuChanges {
  first?: RelationChange;
  second?: RelationChange;
  dessert?: RelationChange;
  price?: number | null;
  sumPrice?: number | null;
}

const getDishId = (relation: any): number | null => {
  if (relation?.connect?.length) {
    return relation.connect[0].id;
  }

  if (relation?.set?.length) {
    return relation.set[0].id;
  }

  return null;
};

const validateDifferentDishes = (
  first: DishData | null,
  second: DishData | null,
  dessert: DishData | null,
) => {
  if (!first || !second || !dessert) {
    throw new ApplicationError("First, second and dessert are required.");
  }

  if (first?.documentId === second?.documentId) {
    throw new ApplicationError(
      "The first and second dishes must be different.",
    );
  }

  if (first?.documentId === dessert?.documentId) {
    throw new ApplicationError(
      "The first and dessert dishes must be different.",
    );
  }

  if (second?.documentId === dessert?.documentId) {
    throw new ApplicationError(
      "The second and dessert dishes must be different.",
    );
  }
};

export default {
  async beforeCreate(event: any) {
    const { data } = event.params as {
      data: DailyMenuChanges;
    };

    const firstId = getDishId(data.first);
    const secondId = getDishId(data.second);
    const dessertId = getDishId(data.dessert);

    if (!firstId || !secondId || !dessertId) {
      throw new ApplicationError("First, second and dessert are required.");
    }

    const { first, second, dessert } = await strapi
      .service("api::daily-menu.find-all-dishes")
      .findAllDishes(firstId, secondId, dessertId);

    validateDifferentDishes(first, second, dessert);

    const { sumPrice, price } = await strapi
      .service("api::daily-menu.menu-service")
      .calculateMenuPrice(first, second, dessert);

    data.sumPrice = sumPrice;
    data.price = price;
  },

  async beforeUpdate(event: any) {
    const { params } = event;

    const dailyMenus = await strapi
      .documents("api::daily-menu.daily-menu")
      .findMany({
        filters: params.where,
        populate: {
          first: true,
          second: true,
          dessert: true,
        },
      });

    const currentMenu = dailyMenus[0] as DailyMenuData | undefined;

    if (!currentMenu) {
      throw new ApplicationError("Daily menu not found.");
    }

    const changes = params.data as DailyMenuChanges;

    const firstId = getDishId(changes.first) ?? currentMenu.first?.id ?? null;
    const secondId =
      getDishId(changes.second) ?? currentMenu.second?.id ?? null;
    const dessertId =
      getDishId(changes.dessert) ?? currentMenu.dessert?.id ?? null;

    if (!firstId || !secondId || !dessertId) {
      throw new ApplicationError("First, second and dessert are required.");
    }

    const { first, second, dessert } = await strapi
      .service("api::daily-menu.find-all-dishes")
      .findAllDishes(firstId, secondId, dessertId);

    validateDifferentDishes(first, second, dessert);

    const { sumPrice, price } = await strapi
      .service("api::daily-menu.menu-service")
      .calculateMenuPrice(first, second, dessert);

    params.data.sumPrice = sumPrice;
    params.data.price = price;
  },
};
