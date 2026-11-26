// The OAuth `state` is `orgSlug,channelId[,onboarding]`. The optional third part
// marks a connection started from the onboarding, which runs in a new tab that
// the callback closes instead of redirecting to the app.
export const ONBOARDING_OAUTH_SOURCE = "onboarding";
