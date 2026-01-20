const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"

export class APIClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      console.log("[v0] API Request:", {
        method: options.method || "GET",
        url: `${API_BASE_URL}${endpoint}`,
        hasToken: !!this.token,
      })

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })

      console.log("[v0] API Response status:", response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = "API Error"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || "API Error"
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("[v0] Fetch error - Backend may not be running at:", API_BASE_URL)
        throw new Error(`No se puede conectar al servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`)
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
    return this.request(`/products?page=${page}&limit=${limit}&q=${q}`)
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`)
  }

  // Admin products endpoints
  async adminGetProducts(page = 1, limit = 50) {
    return this.request(`/admin/products?page=${page}&limit=${limit}`)
  }

  async adminCreateProduct(data: any) {
    return this.request("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async adminUpdateProduct(id: string, data: any) {
    return this.request(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async adminDeleteProduct(id: string) {
    return this.request(`/admin/products/${id}`, {
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
    return this.request(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
  }

  async adminGetOrders() {
    return this.request("/admin/orders")
  }

  async adminUpdateOrderStatus(orderId: string, status: string) {
    return this.request(`/admin/orders/${orderId}/status`, {
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
    return this.request(`/orders/${orderId}`)
  }
}

export const apiClient = new APIClient()
