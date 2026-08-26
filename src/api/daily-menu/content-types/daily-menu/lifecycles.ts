import { errors } from "@strapi/utils";
import type { DailyMenuData } from "../../types";

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
}

const getRelationIds = (relation?: RelationChange): number[] => {
  if (relation?.connect) {
    return relation.connect.map((item) => item.id);
  }

  if (relation?.set) {
    return relation.set.map((item) => item.id);
  }

  return [];
};

const validateDifferentDishes = (
  firstId: string | undefined,
  secondId: string | undefined,
  dessertId: string | undefined,
) => {
  if (firstId && firstId === secondId) {
    throw new ApplicationError(
      "The first and second dishes must be different.",
    );
  }

  if (firstId && firstId === dessertId) {
    throw new ApplicationError(
      "The first and dessert dishes must be different.",
    );
  }

  if (secondId && secondId === dessertId) {
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

    const firstIds = getRelationIds(data.first);
    const secondIds = getRelationIds(data.second);
    const dessertIds = getRelationIds(data.dessert);

    const dishIds = [...firstIds, ...secondIds, ...dessertIds];

    const dishes = await strapi.documents("api::dish.dish").findMany({
      filters: {
        id: {
          $in: dishIds,
        },
      },
    });

    const getDocumentId = (id: number) =>
      dishes.find((dish) => dish.id === id)?.documentId;

    const firstDocumentId = getDocumentId(firstIds[0]);
    const secondDocumentId = getDocumentId(secondIds[0]);
    const dessertDocumentId = getDocumentId(dessertIds[0]);

    validateDifferentDishes(
      firstDocumentId,
      secondDocumentId,
      dessertDocumentId,
    );
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

    let firstDocumentId = currentMenu.first?.documentId;
    let secondDocumentId = currentMenu.second?.documentId;
    let dessertDocumentId = currentMenu.dessert?.documentId;

    const firstIds = getRelationIds(changes.first);
    const secondIds = getRelationIds(changes.second);
    const dessertIds = getRelationIds(changes.dessert);

    const dishIds = [...firstIds, ...secondIds, ...dessertIds];

    if (dishIds.length > 0) {
      const dishes = await strapi.documents("api::dish.dish").findMany({
        filters: {
          id: {
            $in: dishIds,
          },
        },
      });

      const getDocumentId = (id: number) =>
        dishes.find((dish) => dish.id === id)?.documentId;

      if (firstIds.length > 0) {
        firstDocumentId = getDocumentId(firstIds[0]);
      }

      if (secondIds.length > 0) {
        secondDocumentId = getDocumentId(secondIds[0]);
      }

      if (dessertIds.length > 0) {
        dessertDocumentId = getDocumentId(dessertIds[0]);
      }
    }

    validateDifferentDishes(
      firstDocumentId,
      secondDocumentId,
      dessertDocumentId,
    );
  },
};
