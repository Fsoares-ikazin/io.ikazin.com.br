import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — Ikazin.io',
  description: 'Política de privacidade da Ikazin.io.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0e0d] text-gray-100">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/" className="mb-8 inline-flex text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors">
          ← Voltar
        </Link>
        <h1 className="mb-8 text-3xl font-black tracking-tight text-white">Política de Privacidade</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p><strong>Última atualização:</strong> Julho de 2026</p>

          <h2 className="text-lg font-bold text-white mt-8">1. Dados que Coletamos</h2>
          <p>
            A Ikazin.io coleta apenas as informações necessárias para fornecer nossos serviços:
            nome, e-mail e dados de pagamento (processados com segurança pelo Stripe).
            Não armazenamos números completos de cartão de crédito em nossos servidores.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">2. Como Usamos Seus Dados</h2>
          <p>
            Seus dados são usados exclusivamente para: (a) conceder acesso aos builds adquiridos,
            (b) acompanhar seu progresso de aprendizado, (c) enviar e-mails transacionais da sua conta,
            e (d) cumprir obrigações legais previstas na Lei Geral de Proteção de Dados (LGPD).
          </p>

          <h2 className="text-lg font-bold text-white mt-8">3. Proteção de Dados</h2>
          <p>
            Implementamos medidas de segurança padrão da indústria para proteger seus dados pessoais.
            O processamento de pagamentos é feito integralmente pelo Stripe, provedor certificado
            PCI-DSS Nível 1. Não vendemos, alugamos ou compartilhamos seus dados com terceiros.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">4. Seus Direitos (LGPD)</h2>
          <p>
            Nos termos da Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            acessar, corrigir ou excluir seus dados pessoais; revogar consentimento; e solicitar
            portabilidade dos dados. Entre em contato pelo e-mail contato@ikazin.com.br para
            exercer esses direitos.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">5. Contato</h2>
          <p>
            Para questões relacionadas à privacidade, envie um e-mail para contato@ikazin.com.br.
          </p>
        </div>
      </div>
    </main>
  )
}
