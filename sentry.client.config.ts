// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Configura o ambiente
  environment: process.env.NODE_ENV || "development",

  // Taxa de amostragem de traces (0.0 a 1.0)
  // Em produção, considere reduzir para 0.1 ou menos para economizar quota
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Taxa de amostragem de replay (0.0 a 1.0)
  replaysSessionSampleRate: 0.1, // 10% das sessões normais

  // Se houver erro, captura 100% dos replays
  replaysOnErrorSampleRate: 1.0,

  // Configuração de integração
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Configura quais breadcrumbs capturar
  beforeBreadcrumb(breadcrumb) {
    // Filtra breadcrumbs sensíveis
    if (breadcrumb.category === "console") {
      return null;
    }
    return breadcrumb;
  },

  // Filtra eventos antes de enviar
  beforeSend(event, hint) {
    // Filtra erros conhecidos/esperados
    const error = hint.originalException;

    if (error && typeof error === "object" && "message" in error) {
      const message = String(error.message);

      // Ignora erros de rede que já são tratados
      if (message.includes("Network Error") || message.includes("Failed to fetch")) {
        return null;
      }
    }

    return event;
  },

  // Ignora erros específicos
  ignoreErrors: [
    // Erros de navegadores
    "Non-Error promise rejection captured",
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    // Erros de extensões do navegador
    /^chrome-extension:/,
    /^moz-extension:/,
  ],

  // Não enviar em desenvolvimento (opcional)
  enabled: process.env.NODE_ENV === "production",
});

