import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export function ClientToaster() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className:
          "!bg-card-light !text-[#1C1917] !border-border-light dark:!bg-card-dark dark:!text-[#F5F0E8] dark:!border-border-dark",
      }}
    />
  );
}
