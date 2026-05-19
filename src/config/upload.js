
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const AWS = require("aws-sdk");
// const multerS3 = require("multer-s3");

// /* =========================================
//    ENV CONFIG
// ========================================= */
// const STORAGE_TYPE = process.env.STORAGE_TYPE || "local";
// const MAX_UPLOAD_SIZE =
//   (parseInt(process.env.MAX_UPLOAD_SIZE || "10") * 1024 * 1024);

// const ALLOWED_FILE_TYPES =
//   (process.env.ALLOWED_FILE_TYPES || "jpeg|jpg|png|webp|pdf|doc|docx")
//     .split("|")   // ✅ FIX HERE
//     .map((t) => t.trim().toLowerCase());

// const ALLOWED_IMAGE_TYPES =
//   (process.env.ALLOWED_IMAGE_TYPES || "jpeg|jpg|png|webp")
//     .split("|")   // ✅ FIX HERE
//     .map((t) => t.trim().toLowerCase());

// const extAllowed = "";
// /* =========================================
//    SHARED FILE RULES
// ========================================= */
// const getUploadPath = (file) => {
//   let uploadPath = "uploads/shared/misc";

//   if (file.fieldname === "photo") {
//     uploadPath = "uploads/rootUsers/profilePics";
//     extAllowed = ALLOWED_FILE_TYPES.includes(ext);

//   }

//   if (file.fieldname === "KYBDocs") {
//     uploadPath = "uploads/tenant/KYB-Docs";
//     extAllowed = ALLOWED_IMAGE_TYPES.includes(ext);

//   }

//   if (file.fieldname === "tenantLogo") {
//     uploadPath = "uploads/tenant/logos";
//     extAllowed = ALLOWED_IMAGE_TYPES.includes(ext);

//   }

//   return uploadPath;
// };

// /* =========================================
//    FILE FILTER (dynamic)
// ========================================= */
// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname)
//     .replace(".", "")
//     .toLowerCase();

//   const mimeAllowed =
//     file.mimetype?.startsWith("image/");


//   if (extAllowed && mimeAllowed) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type"), false);
//   }
// };

// /* =========================================
//    LOCAL STORAGE
// ========================================= */
// const ensureDir = (dir) => {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// };

// const localStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = getUploadPath(file);
//     ensureDir(dir);
//     cb(null, dir);
//   },

//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, `${name}${ext}`);
//   },
// });

// /* =========================================
//    S3 STORAGE (ready switch)
// ========================================= */
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_SECRET_KEY,
//   region: process.env.AWS_REGION,
// });

// const s3Storage = multerS3({
//   s3,
//   bucket: process.env.AWS_BUCKET_NAME,
//   acl: "public-read",

//   key: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = Date.now() + "-" + Math.round(Math.random() * 1e9);

//     const folder = getUploadPath(file);

//     cb(null, `${folder}/${name}${ext}`);
//   },
// });

// /* =========================================
//    STORAGE SWITCHER
// ========================================= */
// const getStorage = () => {
//   switch (STORAGE_TYPE) {
//     case "s3":
//       return s3Storage;

//     case "gcp":
//       throw new Error("GCP storage not implemented yet");

//     case "local":
//     default:
//       return localStorage;
//   }
// };

// /* =========================================
//    FINAL MULTER EXPORT
// ========================================= */
// module.exports = multer({
//   storage: getStorage(),
//   limits: { fileSize: MAX_UPLOAD_SIZE },
//   fileFilter,
// });



const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

/* =========================================
   ENV CONFIG
========================================= */

const STORAGE_TYPE = process.env.STORAGE_TYPE || "local";

const MAX_UPLOAD_SIZE =
  parseInt(process.env.MAX_UPLOAD_SIZE || "10") * 1024 * 1024;

const ALLOWED_FILE_TYPES = (
  process.env.ALLOWED_FILE_TYPES ||
  "jpeg|jpg|png|webp|pdf|doc|docx"
)
  .split("|")
  .map((t) => t.trim().toLowerCase());

const ALLOWED_IMAGE_TYPES = (
  process.env.ALLOWED_IMAGE_TYPES ||
  "jpeg|jpg|png|webp"
)
  .split("|")
  .map((t) => t.trim().toLowerCase());

/* =========================================
   HELPERS
========================================= */

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getFileExtension = (file) => {
  return path.extname(file.originalname)
    .replace(".", "")
    .toLowerCase();
};

/* =========================================
   UPLOAD PATH + TYPE RULES
========================================= */

const getUploadConfig = (file) => {
  let uploadPath = "uploads/shared/misc";
  let allowedExtensions = ALLOWED_FILE_TYPES;

  switch (file.fieldname) {
    case "photo":
      uploadPath = "uploads/rootUsers/profilePics";
      allowedExtensions = ALLOWED_IMAGE_TYPES;
      break;

    case "KYBDocs":
      uploadPath = "uploads/tenant/KYB-Docs";
      allowedExtensions = ALLOWED_FILE_TYPES;
      break;

    case "tenantLogo":
      uploadPath = "uploads/tenant/logos";
      allowedExtensions = ALLOWED_IMAGE_TYPES;
      break;

    default:
      uploadPath = "uploads/shared/misc";
      allowedExtensions = ALLOWED_FILE_TYPES;
      break;
  }

  return {
    uploadPath,
    allowedExtensions,
  };
};

/* =========================================
   FILE FILTER
========================================= */

const fileFilter = (req, file, cb) => {
  try {
    const ext = getFileExtension(file);

    const { allowedExtensions } = getUploadConfig(file);

    const isAllowed = allowedExtensions.includes(ext);

    if (!isAllowed) {
      return cb(
        new Error(
          `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`
        ),
        false
      );
    }

    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

/* =========================================
   LOCAL STORAGE
========================================= */

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { uploadPath } = getUploadConfig(file);

    ensureDir(uploadPath);

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const fileName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `${fileName}${ext}`);
  },
});

/* =========================================
   AWS S3 CONFIG
========================================= */

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const s3Storage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  acl: "public-read",

  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const fileName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const { uploadPath } = getUploadConfig(file);

    cb(null, `${uploadPath}/${fileName}${ext}`);
  },
});

/* =========================================
   STORAGE SWITCHER
========================================= */

const getStorage = () => {
  switch (STORAGE_TYPE) {
    case "s3":
      return s3Storage;

    case "gcp":
      throw new Error("GCP storage not implemented yet");

    case "local":
    default:
      return localStorage;
  }
};

/* =========================================
   MULTER EXPORT
========================================= */

module.exports = multer({
  storage: getStorage(),

  limits: {
    fileSize: MAX_UPLOAD_SIZE,
  },

  fileFilter,
});