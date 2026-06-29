const BASE_URL = "http://localhost:8080";
const ORG_ID = "123e4567-e89b-12d3-a456-426614174000";
const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const USER_ROLE = "ADMIN";

const headers = {
  "Content-Type": "application/json",
  "X-Organization-ID": ORG_ID,
  "X-User-Id": USER_ID,
  "X-User-Role": USER_ROLE
};

async function request(url, options = {}) {
  const finalOptions = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  };

  const response = await fetch(`${BASE_URL}${url}`, finalOptions);
  if (!response.ok) {
    let message = `API Error: ${response.status} ${response.statusText}`;
    try {
      const err = await response.json();
      message = err.message || message;
    } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (url) => request(url, { method: "GET" }),
  post: (url, body) => request(url, { method: "POST", body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: "DELETE" })
};
