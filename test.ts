import { KinouGardeClient } from "./src/index";

const client = new KinouGardeClient();

await client.connect(
  Bun.env.KINOUGARDE_USERNAME!,
  Bun.env.KINOUGARDE_PASSWORD!,
);

const adresses = await client.adresses();
