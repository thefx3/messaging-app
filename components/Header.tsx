import LogoutButton from "./header/LogOutButton";

type HeaderProps = {
    email: string;
    role: string;
}

export default function Header({ email, role }: HeaderProps) {

    return (
        <header className="border w-full flex justify-center items-center justify-between p-4 bg-white/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/50">
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-700 sm:mt-0">
              <div className="text-sm hidden md:block">
                  <span className="font-medium text-slate-900">{email ?? "—"}</span>
                  <span className="ml-2 rounded-full border border-white/80 bg-white/70 px-2 py-0.5 text-xs text-slate-600">
                    {role}
                  </span>
              </div>
              <LogoutButton />
          </div>
      </header>
    );

}
