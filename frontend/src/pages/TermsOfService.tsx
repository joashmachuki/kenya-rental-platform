export default function TermsOfService() {
  return (
    <div className="min-h-screen pt-20 px-4 max-w-4xl mx-auto pb-20">
      <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
      
      <div className="space-y-8 text-dark-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
          <p>
            By using KejaFind, you agree to these Terms of Service. If you do not agree, please do not use our platform. We reserve the right to modify these terms at any time, and continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use KejaFind. Landlords must provide valid identification and undergo our verification process before listing properties. We reserve the right to reject or remove any user who provides false information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. User Conduct</h2>
          <p className="mb-3">
            You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Post fake, misleading, or fraudulent property listings</li>
            <li>Harass, threaten, or discriminate against other users</li>
            <li>Use the platform for illegal activities or scams</li>
            <li>Attempt to bypass our verification or payment systems</li>
            <li>Harvest contact information without paying the unlock fee</li>
            <li>Impersonate another person or entity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Listing Rules for Landlords</h2>
          <p className="mb-3">
            All property listings must:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Be accurate and up-to-date</li>
            <li>Include real photos of the actual property</li>
            <li>State the correct price and location</li>
            <li>Not discriminate based on tribe, religion, or ethnicity</li>
          </ul>
          <p className="mt-3">
            We may hide or remove listings that violate these rules. Repeated violations will result in permanent account ban.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Payments and Escrow</h2>
          <p>
            Renters pay a KSh 50 unlock fee to access landlord contact details. This fee is held in escrow until the renter confirms a property viewing. If a dispute arises, our team will investigate and may refund the fee. Landlords receive payment only after viewing confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Reporting and Enforcement</h2>
          <p>
            Users can report suspicious listings or behavior. We investigate all reports within 24 hours. If we confirm fraud or policy violations, we will remove the listing, ban the user, and cooperate with law enforcement if necessary. False reporting is also a violation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
          <p>
            KejaFind facilitates connections between renters and landlords but does not own, manage, or inspect any listed properties. We are not liable for disputes between users, property conditions, or rental agreements. Users are responsible for conducting their own due diligence before signing any lease or making payments.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Account Termination</h2>
          <p>
            We may suspend or terminate your account for violations of these terms, fraudulent activity, or at your request. Upon termination, your listings and data may be removed from public view but retained for legal and security purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of Kenya. Any disputes will be resolved in Kenyan courts.
          </p>
        </section>

        <p className="text-dark-500 text-sm mt-8">
          Last updated: June 2026
        </p>
      </div>
    </div>
  )
}
