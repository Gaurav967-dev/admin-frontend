const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Prevent several simultaneous 401 responses from rotating the same refresh token at once.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_URL}/refresh-token`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

async function getRefreshResult(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  async function makeRequest() {
    return fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    });
  }

  let response = await makeRequest();

  if (
    response.status === 401 &&
    !["/refresh-token", "/sign", "/signup"].includes(path)
  ) {
    const refreshed = await getRefreshResult();

    if (refreshed) {
      // Retry original request once.
      response = await makeRequest();
    }

    // Authentication still failed after refresh.
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.replace("/");
      }

      throw new ApiError(401, "Session expired. Please sign in again.");
    }
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const body = await response.json();

      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (
        Array.isArray(body.detail) &&
        body.detail.length > 0
      ) {
        const firstError = body.detail[0];
      
        const field = Array.isArray(firstError.loc) ? firstError.loc.slice(1).join(".") : "Field";
      
        message = `${field}: ${firstError.msg}`;
      }
    } catch {}

    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}