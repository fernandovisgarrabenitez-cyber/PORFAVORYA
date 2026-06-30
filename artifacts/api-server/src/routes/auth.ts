import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sendWelcomeEmail, sendLoginEmail } from "../lib/mailer";

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";
const SALT_ROUNDS = 12;

const registerSchema = z.object({
  email: z.string().email().max(254),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo"),
  password: z
    .string()
    .min(8)
    .max(72),
});

const loginSchema = z.object({
  username: z.string().min(1).max(30),
  password: z.string().min(1).max(72),
});

function signToken(userId: number, username: string) {
  return jwt.sign({ sub: userId, username }, JWT_SECRET, { expiresIn: "30d" });
}

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" });
    return;
  }

  const { email, username, password } = parsed.data;

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "El correo ya está registrado" });
    return;
  }

  const existingUsername = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username.toLowerCase()))
    .limit(1);

  if (existingUsername.length > 0) {
    res.status(409).json({ error: "El nombre de usuario ya está en uso" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db
    .insert(usersTable)
    .values({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      passwordHash,
    })
    .returning({ id: usersTable.id, username: usersTable.username });

  const token = signToken(user.id, user.username);
  res.status(201).json({ token, username: user.username });

  // Send welcome email asynchronously — don't block the response
  sendWelcomeEmail(email.toLowerCase(), user.username).catch(() => {});
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const { username, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username.toLowerCase()))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    return;
  }

  const token = signToken(user.id, user.username);
  res.json({ token, username: user.username });

  // Send login notification email asynchronously
  sendLoginEmail(user.email, user.username).catch(() => {});
});

router.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { sub: number; username: string };
    res.json({ id: payload.sub, username: payload.username });
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
});

export default router;
