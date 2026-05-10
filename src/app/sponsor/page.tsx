'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function Sponsor() {
  const razorpayContainerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Razorpay button logic
    if (razorpayContainerRef.current) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', 'pl_SkU1DZkCZZ5tCR');
      script.async = true;
      razorpayContainerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div id="app" className="app-container">
      <section className="screen active" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="onboarding-card glass">
          <h2>Support Our<br />Vision</h2>
          <p>Every donation helps us keep the servers running and increase your generation limits.</p>
          
          <div className="support-grid">
            <div className="support-item">
              <iframe src="https://github.com/sponsors/PrakharDoneria/button" title="Sponsor PrakharDoneria" height="32" width="114" style={{ border: 0, borderRadius: '6px' }}></iframe>
            </div>
            <div className="support-item">
              <form ref={razorpayContainerRef}>
                {/* Razorpay button will be injected here */}
              </form>
            </div>
            <div className="support-item">
              <a href="https://paypal.me/prakhardoneria" target="_blank" className="paypal-link">
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" />
                PayPal.me
              </a>
            </div>
          </div>

          <Link href="/dashboard" className="btn-primary" style={{ marginTop: '40px' }}>
            Launch Lyria AI
          </Link>
        </div>
      </section>
    </div>
  );
}
