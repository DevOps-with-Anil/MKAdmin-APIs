exports.getMyProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || null,
        photo: user.photo || null,

        role: user.role
          ? {
              id: user.role._id,
              name: user.role.name,
              permissions: user.role.permissions
            }
          : null,

        allowedCountries: user.allowedCountries || [],
        status: user.isActive,

        lastLoginAt: user.lastLoginAt,

        tracking: {
          lastIp: user.lastIp || null,
          lastBrowser: user.lastBrowser || null,
          lastDevice: user.lastDevice || null,
          lastOs: user.lastOs || null
        },

        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
