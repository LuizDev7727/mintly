export function EmptyInvitedMembers() {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center">
      <p className="text-sm font-medium">No invites yet</p>
      <p className="text-sm text-muted-foreground">
        Invited teammates will show up here.
      </p>
    </div>
  );
}
