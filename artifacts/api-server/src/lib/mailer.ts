import { Resend } from "resend";
import { logger } from "./logger";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "CoolTrigoGuy <onboarding@resend.dev>";

const LOGO_SVG = `
<div style="display:inline-flex;align-items:center;gap:12px;margin-bottom:8px;">
  <div style="background:#2563eb;border-radius:10px;padding:10px;display:inline-block;">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 20L12 4L21 20H3Z" fill="white" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>
  </div>
  <span style="font-size:20px;font-weight:700;color:#1e293b;font-family:sans-serif;">
    El Asistente Trigonométrico
  </span>
</div>
`;

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#2563eb;border-radius:12px 12px 0 0;padding:28px 36px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:8px;display:inline-block;vertical-align:middle;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 20L12 4L21 20H3Z" fill="white" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
              </div>
              <span style="display:inline-block;vertical-align:middle;color:white;font-size:18px;font-weight:700;margin-left:10px;">
                El Asistente Trigonométrico
              </span>
            </div>
            <div style="margin-top:6px;margin-left:2px;">
              <span style="background:rgba(255,255,255,0.25);color:white;font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px;letter-spacing:0.5px;">
                ✦ MENSAJE OFICIAL
              </span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:white;padding:36px 36px 28px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              Este correo fue enviado por <strong>CoolTrigoGuy</strong>, el bot oficial de El Asistente Trigonométrico.<br>
              Si no reconoces esta acción, ignora este mensaje.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, username: string): Promise<void> {
  const content = `
    <h1 style="margin:0 0 8px;color:#1e293b;font-size:26px;font-weight:700;">
      ¡Bienvenido, ${username}! 🎉
    </h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
      Gracias por registrarte en <strong>El Asistente Trigonométrico</strong>. Tu cuenta ha sido creada con éxito.
    </p>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 12px;color:#1e40af;font-size:14px;font-weight:600;">Con tu cuenta puedes:</p>
      <ul style="margin:0;padding-left:20px;color:#1e40af;font-size:14px;line-height:2;">
        <li>Resolver triángulos y calcular funciones trigonométricas</li>
        <li>Verificar identidades trigonométricas paso a paso</li>
        <li>Explorar gráficas interactivas de seno, coseno y tangente</li>
        <li>Practicar con ejercicios y desbloquear <strong>14 logros</strong></li>
      </ul>
    </div>

    <div style="text-align:center;margin-bottom:8px;">
      <a href="https://trigonometrico.replit.app"
         style="display:inline-block;background:#2563eb;color:white;font-size:15px;font-weight:600;padding:13px 32px;border-radius:8px;text-decoration:none;">
        Ir a la plataforma →
      </a>
    </div>

    <p style="margin:28px 0 0;color:#94a3b8;font-size:13px;border-top:1px solid #f1f5f9;padding-top:20px;">
      — <strong>CoolTrigoGuy</strong>, tu asistente oficial
    </p>
  `;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Gracias por registrarte en El Asistente Trigonométrico",
      html: baseTemplate(content),
    });
  } catch (err) {
    logger.warn({ err }, "Failed to send welcome email");
  }
}

export async function sendLoginEmail(to: string, username: string): Promise<void> {
  const now = new Date().toLocaleString("es-ES", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `
    <h1 style="margin:0 0 8px;color:#1e293b;font-size:24px;font-weight:700;">
      Nuevo inicio de sesión
    </h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
      Hola <strong>${username}</strong>, acabas de iniciar sesión en <strong>El Asistente Trigonométrico</strong>.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px 24px;margin-bottom:24px;">
      <p style="margin:0;color:#166534;font-size:14px;">
        <span style="font-size:18px;">🔐</span>&nbsp;
        <strong>Sesión iniciada correctamente</strong><br>
        <span style="color:#15803d;font-size:13px;margin-left:26px;">
          ${now}
        </span>
      </p>
    </div>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 24px;margin-bottom:28px;">
      <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.7;">
        <strong>¿No fuiste tú?</strong> Si no reconoces este acceso, cambia tu contraseña inmediatamente
        para proteger tu cuenta.
      </p>
    </div>

    <p style="margin:0;color:#94a3b8;font-size:13px;border-top:1px solid #f1f5f9;padding-top:20px;">
      — <strong>CoolTrigoGuy</strong>, tu asistente oficial
    </p>
  `;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Iniciaste sesión en El Asistente Trigonométrico",
      html: baseTemplate(content),
    });
  } catch (err) {
    logger.warn({ err }, "Failed to send login email");
  }
}
