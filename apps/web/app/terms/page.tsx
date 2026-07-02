import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Ikazin.io',
  description: 'Ikazin.io terms of service.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0e0d] text-gray-100">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/" className="mb-8 inline-flex text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors">
          ← Voltar
        </Link>
        <h1 className="mb-8 text-3xl font-black tracking-tight text-white">Terms of Service</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p><strong>Last updated:</strong> July 2026</p>

          <h2 className="text-lg font-bold text-white mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing or purchasing any content from Ikazin.io, you agree to be bound by these Terms of Service.
            If you do not agree, do not use the platform.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">2. Service Description</h2>
          <p>
            Ikazin.io provides online training content for industrial automation and PLC programming
            (&quot;Builds&quot;). Each plan grants lifetime access to the builds included in that tier.
            Plans are sold as one-time payments — there are no recurring charges or subscriptions.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">3. Payment and Refunds</h2>
          <p>
            All payments are processed securely through Stripe. Prices are displayed in Brazilian Reais (R$)
            or US Dollars ($) as indicated at checkout. Due to the digital nature of our content,
            all sales are final. Refund requests are evaluated on a case-by-case basis within 7 days of purchase.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">4. Intellectual Property</h2>
          <p>
            All content on Ikazin.io — including videos, project files, PDFs, Digital Twin models,
            and TIA Portal configurations — is the intellectual property of Ikazin.io.
            Redistribution, resale, or public sharing of any course materials is strictly prohibited.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">5. Limitation of Liability</h2>
          <p>
            Training content is provided for educational purposes. Ikazin.io is not liable for
            any damages resulting from the application of techniques learned through our platform
            in real industrial environments. Always follow applicable safety standards.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">6. Contact</h2>
          <p>
            For questions about these terms, contact contato@ikazin.com.br.
          </p>
        </div>
      </div>
    </main>
  )
}
