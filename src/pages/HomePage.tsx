import { Link } from "react-router-dom";
import { links } from "../config/links";
import { festivalDates, type FestivalDate } from "../types/schedule";

function getToday(): FestivalDate {
  const today = new Date().toLocaleDateString("sv-SE");
  return festivalDates.includes(today as FestivalDate) ? (today as FestivalDate) : "2026-07-04";
}

export function HomePage() {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-star" aria-hidden="true">七</div>
        <p className="eyebrow">TANABATA FESTIVAL 2026</p>
        <h1>七夕祭<br /><span>落語研究会</span></h1>
        <p className="hero-lead">教室寄席とステージ企画の予定を確認できます</p>
        <p>七夕祭では、落語研究会が教室寄席とステージ企画を行います。教室寄席の出番やステージ企画の時間を確認して、ぜひ遊びに来てください。</p>
        <Link className="primary-link" to={`/schedule?date=${getToday()}`}>今日の予定を見る</Link>
      </section>

      <section className="home-section">
        <div className="section-heading"><p className="eyebrow">SCHEDULE</p><h2>開催日から選ぶ</h2></div>
        <div className="home-date-grid">
          {festivalDates.map((date, index) => (
            <Link key={date} to={`/schedule?date=${date}`}>
              <span>7/{index + 3}</span><small>{index === 0 ? "前日企画" : "本祭"}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section link-section">
        <div className="section-heading"><p className="eyebrow">OFFICIAL LINKS</p><h2>七夕祭の公式情報</h2></div>
        <div className="official-links">
          <a href={links.officialApp} target="_blank" rel="noreferrer">公式アプリ <span>↗</span></a>
          <a href={links.officialSite} target="_blank" rel="noreferrer">公式サイト <span>↗</span></a>
        </div>
        <p className="welcome-message">みんなで七夕祭を遊びに来てね。</p>
      </section>
    </main>
  );
}
