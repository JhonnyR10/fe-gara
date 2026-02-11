export function formatTime(ms) {
  if (ms == null) return "--:--:--.---";

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  const pad2 = (n) => String(n).padStart(2, "0");
  const pad3 = (n) => String(n).padStart(3, "0");

  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.${pad3(milliseconds)}`;
}
