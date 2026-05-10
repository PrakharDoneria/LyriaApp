'use client';

import Link from 'next/link';

export default function Landing() {
  return (
    <div id="app" className="app-container">
      <section id="landing-screen" className="screen active">
        <div className="hero-visual">
          <div className="vinyl-stack">
            <div className="vinyl vinyl-1"></div>
            <div className="vinyl vinyl-2"></div>
            <div className="vinyl vinyl-3"></div>
          </div>
          <div className="cassette-container">
            <img src="/cassette.png" alt="Cassette Tape" className="cassette-img" />
          </div>
        </div>
        <div className="hero-content">
          <h1>New<br />Age Of<br />Music</h1>
          <Link href="/follow" className="btn-primary">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
