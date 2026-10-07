import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Открытие dev-сервера с телефона по Wi-Fi: без этого JS (меню, формы) блокируется.
  // Если IP компьютера в сети изменится — добавьте новый адрес сюда.
  allowedDevOrigins: ["192.168.31.203"],
};

export default nextConfig;
