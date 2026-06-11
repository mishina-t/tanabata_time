import { links } from "../config/links";

export function OfficialIconLinks() {
  return (
    <nav className="official-icon-links" aria-label="七夕祭の公式情報">
      <a href={links.officialApp} target="_blank" rel="noreferrer" aria-label="七夕祭公式アプリ" title="七夕祭公式アプリ">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
          <path d="M10 5h4M11 18.5h2" />
        </svg>
      </a>
      <a href={links.officialSite} target="_blank" rel="noreferrer" aria-label="七夕祭公式サイト" title="七夕祭公式サイト">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
      </a>
    </nav>
  );
}
