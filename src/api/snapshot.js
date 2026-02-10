import { apiGet } from "./http";

export function fetchSnapshot() {
  return apiGet("/gara/attiva/snapshot");
}
