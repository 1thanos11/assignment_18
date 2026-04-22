import express from "express";

import { GlobalErrorHandler } from "./middleware/error.middleware";
import { authRouter, userRouter } from "./modules";
import { PORT } from "./config/config";
import connectDB from "./DB";
import { redisService } from "./common/services";

async function bootstrap() {
  await connectDB();
  await redisService.connect();

  const app: express.Express = express();
  app.use(express.json());

  //routs
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);

  //error handler
  app.use(GlobalErrorHandler);

  app.listen(PORT, () => {
    console.log(`Server Is Running On PORT ${PORT}`);
  });
}

export default bootstrap;
