import multer from "multer";
const destination = (req, file, cb) => {
  cb(null, "./assets/images");
};

const acceptedMimeTypes = ["image/jpg", "image/jpe", "image/png", "image/jpeg"];

const fileFilter = (req, file, cb) => {
  if (acceptedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error(`File ${file.mimetype} is not supported`), false);
};

const storage = multer.diskStorage({
  destination: destination,
});

const multerUpload = multer({
  storage: storage,
  limits: { fileSize: 1048576 },
  fileFilter: fileFilter,
});
export { multerUpload };
