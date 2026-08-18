import "server-only"
import crypto from "crypto"

export const OPayErrorCodes = {
  /** Request processed successfully */
  SUCCESS: "00000",
  /** Authentication failed (check Public Key / Merchant ID) */
  AUTHENTICATION_FAILED: "02000",
  /** Request parameters are not valid */
  REQUEST_PARAMS_NOT_VALID: "02001",
  /** Merchant is not configured with this function */
  MERCHANT_NOT_CONFIGURED: "02002",
  /** Payment method is not supported */
  PAY_METHOD_NOT_SUPPORTED: "02003",
  /** Payment reference (merchant order number) already exists */
  PAYMENT_REFERENCE_ALREADY_EXISTS: "02004",
  /** Merchant is not available */
  MERCHANT_NOT_AVAILABLE: "02007",
  /** Service not available, please try again */
  SERVICE_NOT_AVAILABLE: "50003",
} as const

export type OPayErrorCode =
  | (typeof OPayErrorCodes)[keyof typeof OPayErrorCodes]
  | (string & {})

export interface OPayErrorResponse {
  code: string
  message: string
  data?: unknown
}

export class OPayApiError extends Error {
  readonly code: string
  readonly httpStatus?: number
  readonly rawResponse?: unknown

  constructor(
    code: string,
    message: string,
    httpStatus?: number,
    rawResponse?: unknown
  ) {
    super(message || `OPay API error code: ${code}`)
    this.name = "OPayApiError"
    this.code = code
    this.httpStatus = httpStatus
    this.rawResponse = rawResponse

    Object.setPrototypeOf(this, OPayApiError.prototype)
  }

  get isAuthFailed(): boolean {
    return this.code === OPayErrorCodes.AUTHENTICATION_FAILED
  }

  get isInvalidParams(): boolean {
    return this.code === OPayErrorCodes.REQUEST_PARAMS_NOT_VALID
  }

  get isDuplicateReference(): boolean {
    return this.code === OPayErrorCodes.PAYMENT_REFERENCE_ALREADY_EXISTS
  }

  get isPayMethodNotSupported(): boolean {
    return this.code === OPayErrorCodes.PAY_METHOD_NOT_SUPPORTED
  }

  get isServiceUnavailable(): boolean {
    return this.code === OPayErrorCodes.SERVICE_NOT_AVAILABLE
  }

  get isMerchantUnavailable(): boolean {
    return (
      this.code === OPayErrorCodes.MERCHANT_NOT_AVAILABLE ||
      this.code === OPayErrorCodes.MERCHANT_NOT_CONFIGURED
    )
  }
}

export type OPayCustomerVisitSource = "IOS" | "ANDROID" | "BROWSER"

export type OPayPaymentStatus =
  | "INITIAL"
  | "PENDING"
  | "SUCCESS"
  | "FAIL"
  | "CLOSE"

export interface OPayAmount {
  /** Amount in cent/kobo unit (e.g., 400 for 400 kobo / 4 NGN) */
  total: number
  /** Currency type, e.g. "NGN" */
  currency: string
}

export interface OPayUserInfo {
  /** The customer user ID */
  userId?: string
  /** The customer user name */
  userName?: string
  /** The customer mobile phone number, e.g. "+23488889999" */
  userMobile?: string
  /** The customer email address */
  userEmail?: string
}

export interface OPayProduct {
  /** Product name */
  name: string
  /** Product description */
  description: string
  /** Product reference (PNR) */
  reference?: string
}

export interface OPayCreatePaymentRequest {
  /** Unique merchant payment order number */
  reference: string
  /** Country code, e.g. "NG" */
  country: string
  /** Order amount information */
  amount: OPayAmount
  /** The URL to which OPay cashier should return your client after checkout */
  returnUrl: string
  /** Webhook callback notification URL sent by OPay upon payment event */
  callbackUrl?: string
  /** The URL to which OPay cashier should return your client if payment is canceled */
  cancelUrl?: string
  /** Sub-merchant name displayed on the cashier page */
  displayName?: string
  /** IP address of the client/user */
  userClientIP?: string
  /** POS serial number */
  sn?: string
  /** Payment expiration time in minutes (default: 30) */
  expireAt?: number
  /** Preferred payment method (e.g., "BankCard", "BankTransfer", "OpayWallet") */
  payMethod?: string
  /** Customer user information */
  userInfo?: OPayUserInfo
  /** Product details */
  product: OPayProduct
  /** Whether this order needs to evoke the OPay app for payment */
  evokeOpay?: boolean
  /** Access source: "IOS", "ANDROID", or "BROWSER" */
  customerVisitSource?: OPayCustomerVisitSource
}

export interface OPayCreatePaymentResponseData {
  /** Unique merchant payment order number */
  reference: string
  /** Unique OPay payment order number */
  orderNo: string
  /** OPay Cashier URI generated for the client redirect checkout */
  cashierUrl: string
  /** Status of the transaction */
  status: OPayPaymentStatus
  /** Payment amount details */
  amount: OPayAmount
  /** VAT amount details */
  vat?: OPayAmount
}

export interface OPayCreatePaymentResponse {
  /** Response status code (e.g., "00000" for success) */
  code: string
  /** Response message (e.g., "SUCCESSFUL") */
  message: string
  /** Response payload data */
  data: OPayCreatePaymentResponseData
}

export interface OPayWebhookPayload {
  amount: string
  channel?: string
  country: string
  currency: string
  displayedFailure?: string
  fee?: string
  feeCurrency?: string
  instrumentType?: string
  reference: string
  refunded: boolean | string
  status: "SUCCESS" | "FAIL" | "PENDING" | "CLOSE" | string
  timestamp: string
  token?: string
  transactionId: string
  updated_at?: string
}

export interface OPayWebhookEvent {
  payload: OPayWebhookPayload
  sha512: string
  type: string
}

export interface OPayConfig {
  merchantId?: string
  publicKey?: string
  secretKey?: string
  cashierUrl?: string
}

export class OPayPaymentService {
  private merchantId: string
  private publicKey: string
  private secretKey: string
  private cashierUrl: string

  constructor(config?: OPayConfig) {
    this.merchantId = config?.merchantId ?? process.env.OPAY_MERCHANT_ID ?? ""
    this.publicKey = config?.publicKey ?? process.env.OPAY_PUBLIC_KEY ?? ""
    this.secretKey =
      config?.secretKey ??
      process.env.OPAY_SECRET_KEY ??
      process.env.OPAY_PRIVATE_KEY ??
      ""
    this.cashierUrl =
      config?.cashierUrl ??
      (process.env.NODE_ENV === "production"
        ? process.env.LIVE_CASHIER_URL
        : process.env.STAGING_CASHIER_URL) ??
      ""
  }

  /**
   * Initializes a payment session on OPay Cashier
   * @param payload Payment request payload
   * @throws {OPayApiError} If the request fails, parameters are invalid, or OPay returns an error code
   * @returns OPay Cashier response containing cashierUrl and order details
   */
  async createPayment(
    payload: OPayCreatePaymentRequest
  ): Promise<OPayCreatePaymentResponse> {
    if (!this.cashierUrl) {
      throw new OPayApiError(
        "CONFIG_ERROR",
        "OPay Cashier URL is not configured. Set LIVE_CASHIER_URL or STAGING_CASHIER_URL in your environment."
      )
    }

    const response = await fetch(this.cashierUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.publicKey}`,
        MerchantId: this.merchantId,
      },
      body: JSON.stringify(payload),
    })

    let rawText = ""
    try {
      rawText = await response.text()
      const json = JSON.parse(rawText)

      if (!response.ok || json.code !== OPayErrorCodes.SUCCESS) {
        throw new OPayApiError(
          json.code ?? response.status.toString(),
          json.message ?? `HTTP ${response.status} ${response.statusText}`,
          response.status,
          json
        )
      }

      return json as OPayCreatePaymentResponse
    } catch (error) {
      if (error instanceof OPayApiError) {
        throw error
      }
      throw new OPayApiError(
        response.status.toString(),
        `Failed to parse OPay response (${response.status}): ${rawText || (error as Error).message}`,
        response.status
      )
    }
  }

  /**
   * Verifies the HMAC signature from an OPay webhook callback
   */
  verifyWebhookSignature(
    payload: OPayWebhookPayload | string,
    signature: string
  ): boolean {
    if (!this.secretKey) {
      console.warn(
        "OPAY_SECRET_KEY is not configured. Webhook signature check will be skipped."
      )
      return true
    }

    const payloadString =
      typeof payload === "string" ? payload : JSON.stringify(payload)

    // Check sha512
    try {
      const hmac512 = crypto
        .createHmac("sha512", this.secretKey)
        .update(payloadString)
        .digest("hex")

      if (
        signature.length === hmac512.length &&
        crypto.timingSafeEqual(
          Buffer.from(signature.toLowerCase()),
          Buffer.from(hmac512.toLowerCase())
        )
      ) {
        return true
      }
    } catch {}

    // Check sha3-512
    try {
      const hmacSha3 = crypto
        .createHmac("sha3-512", this.secretKey)
        .update(payloadString)
        .digest("hex")

      if (
        signature.length === hmacSha3.length &&
        crypto.timingSafeEqual(
          Buffer.from(signature.toLowerCase()),
          Buffer.from(hmacSha3.toLowerCase())
        )
      ) {
        return true
      }
    } catch {}

    return false
  }
}

export const paymentService = new OPayPaymentService()