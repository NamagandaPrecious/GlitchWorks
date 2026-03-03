import { app, config } from "./app";

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
  console.log(`API prefix: ${config.apiPrefix}`);
});
