const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

export async function apiRequest(
  endpoint: string,
  options: RequestOptions = {},
) {
  const { method = "GET", body, headers = {} } = options;

  let token = options.token;
  if (!token && typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || undefined;
  }

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
    if (response.status === 401 && typeof window !== "undefined") {
      // Prevention of infinite loop: Clear auth state before redirecting
      localStorage.removeItem("accessToken");
      // Dynamic import to avoid circular dependencies if simple
      // or just import at top if clean. Assuming top import for better practice.
      // But replace_file_content is chunk based.
      // I will add the cleanup logic here.
      // We need to import deleteCookie. I will add it to the top of the file in a separate call if needed,
      // or I can try to use document.cookie directly here if I don't want to touch imports yet,
      // but it's better to use the helper.
      // Wait, I can't add an import easily with a single chunk block if it's far away.
      // I'll use document.cookie directly for reliability in this specific error handler
      // to ensure it works without import errors or multi-step edits.
      // Actually, I can use the same logic as deleteCookie:
      document.cookie =
        "accessToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";

      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`,
      );
    }

    return response.json();
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
}
