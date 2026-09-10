const User = require('../../models/User');
const aadhaarService = require('../../services/aadhaar.service');

const sendAadhaarOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (Number(user.aadhaar_verified) === 1) {
      return res.json({
        message: 'Already verified',
        data: { verified: true, maskedAadhaar: user.aadhaar_masked },
      });
    }

    const result = await aadhaarService.sendOtp({
      userId: user.id,
      role: user.role,
      aadhaarNumber: req.body.aadhaarNumber || req.body.aadhaar,
    });

    res.json({
      message: aadhaarService.isMock()
        ? 'OTP generated (mock mode — use Dev OTP until a real KYC provider is connected)'
        : 'OTP sent to Aadhaar-linked mobile',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const verifyAadhaarOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const result = await aadhaarService.verifyOtp({
      userId: user.id,
      role: user.role,
      verificationId: Number(req.body.verificationId),
      code: req.body.code || req.body.otp,
    });

    const updated = await User.findById(user.id);
    res.json({
      message: 'Aadhaar verified successfully',
      data: result,
      user: updated,
    });
  } catch (err) {
    next(err);
  }
};

const getAadhaarStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const required = aadhaarService.KYC_ROLES.has(user.role);
    res.json({
      data: {
        required,
        verified: Number(user.aadhaar_verified) === 1,
        maskedAadhaar: user.aadhaar_masked || null,
        verifiedAt: user.aadhaar_verified_at || null,
        providerMode: aadhaarService.isMock() ? 'mock' : 'live',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendAadhaarOtp,
  verifyAadhaarOtp,
  getAadhaarStatus,
};
