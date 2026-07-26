// MoMo Sandbox Config
export const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
  accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF18",
  secretKey: process.env.MOMO_SECRET_KEY || "K951B6FA29230FB27D52862F20521F4C",
  endpoint:
    process.env.MOMO_ENDPOINT ||
    "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl:
    process.env.MOMO_REDIRECT_URL || "http://localhost:5173/payment-result?gateway=momo",
  ipnUrl:
    process.env.MOMO_IPN_URL || "http://localhost:5000/api/bookings/momo_ipn",
  requestType: process.env.MOMO_REQUEST_TYPE || "captureWallet",
  sandboxMode:
    String(process.env.MOMO_SANDBOX_MODE ?? "true").toLowerCase() === "true",
};
