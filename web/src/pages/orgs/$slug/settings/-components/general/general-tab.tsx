import { UpdateOrganizationAvatar } from "./update-organization-avatar";

type GeneralTabProps = {
  name: string;
  avatarUrl: string | null;
};

export function GeneralTab({ name, avatarUrl }: GeneralTabProps) {
  return (
    <div className="space-y-4">
      <UpdateOrganizationAvatar name={name} avatarUrl={avatarUrl} />
      {/*<UpdateOrganizationNameForm
        slug={organization!.slug}
        name={organization!.name}
      />
      <LeaveOrganization isOwner={isOwner} />
      {isOwner && <DeleteOrganization />}*/}
    </div>
  );
}
