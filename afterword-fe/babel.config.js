module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource is the NativeWind v4 integration point.
      // Do NOT add "nativewind/babel" — that is the v2/v3 plugin and
      // conflicts with v4's approach, causing subtle transform errors.
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
  };
};
