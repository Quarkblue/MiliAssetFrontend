
const apiUrl = import.meta.env.VITE_API_URL || "https://military-asset-backend-cxyg.onrender.com/api";

export async function Fetch<T>(path: string, options: RequestInit = {}): Promise<T> {

    const token = sessionStorage.getItem("token");

    const res = await fetch(
        apiUrl + path,
        {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
            ...options,
        }
    )

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "An error occurred while fetching data.");
    }

    return res.json()
}

export async function Post<T>(path: string, body: any): Promise<T> {
    return Fetch<T>(path, {
        method: "POST",
        body: JSON.stringify(body),
    });
}