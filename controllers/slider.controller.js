import * as fs from 'fs';
import Slider from '../models/slider.model.js';
import { cloudinaryUpload, cloudinaryRemove } from '../utils/cloudinary.js';

const getSliders = async (req, res) => {
  const sliders = await Slider.find({}).sort({ _id: -1 });
  res.status(200);
  res.json(sliders);
};

const getSliderById = async (req, res) => {
  const slider = await Slider.findById(req.params.id);
  if (!slider) {
    res.status(404);
    throw new Error('Slider not found');
  }
  res.status(200);
  res.json(slider);
};

const createSliders = async (req, res) => {
  if (!req.files || req.files.length == 0) {
    res.status(400);
    throw new Error('Image not provided');
  }
  const uploadImages = req.files.map(async (file) => {
    const image = await cloudinaryUpload(file.path);
    if (!image) {
      throw new Error('Some sliders was not uploaded due to unknown error');
    }
    fs.unlink(file.path, (error) => {
      if (error) {
        throw new Error(error);
      }
    });
    const slider = new Slider({
      url: image.secure_url,
    });
    return slider.save();
  });
  await Promise.all(uploadImages);
  res.status(201);
  res.json({ message: 'Sliders are added' });
};

const updateSlider = async (req, res) => {
  const slider = await Slider.findById(req.params.id);
  if (!slider) {
    res.status(404);
    throw new Error('Slider not found');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('Image not provided');
  }
  const image = await cloudinaryUpload(req.file.path);
  if (!image) {
    res.status(500);
    throw new Error('Error while uploading image');
  }
  const publicId = slider.url
    .match(/(\w+)\.(jpg|jpeg|jpe|png|webp)$/g)[0]
    .split('.')
    .shift();
  const removeOldImageCloudinary = cloudinaryRemove(publicId);
  const removeNewImageLocal = fs.promises.unlink(req.file.path);
  slider.url = image.secure_url.toString();
  const [newSlider, ...rest] = await Promise.all([
    slider.save(),
    removeOldImageCloudinary,
    removeNewImageLocal,
  ]);
  res.status(200);
  res.json(newSlider);
};

const deleteSlider = async (req, res) => {
  const deletedSlider = await Slider.findByIdAndDelete(req.params.id);
  if (!deletedSlider) {
    res.status(404);
    throw new Error('Slider not found');
  }
  const publicId = deletedSlider.url
    .match(/(\w+)\.(jpg|jpeg|jpe|png|webp)$/g)[0]
    .split('.')
    .shift();
  const removeImage = await cloudinaryRemove(publicId);
  res.status(200);
  res.json({ message: 'Slider is deleted' });
};

const sliderController = {
  getSliders,
  getSliderById,
  createSliders,
  updateSlider,
  deleteSlider,
};
export default sliderController;
