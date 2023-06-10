import dayjs from "dayjs";

export const formatDuration = (startTime?: string | Date | null, endTime?: string | Date | null) => {
  if (!startTime || !endTime) return null;

  const diff = dayjs(endTime).diff(dayjs(startTime));
  const duration = dayjs.duration(diff).format("m[m ]s[s]").replace("0m", "");

  return duration;
};
