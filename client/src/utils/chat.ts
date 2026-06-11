/**
 * Checks if a text consists only of emojis (and whitespace) and is short.
 */
export const isJumboEmoji = (text: string): boolean => {
  return /^(\p{Extended_Pictographic}|\s)+$/u.test(text) && text.length <= 10;
};

/**
 * Formats a date string into "Today", "Yesterday", or a full date.
 */
export const formatDateLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
};

/**
 * Formats a time string into a 2-digit hour/minute format.
 */
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
