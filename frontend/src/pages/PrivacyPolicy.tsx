export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-20 px-4 max-w-4xl mx-auto pb-20">
      <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
      
      <div className="space-y-8 text-dark-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p className="mb-3">
            KejaFind collects information you provide directly to us when you register, list a property, or contact a landlord. This includes your name, email address, phone number, national ID (for landlord verification), and payment details.
          </p>
          <p>
            We also collect usage data such as search history, property views, and messages sent through our platform to improve your experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
          <p className="mb-3">
            We use your information to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Connect renters with verified landlords</li>
            <li>Process escrow payments and unlock fees</li>
            <li>Verify landlord identities and prevent fraud</li>
            <li>Send notifications about your listings or inquiries</li>
            <li>Improve our platform and user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h2>
          <p>
            We do not sell your personal data to third parties. Your contact details are only shared with a landlord after you pay the unlock fee, or with a renter when you respond to their message. We may share data with law enforcement if required by law or to investigate fraud reports.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
          <p>
            We use industry-standard encryption and security measures to protect your data. All payments are processed through secure escrow systems. However, no online platform is 100% secure, and we encourage users to report any suspicious activity immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information. You can request account deletion by contacting us at privacy@kejafind.co.ke. We will process your request within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Cookies</h2>
          <p>
            KejaFind uses cookies to keep you logged in, remember your preferences, and analyze traffic. You can disable cookies in your browser settings, but this may affect platform functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notifications. Continued use of KejaFind after changes constitutes acceptance.
          </p>
        </section>

        <p className="text-dark-500 text-sm mt-8">
          Last updated: June 2026
        </p>
      </div>
    </div>
  )
}
