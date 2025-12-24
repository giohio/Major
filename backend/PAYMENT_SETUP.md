# Payment Gateway Setup Guide

## Tổng quan

Hệ thống hỗ trợ 3 cổng thanh toán:
- **VNPay**: Thanh toán thẻ ATM, thẻ quốc tế, QR Code
- **MoMo**: Thanh toán ví điện tử MoMo
- **ZaloPay**: Thanh toán ví điện tử ZaloPay

## 1. VNPay Configuration

### Đăng ký tài khoản Sandbox
1. Truy cập: https://sandbox.vnpayment.vn
2. Đăng ký tài khoản doanh nghiệp (test)
3. Sau khi đăng ký, bạn sẽ nhận được:
   - **Mã Website (TMN Code)**: Mã định danh website của bạn
   - **Secret Key (Hash Secret)**: Khóa bí mật để mã hóa giao dịch

### Cấu hình trong .env
```env
VNPAY_TMN_CODE=YOUR_TMN_CODE_HERE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET_HERE
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

### Test Cards (Sandbox)
- **Thẻ nội địa (ATM)**:
  - Số thẻ: `9704198526191432198`
  - Tên chủ thẻ: `NGUYEN VAN A`
  - Ngày phát hành: `07/15`
  - OTP: `123456`

- **Thẻ quốc tế (VISA)**:
  - Số thẻ: `4111111111111111`
  - CVV: `123`
  - Ngày hết hạn: `12/25`

### Production
- Đăng ký tài khoản thật tại: https://vnpay.vn
- Thay đổi `VNPAY_URL` thành: `https://payment.vnpay.vn/paymentv2/vpcpay.html`
- Cập nhật TMN Code và Hash Secret từ production

---

## 2. MoMo Configuration

### Đăng ký tài khoản Test
1. Truy cập: https://developers.momo.vn
2. Đăng ký tài khoản developer
3. Tạo ứng dụng mới để nhận credentials:
   - **Partner Code**: Mã đối tác
   - **Access Key**: Khóa truy cập API
   - **Secret Key**: Khóa bí mật

### Cấu hình trong .env
```env
MOMO_PARTNER_CODE=YOUR_PARTNER_CODE
MOMO_ACCESS_KEY=YOUR_ACCESS_KEY
MOMO_SECRET_KEY=YOUR_SECRET_KEY
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
```

### Test App (Sandbox)
1. Tải app MoMo (iOS/Android)
2. Đăng ký tài khoản test
3. Nạp tiền test từ Developer Console
4. Quét QR code để thanh toán

### Production
- Liên hệ MoMo Business để đăng ký merchant thật
- Thay đổi endpoint: `https://payment.momo.vn/v2/gateway/api/create`
- Cập nhật production credentials

---

## 3. ZaloPay Configuration

### Đăng ký tài khoản Sandbox
1. Truy cập: https://docs.zalopay.vn
2. Đăng ký tài khoản developer
3. Tạo ứng dụng để nhận:
   - **App ID**: Mã định danh ứng dụng
   - **Key 1**: Khóa mã hóa
   - **Key 2**: Khóa xác thực

### Cấu hình trong .env
```env
ZALOPAY_APP_ID=YOUR_APP_ID
ZALOPAY_KEY1=YOUR_KEY1
ZALOPAY_KEY2=YOUR_KEY2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
```

### Test App (Sandbox)
1. Tải app ZaloPay
2. Đăng ký tài khoản sandbox
3. Nhận tiền test từ Developer Portal
4. Sử dụng QR code hoặc deep link để test

### Production
- Đăng ký merchant ZaloPay chính thức
- Endpoint: `https://openapi.zalopay.vn/v2/create`
- Cập nhật production credentials

---

## 4. Backend Implementation

### Payment Service Location
```
backend/app/services/payment_service.py
```

### Supported Methods

#### VNPay
```python
PaymentService.generate_vnpay_payment_url(
    payment=payment,  # Payment object from DB
    return_url='http://localhost:5173/payment-result',
    vnp_url=os.environ['VNPAY_URL'],
    vnp_tmn_code=os.environ['VNPAY_TMN_CODE'],
    vnp_hash_secret=os.environ['VNPAY_HASH_SECRET']
)
```

#### MoMo
```python
PaymentService.generate_momo_qr_payment(
    payment=payment,
    return_url='http://localhost:5173/payment-result',
    notify_url='http://your-server.com/api/webhooks/momo'
)
```

#### ZaloPay
```python
PaymentService.generate_zalopay_payment(
    payment=payment,
    return_url='http://localhost:5173/payment-result',
    callback_url='http://your-server.com/api/webhooks/zalopay'
)
```

---

## 5. Webhook Setup

### VNPay Return URL
```python
@bp.route('/webhooks/vnpay', methods=['GET'])
def vnpay_callback():
    # Verify signature
    # Update payment status
    # Redirect user
```

### MoMo IPN
```python
@bp.route('/webhooks/momo', methods=['POST'])
def momo_ipn():
    # Verify signature
    # Update payment status
    # Return 204
```

### ZaloPay Callback
```python
@bp.route('/webhooks/zalopay', methods=['POST'])
def zalopay_callback():
    # Verify MAC
    # Update payment status
    # Return JSON response
```

---

## 6. Security Best Practices

### Environment Variables
- ✅ Never commit `.env` file to Git
- ✅ Use `.env.example` for template
- ✅ Rotate keys regularly in production
- ✅ Use different keys for dev/staging/production

### API Security
- ✅ Always verify signatures from payment gateways
- ✅ Use HTTPS in production
- ✅ Implement rate limiting on webhook endpoints
- ✅ Log all payment transactions

### Database
- ✅ Store payment_status in DB
- ✅ Never expose payment gateway credentials to frontend
- ✅ Use transaction_id from gateway as reference

---

## 7. Testing Payment Flow

### Local Testing Steps

1. **Start Backend**:
   ```bash
   cd backend
   python wsgi.py
   ```

2. **Create Appointment** (Frontend):
   - Login as patient
   - Select doctor
   - Choose appointment type
   - Click "Book Appointment"

3. **Select Payment Method**:
   - VNPay: Redirects to VNPay page
   - MoMo: Shows QR code
   - ZaloPay: Shows QR code

4. **Complete Payment**:
   - Use test cards/accounts
   - Follow gateway instructions
   - Return to app

5. **Verify Result**:
   - Check appointment status updated to "scheduled"
   - Payment status changed to "completed"
   - User receives confirmation

### Debug Mode

Enable detailed logging in payment_service.py:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Check logs:
- Payment URL generation
- Signature calculation
- Webhook callbacks
- Status updates

---

## 8. Common Issues & Solutions

### Issue: "VNPay not configured"
**Solution**: Check `.env` file has `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET` set

### Issue: Invalid signature
**Solution**: 
- Verify Hash Secret matches exactly
- Check URL encoding in query string
- Ensure parameter sorting is correct

### Issue: Webhook not receiving callbacks
**Solution**:
- Use ngrok for local testing: `ngrok http 5000`
- Update webhook URL in payment gateway dashboard
- Check firewall/security group settings

### Issue: Payment stuck in "pending"
**Solution**:
- Check if webhook URL is accessible
- Verify signature validation in webhook
- Check payment gateway dashboard for transaction status

---

## 9. Deployment Checklist

### Before Going Live

- [ ] Replace all sandbox credentials with production keys
- [ ] Update payment gateway URLs to production endpoints
- [ ] Set up proper webhook URLs (with HTTPS)
- [ ] Configure domain in payment gateway dashboard
- [ ] Test with small amount first
- [ ] Set up monitoring and alerting
- [ ] Prepare customer support process
- [ ] Document refund procedure

### Production .env
```env
# Production VNPay
VNPAY_TMN_CODE=PROD_TMN_CODE
VNPAY_HASH_SECRET=PROD_SECRET
VNPAY_URL=https://payment.vnpay.vn/paymentv2/vpcpay.html

# Production MoMo
MOMO_PARTNER_CODE=PROD_PARTNER
MOMO_ACCESS_KEY=PROD_ACCESS
MOMO_SECRET_KEY=PROD_SECRET
MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create

# Production ZaloPay
ZALOPAY_APP_ID=PROD_APP_ID
ZALOPAY_KEY1=PROD_KEY1
ZALOPAY_KEY2=PROD_KEY2
ZALOPAY_ENDPOINT=https://openapi.zalopay.vn/v2/create
```

---

## 10. Support Resources

- **VNPay**: 
  - Docs: https://sandbox.vnpayment.vn/apis/docs
  - Support: support@vnpay.vn

- **MoMo**: 
  - Docs: https://developers.momo.vn/v3
  - Support: business@momo.vn

- **ZaloPay**: 
  - Docs: https://docs.zalopay.vn
  - Support: support@zalopay.vn

---

## Quick Start (Development)

1. Copy payment section from `.env.example` to `.env`
2. Register for sandbox accounts (links above)
3. Get credentials and paste into `.env`
4. Restart backend server
5. Test booking appointment with each payment method
6. Verify payment status updates correctly

**Note**: For development, you can skip actual payment integration and test with free appointments (amount = 0) first.
