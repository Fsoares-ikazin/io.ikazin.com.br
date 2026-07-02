import Link from 'next/link'

export const metadata = {
  title: 'Termos de Serviço — Ikazin.io',
  description: 'Termos de serviço da Ikazin.io.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0e0d] text-gray-100">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/" className="mb-8 inline-flex text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors">
          ← Voltar
        </Link>
        <h1 className="mb-8 text-3xl font-black tracking-tight text-white">Termos de Serviço</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p><strong>Última atualização:</strong> Julho de 2026</p>

          <h2 className="text-lg font-bold text-white mt-8">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou adquirir qualquer conteúdo da Ikazin.io, você concorda com estes Termos de Serviço.
            Caso não concorde, não utilize a plataforma.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">2. Descrição do Serviço</h2>
          <p>
            A Ikazin.io oferece conteúdo de treinamento online em automação industrial e programação de PLC
            (&quot;Builds&quot;). Cada plano garante acesso vitalício aos builds incluídos no respectivo tier.
            Os planos são vendidos como pagamento único — não há cobranças recorrentes ou assinaturas.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">3. Pagamento e Reembolso</h2>
          <p>
            Todos os pagamentos são processados com segurança via Stripe. Os preços são exibidos em
            Reais (R$) conforme indicado no checkout. Devido à natureza digital do nosso conteúdo,
            todas as vendas são finais. Solicitações de reembolso são avaliadas caso a caso em até
            7 dias da compra.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">4. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo da Ikazin.io — incluindo vídeos, arquivos de projeto, PDFs, modelos de
            Gêmeo Digital e configurações TIA Portal — é propriedade intelectual da Ikazin.io.
            A redistribuição, revenda ou compartilhamento público de qualquer material do curso
            é estritamente proibido.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">5. Limitação de Responsabilidade</h2>
          <p>
            O conteúdo de treinamento é fornecido para fins educacionais. A Ikazin.io não se
            responsabiliza por danos decorrentes da aplicação das técnicas aprendidas na plataforma
            em ambientes industriais reais. Siga sempre as normas de segurança aplicáveis.
          </p>

          <h2 className="text-lg font-bold text-white mt-8">6. Contato</h2>
          <p>
            Para dúvidas sobre estes termos, entre em contato pelo e-mail contato@ikazin.com.br.
          </p>
        </div>
      </div>
    </main>
  )
}
