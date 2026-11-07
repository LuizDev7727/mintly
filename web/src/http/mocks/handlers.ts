import { createChannelMock } from "./create-channel-mock";
import { createFolderMock } from "./create-folder-mock";
import { createProjectMock } from "./create-project-mock";
import { deleteFolderMock } from "./delete-folder-mock";
import { getActiveOrganizationMock } from "./get-active-organization-mock";
import { getBestMomentsMock } from "./get-best-moments-mock";
import { getChannelsMock } from "./get-channels-mock";
import { getFoldersMock } from "./get-folders-mock";
import { getFullOrganizationMock } from "./get-full-organization-mock";
import { getMembersCountMock } from "./get-members-count-mock";
import { getOrganizationMetricsMock } from "./get-organization-metrics-mock";
import { getOrganizationPendingInvitesMock } from "./get-organization-pending-invites-mock";
import { getOrganizationsMock } from "./get-organizations-mock";
import { getPostsMock } from "./get-posts-mock";
import { getProjectsMock } from "./get-projects-mock";
import { getSearchResultsMock } from "./get-search-results-mock";
import { getSessionMock } from "./get-session-mock";
import { updateFolderMock } from "./update-folder-mock";

export const handlers = [
  getActiveOrganizationMock,
  getOrganizationsMock,
  getChannelsMock,
  getSessionMock,
  getOrganizationMetricsMock,
  getFullOrganizationMock,
  getFoldersMock,
  createFolderMock,
  updateFolderMock,
  deleteFolderMock,
  getPostsMock,
  createChannelMock,
  getProjectsMock,
  createProjectMock,
  getBestMomentsMock,
  getSearchResultsMock,
  getMembersCountMock,
  getOrganizationPendingInvitesMock,
];
