const API_BASE = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export async function searchBackend(query) {
  if (!query || !query.trim()) {
    return { query: "", diseases: [], targets: [], compounds: [] };
  }
  return request(`/search?q=${encodeURIComponent(query.trim())}`);
}

export async function getDisease(id) {
  return request(`/diseases/${id}`);
}

export async function getDiseaseEvidence(id) {
  return request(`/evidence/disease/${id}`);
}

export async function getTarget(id) {
  return request(`/targets/${id}`);
}

export async function getTargetEvidence(id) {
  return request(`/evidence/target/${id}`);
}

export async function getCompound(id) {
  return request(`/compounds/${id}`);
}

export async function getHealth() {
  return request(`/health`);
}

export async function getPublications() {
  return request(`/publications`);
}

export async function getPrediction(targetId, compoundId) {
  return request(`/predictions/target/${targetId}/compound/${compoundId}`);
}

export async function createScenario(payload) {
  return request(`/scenarios`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export default {
  searchBackend,
  getDisease,
  getDiseaseEvidence,
  getTarget,
  getTargetEvidence,
  getCompound,
  getHealth,
  getPublications,
  getPrediction,
  createScenario,
};
