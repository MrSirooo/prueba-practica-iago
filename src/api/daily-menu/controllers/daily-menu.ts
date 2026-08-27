import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

const { ValidationError } = errors;

export default factories.createCoreController(
  "api::daily-menu.daily-menu",
  ({ strapi }) => ({
    async find(ctx) {
      const query = ctx.query as {
        min_precio?: string;
        max_precio?: string;
      };

      const minPrice =
        query.min_precio !== undefined ? Number(query.min_precio) : undefined;

      const maxPrice =
        query.max_precio !== undefined ? Number(query.max_precio) : undefined;

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

      const menus = await strapi
        .documents("api::daily-menu.daily-menu")
        .findMany({
          filters,
          populate: {
            first: {
              fields: ["documentId", "name", "price"],
            },
            second: {
              fields: ["documentId", "name", "price"],
            },
            dessert: {
              fields: ["documentId", "name", "price"],
            },
          },
        });

      return {
        data: menus.map((menu) => ({
          documentId: menu.documentId,
          day: menu.day,
          first: menu.first,
          second: menu.second,
          dessert: menu.dessert,
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
