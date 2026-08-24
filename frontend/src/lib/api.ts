export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request(url: string, options: RequestOptions = {}) {
  const { token, headers, ...rest } = options;
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...rest,
  });

  if (!response.ok) {
    let errorDetail = "Request failed";
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  if (response.status === 204) return null;
  
  try {
    return await response.json();
  } catch (_) {
    return null;
  }
}

export const api = {
  get: (url: string, token?: string) => request(url, { method: "GET", token }),
  post: (url: string, body: any, token?: string) => request(url, { method: "POST", body: JSON.stringify(body), token }),
  put: (url: string, body: any, token?: string) => request(url, { method: "PUT", body: JSON.stringify(body), token }),
  delete: (url: string, token?: string) => request(url, { method: "DELETE", token }),
};
