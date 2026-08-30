const API_BASE = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // keep default message
    }

    throw new Error(message);
  }

  return response.json();
}

export const api = {
  health() {
    return request("/health");
  },

  search(query) {
    return request(`/search?q=${encodeURIComponent(query)}`);
  },

  diseaseEvidence(id) {
    return request(`/evidence/disease/${id}`);
  },

  targetEvidence(id) {
    return request(`/evidence/target/${id}`);
  },

  disease(id) {
    return request(`/diseases/${id}`);
  },

  target(id) {
    return request(`/targets/${id}`);
  },

  compound(id) {
    return request(`/compounds/${id}`);
  },
};