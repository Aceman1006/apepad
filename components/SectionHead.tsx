export function SectionHead({ kicker, title, sub, center }: { kicker: string; title: React.ReactNode; sub?: string; center?: boolean }) {
  return (
    <div className={`max-w-[680px] ${center ? "mx-auto text-center" : ""}`}>
      <div className={`label inline-flex items-center gap-2 text-fire ${center ? "justify-center" : ""}`}>
        <span className="h-px w-6 bg-fire/60" /> {kicker}
      </div>
      <h2 className="mt-3 font-display text-[32px] font-bold uppercase leading-[1.02] tracking-tight sm:text-[44px]">{title}</h2>
      {sub && <p className="mt-3 text-[15px] leading-relaxed text-mute">{sub}</p>}
    </div>
  );
}
