import { useEffect } from "react";
import { logout } from "@/lib/api";
import { Loader2 } from "lucide-react";

export function LogoutHandler() {
  useEffect(() => {
    logout();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="ml-4 text-lg text-foreground">Logging out...</p>
    </div>
  );
}
