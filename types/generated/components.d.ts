import type { Schema, Struct } from '@strapi/strapi';

export interface RestaurantAllergen extends Struct.ComponentSchema {
  collectionName: 'components_restaurant_allergens';
  info: {
    displayName: 'allergen';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'restaurant.allergen': RestaurantAllergen;
    }
  }
}
