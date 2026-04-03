const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export const formatDateTime = (value) => {
  if (!value && value !== 0) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = DATE_TIME_FORMATTER.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  const weekday = parts.weekday || "";
  const day = parts.day || "";
  const month = parts.month || "";
  const year = parts.year || "";
  const hour = parts.hour || "00";
  const minute = parts.minute || "00";
  const second = parts.second || "00";

  return `${weekday} ${day}-${month}-${year} ${hour}:${minute}:${second}`;
};

