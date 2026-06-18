const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem("access_token");

  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${url}`, config);

  if (response.status === 401 && accessToken) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return response;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          isRefreshing = false;
          onRefreshed(data.access_token);
        } else {
          // Refresh failed
          isRefreshing = false;
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return response;
        }
      } catch {
        isRefreshing = false;
        return response;
      }
    }

    // Wait for the refresh to complete then retry the request
    const retryOrigReq = new Promise<Response>((resolve) => {
      subscribeTokenRefresh((newToken: string) => {
        // replace the expired token and retry
        const newHeaders = new Headers(options.headers || {});
        newHeaders.set("Authorization", `Bearer ${newToken}`);
        resolve(fetch(`${API_URL}${url}`, { ...options, headers: newHeaders }));
      });
    });
    return retryOrigReq;
  }

  return response;
}
