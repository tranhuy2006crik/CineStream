// VNPay Config for Sandbox Environment
export const vnpayConfig = {
  vnp_TmnCode: "JXO7Y4U5", // Thay bằng Mã website của bạn (Sandbox)
  vnp_HashSecret: "BVQMAGYIQLAZMUOAEMFLJNFYISZDTXET", // Thay bằng Chuỗi bí mật
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: "http://localhost:5173/payment-result?gateway=vnpay", // Frontend URL to handle return
};
