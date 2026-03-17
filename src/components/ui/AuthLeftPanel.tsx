

/* ── Left panel — shared across all three pages ── */
const AuthLeftPanel: React.FC<{
    heading: React.ReactNode;
    sub: string;
    features: { icon: React.ReactNode; text: string }[];
}> = ({
    heading,
    sub,
    features
  }) => {
    return (
    <div
      className="relative hidden lg:flex flex-col w-[420px] xl:w-[460px] shrink-0 overflow-hidden"
      style={{ background: "linear-gradient(160deg,#1d4ed8 0%,#1e40af 45%,#1e3a8a 100%)" }}
    >
      {/* dot texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='7' cy='7' r='1.2'/%3E%3Ccircle cx='27' cy='7' r='1.2'/%3E%3Ccircle cx='47' cy='7' r='1.2'/%3E%3Ccircle cx='7' cy='27' r='1.2'/%3E%3Ccircle cx='27' cy='27' r='1.2'/%3E%3Ccircle cx='47' cy='27' r='1.2'/%3E%3Ccircle cx='7' cy='47' r='1.2'/%3E%3Ccircle cx='27' cy='47' r='1.2'/%3E%3Ccircle cx='47' cy='47' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* decorative rings */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full border-40 border-white/10 pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border-24 border-white/6 pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full border-32 border-white/5 pointer-events-none" />
  
      <div className="relative flex flex-col flex-1 px-10 py-10 gap-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="text-white font-google font-bold text-xl tracking-tight">PayrollHQ</span>
        </div>
  
        {/* Headline */}
        <div className="flex-1 flex flex-col justify-center gap-6">
          <div>
            <h1 className="text-3xl xl:text-4xl font-extrabold font-google text-white leading-tight mb-4">
              {heading}
            </h1>
            <p className="text-base text-white/60 font-google leading-relaxed">{sub}</p>
          </div>
  
          {/* Feature list */}
          <div className="flex flex-col gap-3.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white/90 text-base shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm font-medium font-google text-white/75">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
  
        {/* Bottom badge */}
        <div className="font-google bg-white/10 border border-white/15 rounded-2xl px-5 py-4">
          <p className="text-xs font-semibold text-white/40 mb-1">Trusted by teams</p>
          <p className="text-sm font-semibold text-white/80">Secure · Compliant · Ready to use</p>
        </div>
  
        <div className="text-center flex items-center gap-2 justify-center border-t border-white/35 pt-4" >
          <p className="text-center text-[0.8rem] font-source font-medium text-white/80 leading-relaxed">© {new Date().getFullYear()} All rights reserved.</p>
          <div className="w-px h-4 bg-white/35" />
          <p className="text-center text-[0.8rem] font-source font-medium text-white/80 leading-relaxed">Powered by APIHub Solutions</p>
        </div>
        </div>
    </div>
  );
}

export default AuthLeftPanel;