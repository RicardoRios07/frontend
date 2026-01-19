/**
 * Tipos TypeScript para la integración de Payphone
 * Basado en la documentación oficial de Payphone Cajita de Pagos
 */

/**
 * Configuración para inicializar la Cajita de Pagos de Payphone
 */
export interface PayphonePaymentConfig {
  /** Token de autenticación de Payphone Developer */
  token: string

  /** ID único de transacción del comercio (máx. 50 caracteres) */
  clientTransactionId: string

  /** Monto total en centavos (suma de todos los componentes) */
  amount: number

  /** Monto sin impuesto en centavos */
  amountWithoutTax?: number

  /** Monto con impuesto (sin el tax) en centavos */
  amountWithTax?: number

  /** Impuesto en centavos */
  tax?: number

  /** Monto del servicio en centavos */
  service?: number

  /** Propina en centavos */
  tip?: number

  /** Código de moneda ISO 4217 (ej: USD) */
  currency: string

  /** ID de la sucursal de Payphone */
  storeId: string

  /** Referencia del pago (máx. 100 caracteres) */
  reference: string

  /** Email del cliente */
  email?: string

  /** Teléfono del cliente (formato: +593999999999) */
  phoneNumber?: string

  /** Número de identificación del cliente */
  documentId?: string

  /** Tipo de identificación: 1=Cédula, 2=RUC, 3=Pasaporte */
  identificationType?: 1 | 2 | 3

  /** Idioma del formulario: 'en' o 'es' */
  lang?: "en" | "es"

  /** Método de pago por defecto: 'card' o 'payphone' */
  defaultMethod?: "card" | "payphone"

  /** Zona horaria (ej: -5) */
  timeZone?: number

  /** Latitud en formato decimal */
  lat?: string

  /** Longitud en formato decimal */
  lng?: string

  /** Parámetro opcional adicional */
  optionalParameter?: string
}

/**
 * Respuesta de confirmación de transacción de Payphone
 */
export interface PayphoneTransactionConfirmation {
  /** Email del cliente */
  email: string

  /** Tipo de tarjeta: Credit o Debit */
  cardType: "Credit" | "Debit"

  /** Primeros 6 dígitos de la tarjeta (BIN) */
  bin: string

  /** Últimos dígitos de la tarjeta */
  lastDigits: string

  /** Código de diferido */
  deferredCode: string

  /** Indica si se usó diferido */
  deferred: boolean

  /** Código de marca de tarjeta */
  cardBrandCode: string

  /** Marca de la tarjeta y banco emisor */
  cardBrand: string

  /** Monto total pagado en centavos */
  amount: number

  /** ID de transacción del cliente */
  clientTransactionId: string

  /** Teléfono del cliente */
  phoneNumber: string

  /** Código de estado: 2=Cancelado, 3=Aprobada */
  statusCode: 2 | 3

  /** Estado de la transacción */
  transactionStatus: "Approved" | "Canceled"

  /** Código de autorización bancario */
  authorizationCode: string

  /** Mensaje de error (si aplica) */
  message: string | null

  /** Código de mensaje */
  messageCode: number

  /** ID de transacción de Payphone */
  transactionId: number

  /** Número de documento del cliente */
  document: string

  /** Moneda utilizada */
  currency: string

  /** Parámetro opcional */
  optionalParameter3: string

  /** Nombre del titular de la tarjeta */
  optionalParameter4: string

  /** Nombre de la tienda */
  storeName: string

  /** Fecha de la transacción en formato ISO 8601 */
  date: string

  /** Código de país ISO 3166-1 */
  regionIso: string

  /** Tipo de transacción */
  transactionType: string

  /** Referencia del pago */
  reference: string
}

/**
 * Parámetros que Payphone envía en la URL de respuesta
 */
export interface PayphoneResponseParams {
  /** ID de la transacción de Payphone */
  id: string

  /** ID de transacción del cliente */
  clientTransactionId: string
}

/**
 * Respuesta de error de la API de Payphone
 */
export interface PayphoneErrorResponse {
  /** Mensaje de error */
  message: string

  /** Código de error */
  errorCode: number
}

/**
 * Clase de la Cajita de Pagos (definida en el SDK de Payphone)
 */
export interface PPaymentButtonBox {
  new (config: PayphonePaymentConfig): PPaymentButtonBox
  
  /** Renderiza el botón de pago en el contenedor especificado */
  render(containerId: string): void
}

/**
 * Extensión de Window para incluir PPaymentButtonBox
 */
declare global {
  interface Window {
    PPaymentButtonBox: {
      new (config: PayphonePaymentConfig): PPaymentButtonBox
    }
  }
}

/**
 * Producto para enviar al backend
 */
export interface ProductForPayment {
  productId: string
  quantity: number
}

/**
 * Respuesta del backend al solicitar configuración de pago
 */
export interface PaymentConfigResponse {
  success: boolean
  orderId: string
  paymentConfig: PayphonePaymentConfig
  responseUrl: string
}

/**
 * Respuesta del backend al confirmar pago
 */
export interface PaymentConfirmationResponse {
  success: boolean
  message: string
  order?: {
    _id: string
    amount: number
    paymentStatus: "PENDING" | "PAID" | "FAILED"
    products: Array<{
      title: string
      price: number
      quantity: number
    }>
  }
  transaction?: PayphoneTransactionConfirmation
}
