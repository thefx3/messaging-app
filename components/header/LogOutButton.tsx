"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await supabaseClient.auth.signOut();
        router.replace("/login");
        router.refresh();
    }

    return (
        <button
          onClick={handleLogout}
          className="btn-primary"
        >
          Déconnexion
        </button>
      );
}
