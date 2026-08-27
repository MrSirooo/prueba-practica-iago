export default {
  routes: [
    {
      method: "GET",
      path: "/menus",
      handler: "daily-menu.find",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/menus/postres",
      handler: "daily-menu.findDesserts",
      config: {
        auth: false,
      },
    },
  ],
};
