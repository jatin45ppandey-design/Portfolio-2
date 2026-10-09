export function isOwnerGithubId(
  githubId: string | number | null | undefined,
  configuredOwnerId = process.env.GITHUB_OWNER_ID,
) {
  if (githubId === null || githubId === undefined || !configuredOwnerId) {
    return false;
  }

  const candidateId = String(githubId);
  const ownerId = String(configuredOwnerId);

  return /^\d+$/.test(candidateId) && /^\d+$/.test(ownerId) && candidateId === ownerId;
}
