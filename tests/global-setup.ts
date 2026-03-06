import { config } from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
  config({ path: path.resolve(__dirname, "../.env") });

  // Generate a minimal test PNG if it doesn't exist
  const fixturePath = path.resolve(__dirname, "fixtures/test-image.png");
  fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
  if (!fs.existsSync(fixturePath)) {
    // Minimal valid 1x1 red PNG (68 bytes)
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "base64"
    );
    fs.writeFileSync(fixturePath, pngBuffer);
  }
}
