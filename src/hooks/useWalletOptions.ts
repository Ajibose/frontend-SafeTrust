"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listWalletsWithReadiness,
  type WalletWithReadiness,
} from "@/lib/stellar/wallet-status";

export function useWalletOptions(enabled: boolean) {
  const [options, setOptions] = useState<WalletWithReadiness[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setOptions(await listWalletsWithReadiness());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    refresh();

    const onFocus = () => refresh(); // user installed/unlocked in another tab
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [enabled, refresh]);

  return { options, loading, refresh };
}
