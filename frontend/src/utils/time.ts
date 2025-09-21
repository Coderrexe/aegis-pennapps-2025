export const formatTimeAgo = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};
