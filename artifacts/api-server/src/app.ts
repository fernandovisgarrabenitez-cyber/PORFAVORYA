import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ── A05: Security headers via Helmet ──────────────────────
// Adds: X-Content-Type-Options, X-Frame-Options, HSTS,
// X-XSS-Protection, Referrer-Policy, and more.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// ── A05: Restrict CORS — only allow same-origin requests ──
// The frontend is served from the same domain via the reverse proxy,
// so cross-origin API access is not needed in production.
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? false // disallow all cross-origin in production
        : true,  // allow all in development for local testing
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// ── A08: Body size limits — prevent oversized payloads ────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Logging ───────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0], // A03: strip query params from logs
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.use("/api", router);

export default app;
