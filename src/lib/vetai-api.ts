export type BreedResult = {
  breed: string;
  breedConfidence: number;
};

export type DiagnosisResult = {
  breed: string;
  breedConfidence: number;
  lesion: string;
  lesionConfidence: number;
  lesionCategory: string;
  lowConfidence?: boolean;
  treatment: {
    recommendation: string;
    source: string;
    ruleTrigger: string;
    exactRuleHit: string;
  };
  diet: {
    profile: string;
    recommended: string[];
    quantity: string;
    avoid: string[];
    conditionTip: string;
  };
  aiRecommendation?: string | null;
  id?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.detail) {
      if (typeof body.detail === "string") return body.detail;
      if (Array.isArray(body.detail)) {
        return body.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ");
      }
    }
  } catch {
    // ignore
  }
  return `Request failed (${res.status})`;
}

export async function predictBreed(dogImage: File): Promise<BreedResult> {
  const form = new FormData();
  form.append("dog_image", dogImage);

  const res = await fetch(`${API_URL}/breed`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function predictDiagnosis(
  dogImage: File,
  lesionImage: File,
): Promise<DiagnosisResult> {
  const form = new FormData();
  form.append("dog_image", dogImage);
  form.append("lesion_image", lesionImage);

  const res = await fetch(`${API_URL}/diagnose`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}
