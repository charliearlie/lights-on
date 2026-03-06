import { config } from "dotenv";
import path from "path";
import fs from "fs";

export default async function globalSetup() {
  config({ path: path.resolve(__dirname, "../.env") });

  // Generate a minimal test PNG if it doesn't exist
  const fixturePath = path.resolve(__dirname, "fixtures/test-image.png");
  if (!fs.existsSync(fixturePath)) {
    // Minimal valid 1x1 red PNG (68 bytes)
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "base64"
    );
    fs.writeFileSync(fixturePath, pngBuffer);
  }
}
