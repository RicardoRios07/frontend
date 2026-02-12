// api-client.ts
const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "")
const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
)

type ApiErrorPayload = {
  message?: string
  error?: string
  errors?: unknown
}

export class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  getFileUrl(path: string) {
    if (!path) return ""
    if (path.startsWith("http")) return path

    // Remove /api from base URL if present to get root
    const baseUrl = API_BASE_URL.replace(/\/api$/, "")
    const cleanPath = path.startsWith("/") ? path : `/${path}`

    return `${baseUrl}${cleanPath}`
  }

  private buildHeaders(options: RequestInit): HeadersInit {
    const headers: HeadersInit = {
      ...options.headers,
    }

    // Only set JSON content-type when body is JSON (and not FormData)
    const hasBody = options.body !== undefined && options.body !== null
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData

    if (hasBody && !isFormData) {
      // Respect an existing Content-Type if caller set it
      const existing =
        (headers as Record<string, string>)["Content-Type"] ||
        (headers as Record<string, string>)["content-type"]

      if (!existing) {
        ; (headers as Record<string, string>)["Content-Type"] = "application/json"
      }
    }

    if (this.token) {
      ; (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`
    }

    return headers
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      return (await response.json()) as T
    }

    // Some endpoints may return empty body (204) or text
    if (response.status === 204) return undefined as T
    const text = await response.text()
    return text as unknown as T
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    const headers = this.buildHeaders(options)

    try {
      console.log("[v0] API Request:", {
        method: options.method || "GET",
        url,
        hasToken: !!this.token,
      })

      const response = await fetch(url, { ...options, headers })

      console.log("[v0] API Response status:", response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
          const data = (await this.parseResponse<ApiErrorPayload>(response)) ?? {}
          errorMessage = data.message || data.error || errorMessage
        } catch {
          // keep fallback message
        }

        throw new Error(errorMessage)
      }

      return await this.parseResponse<T>(response)
    } catch (error) {
      // Network / CORS / DNS / refused connection errors often come as TypeError in fetch
      if (error instanceof TypeError) {
        console.error("[v0] Fetch error - Backend may not be running at:", API_BASE_URL)
        throw new Error(
          `No se puede conectar al servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`
        )
      }
      console.error("[v0] API Error:", error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
  }

  // Products endpoints
  async getProducts(page = 1, limit = 20, q = "") {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(q ? { q } : {}),
    }).toString()

    return this.request(`/products?${qs}`)
  }

  async getProduct(id: string) {
    return this.request(`/products/${encodeURIComponent(id)}`)
  }

  // Admin products endpoints
  async adminGetProducts(page = 1, limit = 50) {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    }).toString()

    return this.request(`/admin/products?${qs}`)
  }

  async adminCreateProduct(data: any) {
    return this.request("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async adminUpdateProduct(id: string, data: any) {
    return this.request(`/admin/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async adminDeleteProduct(id: string) {
    return this.request(`/admin/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  }

  async adminGetDashboard() {
    return this.request("/admin/dashboard")
  }

  async adminGetUsers() {
    return this.request("/admin/users")
  }

  async adminUpdateUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${encodeURIComponent(userId)}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
  }

  async adminGetOrders() {
    return this.request("/admin/orders")
  }

  async adminUpdateOrderStatus(orderId: string, status: string) {
    return this.request(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  // Payment endpoints (Payphone)
  async getPaymentConfig(products: any[], email: string, phoneNumber: string, documentId: string) {
    return this.request("/payment/payphone/config", {
      method: "POST",
      body: JSON.stringify({ products, email, phoneNumber, documentId }),
    })
  }

  async confirmPayment(id: number, clientTransactionId: string) {
    return this.request("/payment/payphone/confirm", {
      method: "POST",
      body: JSON.stringify({ id, clientTransactionId }),
    })
  }

  // Orders endpoints
  async getMyOrders() {
    return this.request("/orders")
  }

  async getOrder(orderId: string) {
    return this.request(`/orders/${encodeURIComponent(orderId)}`)
  }

  async downloadInvoice(orderId: string) {
    const url = `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/download`

    const headers: HeadersInit = {}
    if (this.token) {
      ; (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`Error al descargar el archivo (HTTP ${response.status})`)
    }

    const contentDisposition = response.headers.get("Content-Disposition")
    let filename = "factura.pdf"

    if (contentDisposition) {
      // supports filename* (RFC 5987) and filename
      const fnStar = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
      const fn = contentDisposition.match(/filename\s*=\s*"?([^"]+)"?/i)
      if (fnStar?.[1]) filename = decodeURIComponent(fnStar[1])
      else if (fn?.[1]) filename = fn[1]
    }

    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(objectUrl)
  }
}

export const apiClient = new ApiClient()
