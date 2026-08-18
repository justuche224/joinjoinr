import "server-only"
import crypto from "crypto"

export interface KorapayErrorResponse {
  status: boolean
  message: string
  data?: unknown
}

export class KorapayApiError extends Error {
  readonly httpStatus?: number
  readonly rawResponse?: unknown

  constructor(message: string, httpStatus?: number, rawResponse?: unknown) {
    super(message)
    this.name = "KorapayApiError"
    this.httpStatus = httpStatus
    this.rawResponse = rawResponse

    Object.setPrototypeOf(this, KorapayApiError.prototype)
  }
}

export interface KorapayCustomer {
  /** The email of the customer to be charged */
  email: string
  /** The name of the customer to be charged */
  name?: string
}

export interface KorapayCreatePaymentRequest {
  /** The amount to charge the customer, in the currency's major unit (e.g. naira, not kobo) */
  amount: number
  /** The currency in which the customer should be charged, e.g. NGN */
  currency: string
  /** Your transaction reference. Must be unique for every transaction */
  reference: string
  /** The URL to redirect your customer to when the transaction is complete */
  redirect_url?: string
  /** The webhook URL to be called when the transaction is complete */
  notification_url?: string
  /** Transaction description */
  narration?: string
  customer: KorapayCustomer
}

export interface KorapayCreatePaymentResponseData {
  reference: string
  checkout_url: string
}

export interface KorapayCreatePaymentResponse {
  status: boolean
  message: string
  data: KorapayCreatePaymentResponseData
}

export interface KorapayWebhookData {
  reference: string
  currency: string
  amount: number
  fee?: number
  status: "success" | "failed" | string
  payment_method?: string
  payment_reference?: string
}

export interface KorapayWebhookEvent {
  event: "charge.success" | "charge.failed" | string
  data: KorapayWebhookData
}

export interface KorapayConfig {
  secretKey?: string
}

const KORAPAY_INITIALIZE_URL =
  "https://api.korapay.com/merchant/api/v1/charges/initialize"

export class KorapayPaymentService {
  private secretKey: string

  constructor(config?: KorapayConfig) {
    this.secretKey = config?.secretKey ?? process.env.KORAPAY_SECRET_KEY ?? ""
  }

  /**
   * Initializes a Checkout Redirect payment session with Korapay
   * @throws {KorapayApiError} If the request fails or Korapay returns a non-success status
   */
  async createPayment(
    payload: KorapayCreatePaymentRequest
  ): Promise<KorapayCreatePaymentResponse> {
    if (!this.secretKey) {
      throw new KorapayApiError(
        "Korapay secret key is not configured. Set KORAPAY_SECRET_KEY in your environment."
      )
    }

    const response = await fetch(KORAPAY_INITIALIZE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.secretKey}`,
      },
      body: JSON.stringify(payload),
    })

    let rawText = ""
    try {
      rawText = await response.text()
      const json = JSON.parse(rawText)

      if (!response.ok || !json.status) {
        throw new KorapayApiError(
          json.message ?? `HTTP ${response.status} ${response.statusText}`,
          response.status,
          json
        )
      }

      return json as KorapayCreatePaymentResponse
    } catch (error) {
      if (error instanceof KorapayApiError) {
        throw error
      }
      throw new KorapayApiError(
        `Failed to parse Korapay response (${response.status}): ${rawText || (error as Error).message}`,
        response.status
      )
    }
  }

  /**
   * Verifies the HMAC-SHA256 signature from a Korapay webhook callback.
   * Korapay signs only the `data` object of the payload, sent via the
   * `x-korapay-signature` header (unlike OPay's sha512-over-full-payload scheme).
   */
  verifyWebhookSignature(
    data: KorapayWebhookData | string,
    signature: string
  ): boolean {
    if (!this.secretKey) {
      console.warn(
        "KORAPAY_SECRET_KEY is not configured. Webhook signature check will be skipped."
      )
      return true
    }

    const dataString = typeof data === "string" ? data : JSON.stringify(data)

    try {
      const hash = crypto
        .createHmac("sha256", this.secretKey)
        .update(dataString)
        .digest("hex")

      return (
        signature.length === hash.length &&
        crypto.timingSafeEqual(
          Buffer.from(signature.toLowerCase()),
          Buffer.from(hash.toLowerCase())
        )
      )
    } catch {
      return false
    }
  }
}

export const korapayPaymentService = new KorapayPaymentService()
