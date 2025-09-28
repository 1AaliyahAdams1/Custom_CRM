export const ROLE_VISIBILITY = {
  "Sales Representative": ["owned", "unowned"],
  "Sales Manager": ["owned", "unowned", "team-owned"],
  "C-level": ["owned", "unowned", "team-owned", "all"],
};

export const determineOwnership = (entity, currentUserId, teamMemberIds = []) => {
  if (!entity) return "n/a";

  if (!entity.OwnerID) return "unowned";

  if (entity.OwnerID === currentUserId) return "owned";

  if (teamMemberIds.includes(entity.OwnerID)) return "team-owned";

  return "other"; 
};
