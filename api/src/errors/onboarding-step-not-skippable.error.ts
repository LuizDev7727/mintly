export class OnboardingStepNotSkippableError extends Error {
  constructor() {
    super("The current onboarding step cannot be skipped");
  }
}
