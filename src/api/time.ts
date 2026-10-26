interface TimeResponse {
  timezone: string;
  formatted: string;
  timestamp: number;
  weekDay: number;
  day: number;
  mouth: number;
  year: number;
  hour: number;
  minute: number;
}

export async function getTime(): Promise<TimeResponse | never> {
  const url = "https://tools.aimylogic.com/api/now?tz=Europe/Moscow";
  const response = await fetch(url, { method: "get" });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const result: TimeResponse = await response.json();
  return result;
}
