import { errors } from "@strapi/utils";
import type { DishData } from "../types";

const { ApplicationError } = errors;
const TAX_RATE = 0.1;

export default () => ({
  async calculateSumPrice(
    first: DishData,
    second: DishData,
    dessert: DishData,
  ): Promise<number> {
    if (first.price === null || first.price === undefined) {
      throw new ApplicationError(`Dish "${first.name}" does not have a price.`);
    }

    if (second.price === null || second.price === undefined) {
      throw new ApplicationError(
        `Dish "${second.name}" does not have a price.`,
      );
    }

    if (dessert.price === null || dessert.price === undefined) {
      throw new ApplicationError(
        `Dish "${dessert.name}" does not have a price.`,
      );
    }

    return Number(first.price + second.price + dessert.price);
  },

  async applyTaxes(sumPrice: number) {
    return Number((sumPrice + sumPrice * TAX_RATE).toFixed(3));
  },

  async calculateMenuPrice(
    first: DishData,
    second: DishData,
    dessert: DishData,
  ): Promise<{ sumPrice: number; price: number }> {
    const sumPrice = await this.calculateSumPrice(first, second, dessert);
    const price = Number(await this.applyTaxes(sumPrice));

    return { sumPrice, price };
  },
});
