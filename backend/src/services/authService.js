const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class AuthService {
  async registerUser(userData) {
    const { name, username, email, password } = userData;

    // Check if user exists (email or username)
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      if (userExists.email === email.toLowerCase()) {
        throw new ApiError(400, 'Email already registered');
      }
      throw new ApiError(400, 'Username already taken');
    }

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password,
    });

    if (user) {
      return {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: user.getSignedJwtToken(),
      };
    } else {
      throw new ApiError(400, 'Invalid user data');
    }
  }

  async loginUser(username, password) {
    // Check for user by username
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(401, 'Your account has been blocked. Please contact admin.');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    return {
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: user.getSignedJwtToken(),
    };
  }

  async getUserProfile(userId) {
     const user = await User.findById(userId);
     if (!user) {
         throw new ApiError(404, 'User not found');
     }
     return user;
  }

  async updateUserDetails(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    return user;
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return user;
  }

  async forgotPassword(email, protocol, host) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, 'There is no user with that email');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url - point to frontend React app
    const frontendUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please go to the following link to reset your password: \n\n ${resetUrl}`;

    const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 40px 20px;
          text-align: center;
          color: #ffffff;
        }
        .content {
          padding: 40px 30px;
          color: #334155;
          line-height: 1.6;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20px;
          text-align: center;
        }
        .button-wrapper {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff !important;
          padding: 14px 32px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
          background-color: #f8fafc;
        }
        .security-note {
          font-size: 13px;
          color: #64748b;
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 style="margin:0; font-size: 28px; letter-spacing: -0.5px;">BlueCrown Elite</h1>
          <p style="margin:10px 0 0 0; opacity: 0.8; font-weight: 400;">Premier Wealth Portal</p>
        </div>
        <div class="content">
          <h2 class="title">Secure Password Reset</h2>
          <p>Hello,</p>
          <p>We received a request to reset the password for your **BlueCrown Elite** account. To ensure the security of your premier access, please click the button below to set a new security password.</p>
          
          <div class="button-wrapper">
            <a href="${resetUrl}" class="button">Reset Security Password</a>
          </div>
          
          <p>This secure reset link will expire in <strong>10 minutes</strong>. If you did not request this change, you can safely ignore this email.</p>
          
          <div class="security-note">
            For security reasons, do not share this link with anyone. Our support team will never ask you for your security password.
          </div>
        </div>
        <div class="footer">
          &copy; 2026 BlueCrown Capital. All rights reserved.<br>
          BlueCrown Global HQ • Premier Support
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      const sendEmail = require('../utils/sendEmail');
      
      // Check if SMTP settings are likely missing
      if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.mailtrap.io') {
          console.log('--- FORGOT PASSWORD RESET URL ---');
          console.log(resetUrl);
          console.log('----------------------------------');
          // If we are in dev and don't want to fail if email fails
          if (process.env.NODE_ENV === 'development') {
              return { message: 'Reset link generated in console', resetUrl };
          }
      }

      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
        html: htmlMessage,
      });

      return { message: 'Email sent' };
    } catch (err) {
      console.error('Email could not be sent', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      throw new ApiError(500, 'Email could not be sent');
    }
  }

  async resetPassword(resetToken, password) {
    const crypto = require('crypto');
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired token');
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return {
        _id: user.id,
        name: user.name,
        email: user.email,
        token: user.getSignedJwtToken(),
    };
  }
}

module.exports = new AuthService();
