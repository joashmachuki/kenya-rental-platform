export default function AboutUs() {
  return (
    <div className="min-h-screen pt-20 px-4 max-w-4xl mx-auto pb-20">
      <div className="flex justify-center mb-6 bg-white rounded-2xl p-8">
        <img src="/logo.png" alt="KejaFind Logo" className="w-96 h-auto" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-8 text-center">About KejaFind</h1>
      
      <div className="space-y-8 text-dark-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Your Trusted Home-Finding Partner</h2>
          <p>
            KejaFind is Kenya's most trusted rental platform, connecting renters with verified landlords across all 47 counties. We believe everyone deserves a safe, comfortable place to call home — without the stress, scams, and endless walking under the hot sun that usually comes with house hunting.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Why We Built KejaFind</h2>
          <p className="mb-3">
            We know how exhausting house hunting can be. Walking from estate to estate, dealing with fake listings, paying viewing fees for properties that don't even exist, and falling victim to scammers who disappear with your hard-earned money.
          </p>
          <p>
            We decided enough is enough. KejaFind was born to bring the entire house-hunting experience to your fingertips. Browse hundreds of verified listings from your phone or laptop, filter by location, price, and preferences, and only step out when you've found the one.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Safety First — Verified Landlords Only</h2>
          <p className="mb-3">
            Every landlord on KejaFind goes through a strict identity verification process. We require their national ID, phone verification, and manual admin approval before they can list any property. This means:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>No fake listings</li>
            <li>No ghost landlords who vanish after taking your money</li>
            <li>No more "the house was just rented" after you've traveled miles to view it</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">See Something Suspicious? Report It.</h2>
          <p className="mb-3">
            We take fraud seriously. If you come across a listing that looks suspicious — wrong pricing, fake photos, a landlord who refuses to verify, or anything that doesn't feel right — hit the <strong className="text-white">Report</strong> button immediately.
          </p>
          <p className="mb-3">
            Our admin team reviews every report within 24 hours. If we confirm the listing or landlord is not genuine, we take swift action:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Remove the fraudulent listing instantly</li>
            <li>Block the landlord from the platform permanently</li>
            <li>Flag their details to prevent future scams</li>
          </ul>
          <p className="mt-3">
            Your vigilance helps keep KejaFind safe for everyone. Together, we weed out the bad actors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Escrow Protection for Your Peace of Mind</h2>
          <p>
            When you find a property you love, a small unlock fee of KSh 50 is held in escrow. This fee is only released to the landlord after you confirm you've actually viewed the property. If something goes wrong or the listing was misleading, you can dispute and our team will investigate. Your money is protected every step of the way.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Find Your Perfect Home, Stress-Free</h2>
          <p className="mb-3">
            Whether you're looking for a cozy studio in Nairobi CBD, a family apartment in Westlands, a bedsitter near campus, or a beachfront villa in Mombasa — KejaFind has you covered.
          </p>
          <p>
            Stop walking under the scorching sun. Stop getting stood up by fake agents. Stop losing money to scams. Your next home is just a few clicks away.
          </p>
        </section>

        <section className="bg-brand-900/20 border border-brand-500/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-brand-400 mb-3">Ready to Find Your Home?</h2>
          <p className="mb-4">
            Join thousands of Kenyans who have already discovered the smarter way to rent. Browse verified listings, connect with trusted landlords, and move into your dream home — all from the comfort of your couch.
          </p>
          <a href="/" className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all">
            Start Browsing Now
          </a>
        </section>
      </div>
    </div>
  )
}
