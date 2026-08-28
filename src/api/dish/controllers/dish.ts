import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::dish.dish",
  ({ strapi }) => ({
    async findPopular() {
      const dishes = await strapi.documents("api::dish.dish").findMany({
        sort: {
          popularity: "desc",
        },
        limit: 5,
      });

      return {
        data: dishes.map((dish) => ({
          documentId: dish.documentId,
          name: dish.name,
          type: dish.type,
          popularity: dish.popularity,
        })),
      };
    },
  }),
);
