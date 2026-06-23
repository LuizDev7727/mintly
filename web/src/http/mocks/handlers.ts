import { getOrganizationMetricsMock } from "./get-organization-metrics-mock";
import { getOrganizationsMock } from "./get-organizations-mock";
import { getChannelsMock } from "./get-channels-mock";
import { getSessionMock } from "./get-session-mock";
import { getFullOrganizationMock } from "./get-full-organization-mock";
import { getFoldersMock } from "./get-folders-mock";
import { createFolderMock } from "./create-folder-mock";
import { updateFolderMock } from "./update-folder-mock";
import { deleteFolderMock } from "./delete-folder-mock";

export const handlers = [
  getOrganizationsMock,
  getChannelsMock,
  getSessionMock,
  getOrganizationMetricsMock,
  getFullOrganizationMock,
  getFoldersMock,
  createFolderMock,
  updateFolderMock,
  deleteFolderMock,
];
