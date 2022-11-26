import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, auth } from '../middlewares/auth.middleware.js';
import { multerUpload } from '../utils/multer.js';
import sliderController from '../controllers/slider.controller.js';

const sliderRouter = express.Router();

sliderRouter.get('/', asyncHandler(sliderController.getSliders));

sliderRouter.get('/:id', asyncHandler(sliderController.getSliderById));

sliderRouter.post(
    '/',
    protect,
    auth('admin'),
    multerUpload.array('slider', 5),
    asyncHandler(sliderController.createSliders),
);

sliderRouter.delete('/:id', protect, auth('admin'), asyncHandler(sliderController.deleteSlider));

sliderRouter.put(
    '/:id',
    protect,
    auth('admin'),
    multerUpload.single('slider'),
    asyncHandler(sliderController.updateSlider),
);

export default sliderRouter;