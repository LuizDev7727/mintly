import { getOrganizationMetricsMock } from "./get-organization-metrics-mock";
import { getOrganizationsMock } from "./get-organizations-mock";
import { getProjectsMock } from "./get-projects-mock";
import { getSessionMock } from "./get-session-mock";

export const handlers = [
  getOrganizationsMock,
  getProjectsMock,
  getSessionMock,
  getOrganizationMetricsMock,
];
