import { toast } from "sonner";
import { API_URL } from "@/lib/config";

type ValidationIssue = {
  loc?: Array<string | number>;
  msg?: string;
};

type ErrorBody = {
  detail?: string | ValidationIssue[];
  message?: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Avoid multiple simultaneous refresh requests.
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

function getRefreshResult(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

// Convert FastAPI responses to structured errors.
async function readApiError(
  response: Response
): Promise<ApiError> {
  let message = `Request failed: ${response.status}`;

  const fieldErrors: Record<string, string> = {};

  try {
    const body = (await response.json()) as ErrorBody;

    if (typeof body.detail === "string") {
      message = body.detail;
    } else if (Array.isArray(body.detail)) {
      for (const issue of body.detail) {
        if (typeof issue.msg !== "string") continue;

        const location = Array.isArray(issue.loc)
          ? issue.loc
          : [];

        if (location[0] === "body") {
          const field = location
            .slice(1)
            .map(String)
            .join(".");

          if (field && !fieldErrors[field]) {
            fieldErrors[field] = issue.msg;
          }
        }

        if (message.startsWith("Request failed:")) {
          message = issue.msg;
        }
      }
    } else if (typeof body.message === "string") {
      message = body.message;
    }
  } catch {
    // Some error responses don't contain JSON.
  }

  return new ApiError(
    response.status,
    message,
    fieldErrors
  );
}

// Display appropriate HTTP notifications.
function notifyApiError(
  error: ApiError,
  sessionExpired = false
) {
  if (typeof window === "undefined") return;

  if (sessionExpired || error.status === 419) {
    toast.error("Session expired. Please sign in again.", {
      id: "session-expired",
    });

    window.dispatchEvent(
      new Event("expinova:session-expired")
    );

    return;
  }

  const messages: Record<number, string> = {
    0: "Unable to connect to the server.",
    400: error.message,
    401: error.message || "Unauthorized request.",
    403: "You do not have permission to perform this action.",
    404: error.message || "Requested resource not found.",
    409: error.message,
    422: "Please correct the highlighted form fields.",
    429: "Too many requests. Please try again later.",
  };

  const message =
    messages[error.status] ??
    (error.status >= 500
      ? "Server error. Please try again later."
      : error.message);

  toast.error(message, {
    id: `api-error-${error.status}-${message}`,
  });
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  async function makeRequest(): Promise<Response> {
    try {
      return await fetch(`${API_URL}${path}`, {
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
    } catch (error) {
      if (options.signal?.aborted) {
        throw error;
      }

      const networkError = new ApiError(
        0,
        "Unable to connect to the server."
      );

      notifyApiError(networkError);
      throw networkError;
    }
  }

  let response = await makeRequest();

  const publicAuthPaths = [
    "/sign",
    "/signup",
    "/refresh-token",
  ];

  // Retry protected requests once after refreshing.
  if (
    response.status === 401 &&
    !publicAuthPaths.includes(path)
  ) {
    const refreshed = await getRefreshResult();

    if (refreshed) {
      response = await makeRequest();
    }

    if (response.status === 401) {
      const error = new ApiError(
        401,
        "Session expired. Please sign in again."
      );

      notifyApiError(error, true);
      throw error;
    }
  }

  if (!response.ok) {
    const error = await readApiError(response);

    notifyApiError(error);
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}