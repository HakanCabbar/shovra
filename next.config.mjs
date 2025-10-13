import path from "path";
import { fileURLToPath } from "url";

// __dirname tanımı
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  webpack(config) {
    // artık __dirname kullanılabilir
    return config;
  },
};
