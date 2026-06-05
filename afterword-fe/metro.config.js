const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

/**
 * @tanstack/query-core v5 ships two builds:
 *   - build/modern/ — uses ES2022 `this.#privateField` syntax
 *   - build/legacy/ — plain ES5-compatible, no private fields
 *
 * Metro (with package-exports enabled) resolves the `exports` field which
 * points to `build/modern/`. Hermes on older Expo Go / managed builds
 * rejects the private-field syntax with "private properties are not supported".
 *
 * Fix: intercept resolution for the two tanstack packages and force the
 * legacy build. All other packages continue to use package-exports normally
 * (important for NativeWind v4 which relies on it).
 */
const TANSTACK_LEGACY_MAP = {
  "@tanstack/query-core": path.resolve(
    __dirname,
    "node_modules/@tanstack/query-core/build/legacy/index.cjs"
  ),
  "@tanstack/react-query": path.resolve(
    __dirname,
    "node_modules/@tanstack/react-query/build/legacy/index.cjs"
  ),
};

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (TANSTACK_LEGACY_MAP[moduleName]) {
    return {
      filePath: TANSTACK_LEGACY_MAP[moduleName],
      type: "sourceFile",
    };
  }
  // Fall through to Metro's default resolver (respects NativeWind exports, etc.)
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });