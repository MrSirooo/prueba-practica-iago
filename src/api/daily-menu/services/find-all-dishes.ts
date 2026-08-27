import type { DishData } from "../types";

export default () => ({
  async findAllDishes(
    firstId: number,
    secondId: number,
    dessertId: number,
  ): Promise<{
    first: DishData | null;
    second: DishData | null;
    dessert: DishData | null;
  }> {
    const dishes = await strapi.db.query("api::dish.dish").findMany({
      where: {
        id: {
          $in: [firstId, secondId, dessertId],
        },
      },
    });

    const first =
      (dishes.find((dish) => dish.id === firstId) as DishData) ?? null;

    const second =
      (dishes.find((dish) => dish.id === secondId) as DishData) ?? null;

    const dessert =
      (dishes.find((dish) => dish.id === dessertId) as DishData) ?? null;

    return {
      first,
      second,
      dessert,
    };
  },
});
