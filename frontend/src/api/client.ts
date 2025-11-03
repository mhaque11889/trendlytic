const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type Conference = {
  _id: string;
  name: string;
  acronym?: string;
  year: number;
  location?: string;
};

export async function fetchConferences(): Promise<Conference[]> {
  const res = await fetch(`${API_URL}/api/conferences?page=1&pageSize=20`);
  if (!res.ok) throw new Error('Failed to fetch conferences');
  const json = await res.json();
  return json.items as Conference[];
}


