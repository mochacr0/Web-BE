import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { protect, auth } from '../middlewares/auth.middleware.js';
import { multerUpload } from '../utils/multer.js';
import sliderController from '../controllers/slider.controller.js';

const sliderRouter = express.Router();

sliderRouter.get('/', expressAsyncHandler(sliderController.getSliders));

sliderRouter.get('/:id', expressAsyncHandler(sliderController.getSliderById));

sliderRouter.post(
    '/',
    protect,
    auth('admin'),
    multerUpload.array('slider', 5),
    expressAsyncHandler(sliderController.createSliders),
);

sliderRouter.delete('/:id', protect, auth('admin'), expressAsyncHandler(sliderController.deleteSlider));

sliderRouter.put(
    '/:id',
    protect,
    auth('admin'),
    multerUpload.single('slider'),
    expressAsyncHandler(sliderController.updateSlider),
);

export default sliderRouter;