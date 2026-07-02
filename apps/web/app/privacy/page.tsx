import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Ikazin.io',
  description: 'Ikazin.io privacy policy.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0e0d] text-gray-100">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/" className="mb-8 inline-flex text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors">
          ← Voltar
        </Link>
        <h1 className="mb-8 text-3xl font-black tracking-tight text-white">Privacy Policy</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p><strong>Last updated:</strong> July 2026</p>

          <h2 className="text-lg font-bold text-white mt-8">1. Information We Collect</h2>
          <p>
            Ikazin.io collects only the information necessary to provide our services:
            name, email address, and payment information (processed securely by Stripe).
            We do not store complete credit card numbers on our servers.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">2. How We Use Your Information</h2>
          <p>
            Your information is used solely to: (a) provide access to purchased training builds,
            (b) track your learning progress, (c) send transactional emails related to your account,
            and (d) comply with legal obligations under Brazilian law (LGPD).
          </p>

          <h2 className="text-lg font-bold text-white mt-8">3. Data Protection</h2>
          <p>
            We implement industry-standard security measures to protect your personal data.
            Payment processing is handled entirely by Stripe, a PCI-DSS Level 1 certified provider.
            We do not sell, rent, or share your personal data with third parties.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">4. Your Rights (LGPD)</h2>
          <p>
            Under Brazil&apos;s Lei Geral de Proteção de Dados (LGPD), you have the right to:
            access, correct, or delete your personal data; withdraw consent; and request data portability.
            Contact us at contato@ikazin.com.br to exercise these rights.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">5. Contact</h2>
          <p>
            For privacy-related inquiries, email contato@ikazin.com.br.
          </p>
        </div>
      </div>
    </main>
  )
}
