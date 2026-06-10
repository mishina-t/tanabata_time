import { useEffect, useState } from "react";
import { operatorSlots, type OperatorSlot } from "../config/operators";

const SESSION_KEY = "tanabata-rakuken-operator-code";

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function findOperator(code: string): Promise<OperatorSlot | undefined> {
  const hash = await sha256(code.trim());
  return operatorSlots.find((operator) => operator.codeHash === hash);
}

export function useOperatorAccess() {
  const [initialCode] = useState(() => localStorage.getItem(SESSION_KEY));
  const [operator, setOperator] = useState<OperatorSlot | undefined>();
  const [operatorCode, setOperatorCode] = useState<string | undefined>();
  const [checking, setChecking] = useState(Boolean(initialCode));

  useEffect(() => {
    if (!initialCode) return;
    let active = true;
    void findOperator(initialCode).then((matched) => {
      if (active) {
        setOperator(matched);
        setOperatorCode(matched ? initialCode : undefined);
      }
    }).finally(() => {
      if (active) setChecking(false);
    });
    return () => { active = false; };
  }, [initialCode]);

  const login = async () => {
    const previousCode = localStorage.getItem(SESSION_KEY) ?? "";
    const code = window.prompt("運営コードを入力してください", previousCode)?.trim();
    if (!code) return false;
    setChecking(true);
    try {
      const matched = await findOperator(code);
      if (!matched) {
        window.alert("運営コードが正しくありません。");
        return false;
      }
      localStorage.setItem(SESSION_KEY, code);
      setOperator(matched);
      setOperatorCode(code);
      return true;
    } finally {
      setChecking(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setOperator(undefined);
    setOperatorCode(undefined);
  };

  return { operator, operatorCode, checking, login, logout };
}
