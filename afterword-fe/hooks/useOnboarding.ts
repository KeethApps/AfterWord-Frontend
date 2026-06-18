/**
 * Re-exports the shared onboarding hook from OnboardingContext.
 * All consumers now share a single source of truth for `hasOnboarded`.
 */
export { useOnboarding } from "./OnboardingContext";