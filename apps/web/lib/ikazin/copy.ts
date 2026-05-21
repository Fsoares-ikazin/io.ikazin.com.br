/**
 * IKAZIN.IO — strings centralizadas.
 *
 * Voz: técnica, direta, "engenheiro pra engenheiro". Sem hype.
 * Adicione strings aqui antes de hardcodar em componente.
 */

export const copy = {
  greetings: {
    morning:   (name: string) => `Bom dia, ${name}.`,
    afternoon: (name: string) => `Boa tarde, ${name}.`,
    evening:   (name: string) => `Boa noite, ${name}.`,
  },

  empty: {
    dashboardNoPlan: {
      title: 'Você ainda não escolheu seu caminho.',
      description:
        'Comece pela trilha Basic — fundamentos de lógica booleana, drives e sensores no TIA Portal.',
      ctaLabel: 'Ver planos',
      ctaHref: '/planos',
    },
    catalogoNoBuilds: (tierLabel: string) => ({
      title: `Sem builds em ${tierLabel}`,
      description:
        'Esse tier é desbloqueado a partir do plano correspondente.',
      ctaLabel: 'Ver planos',
      ctaHref: '/planos',
    }),
    catalogoFilter: (query: string) => ({
      title: `Nenhum build com "${query}"`,
      description: 'Tente outro termo ou limpe os filtros.',
      ctaLabel: 'Limpar filtros',
    }),
    materialsNoFiles: {
      title: 'Materiais ainda não disponíveis',
      description:
        'Os arquivos .exe, projeto TIA Portal e PDF entram no bucket assim que a gravação for publicada.',
    },
    blogEmpty: {
      title: 'Sem artigos publicados ainda',
      description:
        'O blog técnico estreia em breve. Inscreva-se na newsletter para o aviso.',
    },
    horizontalRow: {
      generic: 'Nenhum build disponível nesta seção.',
      noProgress:
        'Você ainda não começou nenhum build. Escolha um para começar.',
    },
  },

  errors: {
    progressSaveFailed: 'Não consegui salvar seu progresso. Tente de novo.',
    materialsDownloadFailed:
      'Falha ao baixar o material. Verifique sua conexão.',
    videoLoadFailed:
      'Não consegui carregar o vídeo. Tente recarregar a página.',
    genericFetch: 'Algo deu errado. Tente recarregar a página.',
  },

  success: {
    buildCompleted: (buildNumber: number) => `Build ${buildNumber} concluído.`,
    materialDownloaded: (label: string) => `${label} baixado.`,
    progressSaved: 'Progresso salvo.',
  },

  cta: {
    continue: 'Continuar',
    start: 'Começar',
    seeAll: 'Ver todos',
    upgrade: 'Fazer upgrade',
    download: 'Baixar',
    retry: 'Tentar de novo',
  },

  tier: {
    locked: (tierLabel: string) =>
      `Este build é do tier ${tierLabel}. Faça upgrade para destravar.`,
    completed: (tierLabel: string) =>
      `Tier ${tierLabel} concluído.`,
  },
} as const

export type Copy = typeof copy
