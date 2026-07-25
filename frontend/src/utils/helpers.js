/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export const getYouTubeID = (url) => {
  if (typeof url !== "string") return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Formats duration in minutes to human-readable string (e.g., "2d : 3h : 15m")
 * @param {number|string} durationInMinutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (durationInMinutes) => {
  const totalMinutes = parseInt(durationInMinutes, 10) || 0;
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  let result = "";
  if (days > 0) result += `${days}d`;
  if (hours > 0) result += (result ? " : " : "") + `${hours}h`;
  if (minutes > 0) result += (result ? " : " : "") + `${minutes}m`;
  return result || "0m";
};

/**
 * Checks if user is currently logged in
 * @returns {boolean} - Login status
 */
export const isUserLoggedIn = () => {
  return localStorage.getItem("currentlyLoggedIn") === "true";
};