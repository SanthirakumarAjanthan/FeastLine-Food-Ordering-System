const crypto = require('crypto');

/**
 * Generates the MD5 hash PayHere requires when initiating a checkout.
 * Formula (per PayHere docs):
 * strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))
 */
function generateCheckoutHash({ merchantId, orderId, amount, currency, merchantSecret }) {
  const formattedAmount = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });

  const secretHash = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const rawString = `${merchantId}${orderId}${formattedAmount}${currency}${secretHash}`;

  return crypto.createHash('md5').update(rawString).digest('hex').toUpperCase();
}

/**
 * Verifies the signature PayHere sends to the server-to-server notify_url (IPN).
 * Formula:
 * strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
 */
function verifyNotifySignature({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  merchantSecret,
  md5sig,
}) {
  const secretHash = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const rawString = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`;

  const localSig = crypto.createHash('md5').update(rawString).digest('hex').toUpperCase();

  return localSig === md5sig;
}

module.exports = { generateCheckoutHash, verifyNotifySignature };
