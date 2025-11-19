"use client";

import { useEffect } from "react";
import NextError from "next/error";
import { datadogError } from "@/core/services/datadog-error.service";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // Capturar erro global no Datadog
    datadogError.captureError(error, {
      action: "global_error",
      metadata: {
        digest: error.digest,
        errorType: "GLOBAL_ERROR",
      },
    });
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}