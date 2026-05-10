'use client';

import Link from 'next/link';

export default function Follow() {
  return (
    <div id="app" className="app-container">
      <section className="screen active" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="onboarding-card glass">
          <div className="profile-circle">
            <img 
              src="https://avatars.githubusercontent.com/u/92568876?v=4" 
              alt="Profile" 
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://media.geeksforgeeks.org/auth/profile/prakhardoneria'; }}
            />
          </div>
          <h2>Connect with the<br />Creator</h2>
          <p>Stay updated with the latest in AI Music and Tech.</p>
          <a href="https://www.geeksforgeeks.org/profile/prakhardoneria" target="_blank" className="btn-primary follow-link">Follow on GfG Connect</a>
          <Link href="/sponsor" className="btn-secondary">
            Next Step
          </Link>
        </div>
      </section>
    </div>
  );
}
