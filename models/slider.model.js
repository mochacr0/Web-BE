import mongoose from 'mongoose';

const sliderSchema = mongoose.Schema(
  {
    url: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);
const Slider = mongoose.model('Slider', sliderSchema);
export default Slider;
