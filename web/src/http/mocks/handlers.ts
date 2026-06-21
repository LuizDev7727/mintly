import { getOrganizationMetricsMock } from "./get-organization-metrics-mock";
import { getOrganizationsMock } from "./get-organizations-mock";
import { getChannelsMock } from "./get-channels-mock";
import { getSessionMock } from "./get-session-mock";
import { getFullOrganizationMock } from "./get-full-organization-mock";

export const handlers = [
  getOrganizationsMock,
  getChannelsMock,
  getSessionMock,
  getOrganizationMetricsMock,
  getFullOrganizationMock,
];
