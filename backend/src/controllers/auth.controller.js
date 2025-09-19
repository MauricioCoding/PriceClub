import * as authService from "../services/auth.service.js";

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    const user = await authService.signup({ name, email, password });
    return res.status(201).json(user);
  } catch (err) {
    return res.status(err.statusCode ?? 400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    return res.json({ token, user });
  } catch (err) {
    return res.status(err.statusCode ?? 400).json({ error: err.message });
  }
}
