"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { datadogRum } from "@datadog/browser-rum";
import { reactPlugin } from "@datadog/browser-rum-react";

export function DatadogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Inicializar Datadog RUM apenas no cliente
    if (typeof window !== "undefined" && !datadogRum.getInitConfiguration()) {
      datadogRum.init({
        applicationId: "1a2f1e93-8d48-408b-a5e2-bc4224cf6578",
        clientToken: "pub49b8ab6f0ee91f02769e0651e2ea11fe",
        site: "us5.datadoghq.com",
        service: "crm",
        env: "prod",

        // Specify a version number to identify the deployed version of your application in Datadog
        // version: '1.0.0',

        sessionSampleRate: 100,
        sessionReplaySampleRate: 20,
        defaultPrivacyLevel: "mask-user-input",

        plugins: [reactPlugin({ router: true })],
      });
    }
  }, []);

  // Rastrear mudanças de rota do Next.js App Router
  useEffect(() => {
    if (typeof window !== "undefined" && datadogRum.getInitConfiguration()) {
      datadogRum.startView(pathname || "/");
    }
  }, [pathname]);

  return <>{children}</>;
}

