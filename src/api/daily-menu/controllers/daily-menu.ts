import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import type { DishData, DailyMenuData } from "../types";

const { ValidationError } = errors;

export default factories.createCoreController(
  "api::daily-menu.daily-menu",
  ({ strapi }) => ({
    async findMenus(ctx) {
      const query = ctx.query as {
        min_precio?: string;
        max_precio?: string;
        excluir_alergenos?: string;
      };

      const minPrice =
        query.min_precio !== undefined ? Number(query.min_precio) : undefined;

      const maxPrice =
        query.max_precio !== undefined ? Number(query.max_precio) : undefined;

      const allergens: string[] =
        query.excluir_alergenos !== undefined &&
        query.excluir_alergenos !== null
          ? query.excluir_alergenos
              .split(",")
              .map((allergen) => allergen.trim().toLowerCase())
              .filter(Boolean)
          : [];

      if (minPrice !== undefined && !Number.isFinite(minPrice)) {
        throw new ValidationError(
          'The "min_precio" parameter must be a valid number.',
        );
      }

      if (maxPrice !== undefined && !Number.isFinite(maxPrice)) {
        throw new ValidationError(
          'The "max_precio" parameter must be a valid number.',
        );
      }

      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice
      ) {
        throw new ValidationError(
          "The min_precio parameter cannot be greater than max_precio.",
        );
      }

      const filters: Record<string, any> = {};

      if (minPrice !== undefined) {
        filters.price = {
          $gte: minPrice,
        };
      }

      if (maxPrice !== undefined) {
        filters.price = {
          ...filters.price,
          $lte: maxPrice,
        };
      }

      const menus = (await strapi
        .documents("api::daily-menu.daily-menu")
        .findMany({
          filters,
          populate: {
            first: {
              fields: ["documentId", "name", "price"],
              populate: {
                allergenList: true,
              },
            },
            second: {
              fields: ["documentId", "name", "price"],
              populate: {
                allergenList: true,
              },
            },
            dessert: {
              fields: ["documentId", "name", "price"],
              populate: {
                allergenList: true,
              },
            },
          },
        })) as DailyMenuData[];

      const filteredMenus = menus.filter((menu) => {
        const dishes: (DishData | null | undefined)[] = [
          menu.first,
          menu.second,
          menu.dessert,
        ];

        const hasExcludedAllergen = dishes.some((dish) =>
          dish?.allergenList?.some((allergen) =>
            allergens.includes(allergen.name.toLowerCase()),
          ),
        );

        return !hasExcludedAllergen;
      });

      return {
        data: filteredMenus.map((menu) => ({
          documentId: menu.documentId,
          day: menu.day,

          first: {
            name: menu.first?.name,
            price: menu.first?.price,
            allergenList:
              menu.first?.allergenList?.map((allergen) => allergen.name) ?? [],
          },

          second: {
            name: menu.second?.name,
            price: menu.second?.price,
            allergenList:
              menu.second?.allergenList?.map((allergen) => allergen.name) ?? [],
          },

          dessert: {
            name: menu.dessert?.name,
            price: menu.dessert?.price,
            allergenList:
              menu.dessert?.allergenList?.map((allergen) => allergen.name) ??
              [],
          },

          price: menu.price,
        })),
      };
    },

    async findDesserts(ctx) {
      const menus = await strapi
        .documents("api::daily-menu.daily-menu")
        .findMany({
          populate: {
            dessert: {
              fields: ["documentId", "name", "price"],
            },
          },
        });

      return {
        data: menus.map((menu) => ({
          documentId: menu.documentId,
          day: menu.day,
          dessert: menu.dessert,
        })),
      };
    },
  }),
);
