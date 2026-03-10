const router = require('express').Router();

const cmsController = require('../controllers/cms.controller');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissionMiddleware');

router.post(
  '/',
  authMiddleware,
  checkPermission('CMS', 'CMS_ADD'),
  cmsController.createCms
);

router.get(
  '/',
  authMiddleware,
  checkPermission('CMS', 'CMS_VIEW'),
  cmsController.listCms
);

router.get(
  '/:id',
  authMiddleware,
  checkPermission('CMS', 'CMS_VIEW'),
  cmsController.getCmsById
);

router.put(
  '/:id',
  authMiddleware,
  checkPermission('CMS', 'CMS_UPDATE'),
  cmsController.updateCms
);

router.delete(
  '/:id',
  authMiddleware,
  checkPermission('CMS', 'CMS_DELETE'),
  cmsController.deleteCms
);

module.exports = router;
