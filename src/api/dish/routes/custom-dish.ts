export default {
  routes: [
    {
      method: "GET",
      path: "/dish/popular",
      handler: "dish.findPopular",
      config: {
        auth: false,
      },
    },
  ],
};
