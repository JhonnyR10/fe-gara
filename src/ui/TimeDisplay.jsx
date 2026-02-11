import { formatTime } from "./formatTime";

export default function TimeDisplay({ ms, muted = false }) {
  return (
    <span className={`time ${muted ? "time-muted" : ""}`}>
      {formatTime(ms)}
    </span>
  );
}
