const router = require('express').Router();
const UserController = require('../../controllers/auth/auth.controller');
const authMiddleware = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/permissionMiddleware');
const { loginLimiter, userLimiter } = require('../../config/rateLimit');
const upload = require("../../config/upload");


/**
 * 🔐 Login route with dynamic rate limiter
 */
router.post('/root', loginLimiter(), UserController.rootlogin);

router.get('/root/me', authMiddleware, userLimiter(), UserController.getMyProfile);
    
//**Change My Own Password
router.post('/root/changepassword',authMiddleware, userLimiter(), UserController.changeMyPassword);

// Update Profile
// router.put("/root/updateprofile", authMiddleware, userLimiter(), UserController.updateMyProfile);

router.put("/root/updateprofile", authMiddleware, userLimiter(), upload.single("photo"), UserController.updateMyProfile);



/**
 * 🔐 Login route with dynamic rate limiter
 */
router.post('/admin', loginLimiter(), UserController.adminlogin);

router.get('/admin/me', authMiddleware, userLimiter(), UserController.getMyProfileAdmin);

// //**Change My Own Password
router.post('/admin/changepassword',authMiddleware, userLimiter(), UserController.changeMyPasswordAdmin);

// // Update Profile
router.put("/admin/updateprofile", authMiddleware, userLimiter(), UserController.updateMyProfileAdmin);



// /**
//  * 🔐 Login route with dynamic rate limiter
//  */
// router.post('/customer', loginLimiter(), userController.rootlogin);

// router.get('/customer/me', authMiddleware, userLimiter(), userController.getMyProfile);

// //**Change My Own Password
// router.post('/customer/changepassword',authMiddleware, userLimiter(), userController.changeMyPassword);

// // Update Profile
// router.put("/customer/updateprofile", authMiddleware, userLimiter(), userController.updateMyProfile);

module.exports = router;
