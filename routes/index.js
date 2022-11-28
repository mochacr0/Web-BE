import authRouter from './auth.route.js';
import categoryRouter from './category.route.js';
import productRouter from './product.route.js';
import orderRouter from './order.route.js';
import cartRouter from './cart.route.js';
import userRouter from './user.route.js';
import testRouter from './test.route.js';
import sliderRouter from './slider.route.js';

const routes = (app) => {
  app.use('/api/auth', authRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/products', productRouter);
  app.use('/api/carts', cartRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/users', userRouter);
  app.use('/api/test', testRouter);
  app.use('/api/sliders', sliderRouter);
};

export default routes;
