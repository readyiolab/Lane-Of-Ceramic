import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`${env.APP_NAME} running on port ${env.PORT} on 0.0.0.0`);
});
