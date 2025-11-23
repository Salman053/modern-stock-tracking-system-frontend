import { useEffect, useState } from "react";

export function useCooldownButton(key: string, cooldownMs: number) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const lastSent = localStorage.getItem(key);
    if (lastSent) {
      const diff = Date.now() - Number(lastSent);
      if (diff < cooldownMs) {
        setIsDisabled(true);
        setRemaining(Math.ceil((cooldownMs - diff) / 1000));
      }
    }
  }, [key, cooldownMs]);

  useEffect(() => {
    if (!isDisabled) return;

    const interval = setInterval(() => {
      const lastSent = localStorage.getItem(key);
      if (!lastSent) return;

      const diff = Date.now() - Number(lastSent);
      if (diff >= cooldownMs) {
        setIsDisabled(false);
        setRemaining(0);
        localStorage.removeItem(key);
        clearInterval(interval);
      } else {
        setRemaining(Math.ceil((cooldownMs - diff) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isDisabled, key, cooldownMs]);

  const trigger = () => {
    setIsDisabled(true);
    setRemaining(cooldownMs / 1000);
    localStorage.setItem(key, Date.now().toString());
  };

  return { isDisabled, remaining, trigger };
}
