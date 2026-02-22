import React, { createContext, useContext, useMemo, useState } from "react";
import { DB } from "../storage/db";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => DB.read().sessionUser || null);

  const api = useMemo(() => {
    function login(email, password) {
      const d = DB.read();
      const found = d.users.find((u) => u.email === email && u.password === password);
      if (!found) throw new Error("Email ou senha inválidos.");

      DB.write((data, audit) => {
        data.sessionUser = { id: found.id, name: found.name, role: found.role, email: found.email };
        audit("LOGIN", "user", found.id, `Login: ${found.email}`);
        return data;
      });

      setUser({ id: found.id, name: found.name, role: found.role, email: found.email });
    }

    function register(payload) {
      DB.write((data, audit) => {
        const exists = data.users.some((u) => u.email === payload.email);
        if (exists) throw new Error("Email já cadastrado.");

        const newUser = {
          id: DB.uid("u"),
          name: payload.name,
          email: payload.email,
          password: payload.password,
          address: payload.address,
          accountType: payload.accountType, // pf | empresa
          companyName: payload.accountType === "empresa" ? payload.companyName : "",
          role: "user",
          createdAt: Date.now(),
        };

        data.users.unshift(newUser);
        data.sessionUser = { id: newUser.id, name: newUser.name, role: newUser.role, email: newUser.email };
        audit("CREATE", "user", newUser.id, `Cadastro: ${newUser.email}`);
        return data;
      });

      const d = DB.read();
      setUser(d.sessionUser);
    }

    function logout() {
      DB.write((data, audit) => {
        if (data.sessionUser?.id) {
          audit("LOGOUT", "user", data.sessionUser.id, `Logout: ${data.sessionUser.email}`);
        }
        data.sessionUser = null;
        return data;
      });
      setUser(null);
    }

    return { user, login, register, logout };
  }, [user]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}