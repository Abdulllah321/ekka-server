export const verifyOtpTemplate = (otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 10px;
      background-color: #f9f9f9;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .otp {
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Vendor Verification</h2>
    </div>
    <p>Dear Vendor,</p>
    <p>Your OTP for verification is:</p>
    <p class="otp">${otp}</p>
    <p>This OTP will expire in 15 minutes. Please do not share it with anyone.</p>
    <div class="footer">
      <p>&copy; 2025 Vasturafit. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
