type P = { className?: string };
const s = (d: React.ReactNode) =>
  function Icon({ className = "h-4 w-4" }: P) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        {d}
      </svg>
    );
  };

export const IHome = s(<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>);
export const IPulse = s(<path d="M3 12h4l3-7 4 14 3-7h4" />);
export const IRocket = s(<><path d="M12 2c3 2.5 5 6 5 10v4H7v-4c0-4 2-7.5 5-10z" /><circle cx="12" cy="10" r="1.6" /><path d="M7 14l-3 3v3l3-1.5M17 14l3 3v3l-3-1.5M10 20l2 2 2-2" /></>);
export const ICalc = s(<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" /></>);
export const IFlag = s(<><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></>);
export const ICart = s(<><path d="M3 4h2l2.5 11h10L20 7H6.5" /><circle cx="9" cy="19" r="1.3" /><circle cx="17" cy="19" r="1.3" /></>);
export const ICopy = s(<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>);
export const ICheck = s(<path d="M5 12l5 5 9-10" />);
export const IArrow = s(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IExt = s(<><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>);
export const IX = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" />
  </svg>
);
export const ITg = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M21.9 4.3l-3.2 15.1c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13 1.4 11.5c-1-.3-1-1 .2-1.5l18.9-7.3c.9-.3 1.6.2 1.4 1.6z" />
  </svg>
);
export const IDiscord = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M19.3 5.3A17 17 0 0 0 15 4l-.5 1.1a15.6 15.6 0 0 0-5 0L9 4a17 17 0 0 0-4.3 1.3C2 9.4 1.3 13.4 1.6 17.3A17 17 0 0 0 6.9 20l1.1-1.8c-.6-.2-1.2-.5-1.7-.9l.4-.3a12 12 0 0 0 10.6 0l.4.3c-.5.4-1.1.7-1.7.9l1.1 1.8a17 17 0 0 0 5.3-2.7c.4-4.5-.7-8.5-3.1-12zM8.7 14.9c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1zm6.6 0c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1z" />
  </svg>
);
export const IHelp = s(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01" /></>);
export const IPlus = s(<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>);
export const IGlobe = s(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>);
