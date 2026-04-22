export type Lang = 'en' | 'pt'

export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; text: string; variant: 'tip' | 'warning' | 'info' }
  | { type: 'separator' }

export interface BlogPost {
  slug: { en: string; pt: string }
  title: { en: string; pt: string }
  excerpt: { en: string; pt: string }
  tag: string
  readMin: number
  date: string
  featured?: boolean
  content: { en: ContentBlock[]; pt: ContentBlock[] }
}

export const posts: BlogPost[] = [
  // ── 1. Virtual Commissioning vs Real ─────────────────────────────────────────
  {
    slug: {
      en: 'virtual-commissioning-vs-real',
      pt: 'comissionamento-virtual-vs-real',
    },
    title: {
      en: 'Virtual Commissioning vs. Real Commissioning: when to simulate first',
      pt: 'Comissionamento Virtual vs. Real: quando simular antes de ligar',
    },
    excerpt: {
      en: "Commissioning a line without physical hardware is no longer a futuristic concept — it's the standard for reducing risk and cutting time-to-market.",
      pt: 'Comissionar uma linha sem hardware físico não é mais futurismo — é o padrão para reduzir riscos e acelerar o time-to-market.',
    },
    tag: 'vc',
    readMin: 8,
    date: '2025-04-10',
    featured: true,
    content: {
      en: [
        {
          type: 'p',
          text: "In 2018, a major automotive supplier spent 11 days on-site commissioning a welding cell. The PLC logic had never been tested against the real robot kinematics. Three of those 11 days were spent debugging a single sequence that worked perfectly in the engineer's head — and collided with the robot arm on the first power-on. The line went live 9 days late. The penalty clause cost €140,000.",
        },
        {
          type: 'p',
          text: "That story is not exceptional. It's Tuesday in industrial automation. And it's the exact problem Virtual Commissioning was built to eliminate.",
        },
        { type: 'h2', text: 'What is Virtual Commissioning, exactly?' },
        {
          type: 'p',
          text: "Virtual Commissioning (VC) means running your real PLC code against a simulated model of the machine before the physical machine exists — or before you get access to it. The PLC controller (hardware or software) communicates with a Digital Twin via real industrial protocols: S7 communication, OPC-UA, or PROFINET IO-Device simulation.",
        },
        {
          type: 'p',
          text: "The key word is *real PLC code*. Not a simplified script, not a flowchart — the exact same exported TIA Portal project that will go into the S7-1500 on the shop floor. The twin provides sensor feedback, actuator responses, fault injections and cycle timing. The PLC cannot tell the difference.",
        },
        { type: 'h2', text: 'The three types of Digital Twin for commissioning' },
        {
          type: 'ul',
          items: [
            "**Kinematic twin** — CAD-based model with joint movements, collision detection and I/O mapping. Tools: RealVirtual (Unity), MCD (NX), Visual Components. Best for: robot cells, conveyors, multi-axis machines.",
            "**Process twin** — mathematical model of process physics: temperature, pressure, flow, tension. Tools: MATLAB/Simulink, Python OPC-UA server, custom S7 simulation blocks. Best for: PID loops, winders, chemical processes.",
            "**Hybrid twin** — kinematic model with embedded process physics. Most realistic, most expensive to build. Best for: full production line validation before installation.",
          ],
        },
        { type: 'h2', text: 'When virtual commissioning saves the most time' },
        {
          type: 'p',
          text: "VC delivers maximum ROI in three specific scenarios:",
        },
        {
          type: 'ol',
          items: [
            "**Long lead-time machines** — when the machine is being built in parallel with the PLC code. A 6-month mechanical lead time gives you 6 months to develop, test and refine logic that would otherwise be written at the last minute on-site.",
            "**High-risk startup** — food & beverage lines, pharmaceutical production, semiconductor equipment. Any machine where a logic error during startup can damage product, contaminate a batch or break tooling worth more than your commissioning budget.",
            "**Remote or overseas commissioning** — when your best engineers can't be on-site for the full duration. Pre-validated logic means a less experienced local team can execute the physical startup against a known-good program.",
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          text: "Rule of thumb: if the cost of a startup collision, logic error or unplanned downtime exceeds the cost of building the twin, VC pays for itself on the first project.",
        },
        { type: 'h2', text: 'The workflow: from TIA Portal to running twin' },
        {
          type: 'p',
          text: "Here is the minimal workflow to get TIA Portal communicating with a RealVirtual Digital Twin in Unity:",
        },
        {
          type: 'ol',
          items: [
            "Export the PLC DB block that contains your I/O interface (e.g., `HMI_Interface`) as an instance DB.",
            "Install the RealVirtual S7 connector asset in your Unity project.",
            "Configure the S7 connection: IP address of the PLCSIM Advanced instance (or real PLC), DB number, byte offsets for each signal.",
            "Map Unity game objects to DB signals: a cylinder actuator reads `DB1.DBX0.0`, a sensor writes `DB1.DBX1.0`.",
            "Start PLCSIM Advanced, download your TIA Portal project, set it to RUN.",
            "Press Play in Unity. The machine moves.",
          ],
        },
        { type: 'separator' },
        {
          type: 'code',
          lang: 'txt',
          code: `// PLCSIM Advanced config
Instance Name:  S7-1500_VC
IP Address:     192.168.0.1
PLC Type:       1515-2 PN

// RealVirtual S7 connector
IP:             192.168.0.1
Rack:           0 / Slot: 1
DB Number:      1
Poll Interval:  10ms`,
        },
        { type: 'separator' },
        { type: 'h2', text: 'The honest limitations' },
        {
          type: 'p',
          text: "VC does not replace real commissioning entirely. It cannot simulate:",
        },
        {
          type: 'ul',
          items: [
            "Electrical noise, cable faults, and grounding issues",
            "Mechanical wear, backlash, and thermal expansion",
            "Network latency on real PROFINET hardware",
            "Operator behavior and maintenance scenarios",
          ],
        },
        {
          type: 'p',
          text: "What it does eliminate is the debugging of logic errors — which, in the author's experience, accounts for 60–70% of commissioning time on complex machines. The physical commissioning becomes validation, not development.",
        },
        { type: 'h2', text: 'Bottom line' },
        {
          type: 'p',
          text: "Virtual commissioning is not a luxury for engineers with spare time. It is the engineering discipline that separates teams that deliver on schedule from teams that live at the factory for two weeks past deadline. The technology is mature, the tools are accessible, and the cost of not using it shows up in every startup.",
        },
      ],
      pt: [
        {
          type: 'p',
          text: 'Em 2018, um fornecedor automotivo de grande porte passou 11 dias no site comissionando uma célula de solda. A lógica CLP nunca havia sido testada contra a cinemática real do robô. Três desses 11 dias foram gastos depurando uma sequência que funcionava perfeitamente na cabeça do engenheiro — e colidiu com o braço do robô na primeira energização. A linha entrou em operação 9 dias atrasada. A cláusula de penalidade custou €140.000.',
        },
        {
          type: 'p',
          text: 'Essa história não é excepcional. É uma terça-feira na automação industrial. E é exatamente o problema que o Comissionamento Virtual foi construído para eliminar.',
        },
        { type: 'h2', text: 'O que é Comissionamento Virtual, exatamente?' },
        {
          type: 'p',
          text: 'Comissionamento Virtual (CV) significa executar seu código CLP real contra um modelo simulado da máquina antes de ela existir fisicamente — ou antes de você ter acesso a ela. O controlador CLP (hardware ou software) se comunica com um Gêmeo Digital via protocolos industriais reais: comunicação S7, OPC-UA ou simulação de IO-Device PROFINET.',
        },
        {
          type: 'p',
          text: 'A palavra-chave é *código CLP real*. Não um script simplificado, não um fluxograma — o mesmo projeto TIA Portal exportado que irá para o S7-1500 no chão de fábrica. O gêmeo fornece feedback de sensores, respostas de atuadores, injeção de falhas e temporização de ciclos. O CLP não consegue distinguir.',
        },
        { type: 'h2', text: 'Os três tipos de Gêmeo Digital para comissionamento' },
        {
          type: 'ul',
          items: [
            '**Gêmeo cinemático** — modelo baseado em CAD com movimentos de juntas, detecção de colisões e mapeamento de I/O. Ferramentas: RealVirtual (Unity), MCD (NX), Visual Components. Melhor para: células robóticas, esteiras, máquinas multi-eixo.',
            '**Gêmeo de processo** — modelo matemático da física do processo: temperatura, pressão, vazão, tensão. Ferramentas: MATLAB/Simulink, servidor OPC-UA em Python, blocos de simulação S7 customizados. Melhor para: loops PID, enroladores, processos químicos.',
            '**Gêmeo híbrido** — modelo cinemático com física de processo embutida. Mais realista, mais caro de construir. Melhor para: validação completa de linha de produção antes da instalação.',
          ],
        },
        { type: 'h2', text: 'Quando o comissionamento virtual economiza mais tempo' },
        {
          type: 'p',
          text: 'O CV entrega máximo ROI em três cenários específicos:',
        },
        {
          type: 'ol',
          items: [
            '**Máquinas com longo lead time** — quando a máquina está sendo construída em paralelo com o código CLP. Um lead time mecânico de 6 meses dá a você 6 meses para desenvolver, testar e refinar a lógica que, de outra forma, seria escrita na última hora no site.',
            '**Startup de alto risco** — linhas de alimentos e bebidas, produção farmacêutica, equipamentos semicondutores. Qualquer máquina onde um erro de lógica no startup pode danificar produto, contaminar um lote ou quebrar ferramental que vale mais que seu orçamento de comissionamento.',
            '**Comissionamento remoto ou no exterior** — quando seus melhores engenheiros não podem estar no site pela duração completa. A lógica pré-validada significa que uma equipe local menos experiente pode executar o startup físico contra um programa de boa qualidade conhecida.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'Regra prática: se o custo de uma colisão no startup, erro de lógica ou downtime não planejado superar o custo de construir o gêmeo, o CV se paga no primeiro projeto.',
        },
        { type: 'h2', text: 'O workflow: do TIA Portal ao gêmeo em execução' },
        {
          type: 'p',
          text: 'Este é o workflow mínimo para fazer o TIA Portal se comunicar com um Gêmeo Digital RealVirtual no Unity:',
        },
        {
          type: 'ol',
          items: [
            'Exporte o bloco DB do CLP que contém sua interface de I/O (ex: `HMI_Interface`) como DB de instância.',
            'Instale o asset de conector S7 RealVirtual no seu projeto Unity.',
            'Configure a conexão S7: endereço IP da instância PLCSIM Advanced (ou CLP real), número do DB, offsets de byte para cada sinal.',
            'Mapeie objetos Unity para sinais do DB: um atuador cilindro lê `DB1.DBX0.0`, um sensor escreve `DB1.DBX1.0`.',
            'Inicie o PLCSIM Advanced, baixe seu projeto TIA Portal, coloque em RUN.',
            'Pressione Play no Unity. A máquina se move.',
          ],
        },
        { type: 'separator' },
        {
          type: 'code',
          lang: 'txt',
          code: `// Configuração PLCSIM Advanced
Nome da Instância:  S7-1500_VC
Endereço IP:        192.168.0.1
Tipo de CLP:        1515-2 PN

// Conector S7 RealVirtual
IP:                 192.168.0.1
Rack:               0 / Slot: 1
Número do DB:       1
Intervalo de Poll:  10ms`,
        },
        { type: 'separator' },
        { type: 'h2', text: 'As limitações reais' },
        {
          type: 'p',
          text: 'O CV não substitui o comissionamento real completamente. Ele não consegue simular:',
        },
        {
          type: 'ul',
          items: [
            'Ruído elétrico, falhas de cabos e problemas de aterramento',
            'Desgaste mecânico, folga e expansão térmica',
            'Latência de rede em hardware PROFINET real',
            'Comportamento do operador e cenários de manutenção',
          ],
        },
        {
          type: 'p',
          text: 'O que ele elimina são os erros de lógica — que, na experiência do autor, representam 60–70% do tempo de comissionamento em máquinas complexas. O comissionamento físico se torna validação, não desenvolvimento.',
        },
        { type: 'h2', text: 'Conclusão' },
        {
          type: 'p',
          text: 'Comissionamento virtual não é luxo para engenheiros com tempo sobrando. É a disciplina de engenharia que separa equipes que entregam no prazo de equipes que vivem na fábrica duas semanas além do deadline. A tecnologia é madura, as ferramentas são acessíveis, e o custo de não usar aparece em cada startup.',
        },
      ],
    },
  },

  // ── 2. TIA Portal + Digital Twin (RealVirtual) ────────────────────────────────
  {
    slug: {
      en: 'tia-portal-digital-twin-realvirtual',
      pt: 'tia-portal-gemeo-digital-realvirtual',
    },
    title: {
      en: 'How to connect TIA Portal to a Digital Twin with RealVirtual',
      pt: 'Como conectar o TIA Portal a um Gêmeo Digital com RealVirtual',
    },
    excerpt: {
      en: 'Step-by-step: exporting the DB block, configuring the S7 communication library in Unity and mapping signals to virtual actuators.',
      pt: 'Passo a passo: exportar o bloco DB, configurar a biblioteca de comunicação S7 no Unity e mapear sinais para atuadores virtuais.',
    },
    tag: 'plc',
    readMin: 12,
    date: '2025-03-28',
    content: {
      en: [
        {
          type: 'p',
          text: "The most common question after an engineer first sees a Digital Twin demo is: *how do you actually hook the PLC to it?* This guide walks through the complete connection from a TIA Portal project to a moving 3D model in Unity using RealVirtual — the most widely used open-source library for S7-based Digital Twin communication.",
        },
        {
          type: 'callout',
          variant: 'info',
          text: "Prerequisites: TIA Portal V16+, PLCSIM Advanced V3+, Unity 2021 LTS+, RealVirtual asset (available on the Unity Asset Store, free Community edition available).",
        },
        { type: 'h2', text: 'Step 1: Design your I/O interface DB in TIA Portal' },
        {
          type: 'p',
          text: "The cleanest approach is a dedicated Global DB that acts as the interface between the PLC program and the Digital Twin. This DB mirrors the physical I/O but adds virtual signals you only need for simulation.",
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// DB1 — "DigitalTwin_Interface" (Global DB, non-optimized)
// Outputs to Twin (PLC writes, Twin reads)
DB1.DBX 0.0   Conveyor_1_Running      BOOL
DB1.DBX 0.1   Conveyor_2_Running      BOOL
DB1.DBX 0.2   Cylinder_A_Extend       BOOL
DB1.DBX 0.3   Cylinder_A_Retract      BOOL
DB1.DBD 4     Conveyor_1_Speed_Hz     REAL   // 0-50 Hz

// Inputs from Twin (Twin writes, PLC reads)
DB1.DBX 8.0   Sensor_Part_Present     BOOL
DB1.DBX 8.1   Cylinder_A_Extended     BOOL   // end switch feedback
DB1.DBX 8.2   Cylinder_A_Retracted    BOOL
DB1.DBX 8.3   Overload_Trip           BOOL`,
        },
        {
          type: 'callout',
          variant: 'warning',
          text: "The DB MUST be created as non-optimized (uncheck 'Optimized block access' in DB properties). Optimized DBs use internal addressing that the S7 library cannot read by byte offset.",
        },
        { type: 'h2', text: 'Step 2: Set up PLCSIM Advanced' },
        {
          type: 'p',
          text: "Launch PLCSIM Advanced and create a new instance. Set the instance IP to something on your local subnet (e.g., 192.168.0.1). Download your TIA Portal project to this virtual PLC and set it to RUN mode. PLCSIM Advanced will simulate the exact scan cycle behavior of the real CPU.",
        },
        { type: 'h2', text: 'Step 3: Install and configure RealVirtual in Unity' },
        {
          type: 'ol',
          items: [
            "Import the RealVirtual package from the Asset Store into your Unity project.",
            "Add a `S7Connection` component to an empty GameObject in your scene.",
            "Set the IP to match your PLCSIM instance (192.168.0.1), Rack 0, Slot 1.",
            "Set the poll interval to 10ms (100Hz update rate — sufficient for most visual feedback).",
          ],
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// S7Connection settings in Unity Inspector
IP Address:      192.168.0.1
Rack:            0
Slot:            1
Poll Interval:   10  (ms)
Auto Connect:    ✓`,
        },
        { type: 'h2', text: 'Step 4: Map signals to game objects' },
        {
          type: 'p',
          text: "Each actuator and sensor in your scene gets a RealVirtual behavior script. For a pneumatic cylinder:",
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// Cylinder actuator — add "PLCInputOutput" component
Signal Extend:   DB1.DBX0.2   (PLC Output → moves cylinder forward)
Signal Retract:  DB1.DBX0.3   (PLC Output → moves cylinder backward)
Feedback_Ext:    DB1.DBX8.1   (Unity writes TRUE when fully extended)
Feedback_Ret:    DB1.DBX8.2   (Unity writes TRUE when fully retracted)
Travel Time:     0.5 sec`,
        },
        {
          type: 'p',
          text: "For a sensor (e.g., photoelectric part detection), add a `PLCOutput` component to a trigger collider:",
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// Sensor trigger — PLCOutput component
Signal:          DB1.DBX8.0   (Unity writes TRUE when part enters trigger)
Invert:          ✗`,
        },
        { type: 'h2', text: 'Step 5: Press Play — validate the cycle' },
        {
          type: 'p',
          text: "With PLCSIM Advanced in RUN and Unity in Play mode, your PLC program now drives the virtual machine. Watch for:",
        },
        {
          type: 'ul',
          items: [
            "Sequence timing: does the conveyor stop before the cylinder extends?",
            "Feedback logic: does the PLC wait for the cylinder extended feedback before proceeding?",
            "Fault injection: force `Overload_Trip = TRUE` from the Unity inspector and verify the PLC goes to fault state correctly.",
          ],
        },
        { type: 'h2', text: 'Common pitfalls' },
        {
          type: 'ul',
          items: [
            "**Firewall blocking port 102** — the S7 protocol uses TCP port 102. Disable Windows Firewall for the local network adapter connected to PLCSIM, or add an explicit inbound rule.",
            "**DB byte misalignment** — non-optimized DBs pad booleans in whole bytes. `DBX0.0` through `DBX0.7` are the 8 bits of byte 0. `DBX1.0` is byte 1, bit 0. Easy to get wrong when mapping manually.",
            "**Poll interval too fast** — a 1ms poll interval at 200 signals can saturate the S7 connection. Start at 10ms, verify stability, then reduce if needed.",
          ],
        },
        {
          type: 'p',
          text: "Once you have this baseline working, the same architecture scales to hundreds of signals, multi-robot cells and full production line twins. The key is always the interface DB: clean, documented and non-optimized.",
        },
      ],
      pt: [
        {
          type: 'p',
          text: 'A pergunta mais comum depois que um engenheiro vê uma demo de Gêmeo Digital pela primeira vez é: *como você realmente conecta o CLP a ele?* Este guia percorre a conexão completa de um projeto TIA Portal para um modelo 3D em movimento no Unity usando RealVirtual — a biblioteca open-source mais usada para comunicação de Gêmeo Digital baseada em S7.',
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'Pré-requisitos: TIA Portal V16+, PLCSIM Advanced V3+, Unity 2021 LTS+, asset RealVirtual (disponível na Unity Asset Store, edição Community gratuita disponível).',
        },
        { type: 'h2', text: 'Passo 1: Projete seu DB de interface de I/O no TIA Portal' },
        {
          type: 'p',
          text: 'A abordagem mais limpa é um Global DB dedicado que serve como interface entre o programa CLP e o Gêmeo Digital. Este DB espelha o I/O físico e adiciona sinais virtuais que você só precisa para simulação.',
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// DB1 — "DigitalTwin_Interface" (Global DB, não otimizado)
// Saídas para o Gêmeo (CLP escreve, Gêmeo lê)
DB1.DBX 0.0   Esteira_1_Rodando       BOOL
DB1.DBX 0.1   Esteira_2_Rodando       BOOL
DB1.DBX 0.2   Cilindro_A_Avançar      BOOL
DB1.DBX 0.3   Cilindro_A_Recuar       BOOL
DB1.DBD 4     Esteira_1_Velocidade_Hz REAL   // 0-50 Hz

// Entradas do Gêmeo (Gêmeo escreve, CLP lê)
DB1.DBX 8.0   Sensor_Peça_Presente    BOOL
DB1.DBX 8.1   Cilindro_A_Avançado     BOOL   // feedback fim de curso
DB1.DBX 8.2   Cilindro_A_Recuado      BOOL
DB1.DBX 8.3   Sobrecarga_Disparo      BOOL`,
        },
        {
          type: 'callout',
          variant: 'warning',
          text: "O DB DEVE ser criado como não otimizado (desmarque 'Optimized block access' nas propriedades do DB). DBs otimizados usam endereçamento interno que a biblioteca S7 não consegue ler por offset de byte.",
        },
        { type: 'h2', text: 'Passo 2: Configure o PLCSIM Advanced' },
        {
          type: 'p',
          text: 'Inicie o PLCSIM Advanced e crie uma nova instância. Defina o IP da instância para algo na sua sub-rede local (ex: 192.168.0.1). Faça o download do seu projeto TIA Portal para este CLP virtual e coloque em modo RUN. O PLCSIM Advanced simulará o comportamento exato do ciclo de scan da CPU real.',
        },
        { type: 'h2', text: 'Passo 3: Instale e configure o RealVirtual no Unity' },
        {
          type: 'ol',
          items: [
            'Importe o pacote RealVirtual da Asset Store no seu projeto Unity.',
            'Adicione um componente `S7Connection` a um GameObject vazio na sua cena.',
            'Defina o IP para corresponder à sua instância PLCSIM (192.168.0.1), Rack 0, Slot 1.',
            'Defina o intervalo de poll para 10ms (taxa de atualização de 100Hz — suficiente para a maioria dos feedbacks visuais).',
          ],
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// Configurações do S7Connection no Unity Inspector
Endereço IP:     192.168.0.1
Rack:            0
Slot:            1
Intervalo Poll:  10  (ms)
Auto Connect:    ✓`,
        },
        { type: 'h2', text: 'Passo 4: Mapeie sinais para game objects' },
        {
          type: 'p',
          text: 'Cada atuador e sensor na sua cena recebe um script de comportamento RealVirtual. Para um cilindro pneumático:',
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// Atuador cilindro — adicione componente "PLCInputOutput"
Sinal Avançar:   DB1.DBX0.2   (Saída CLP → move cilindro para frente)
Sinal Recuar:    DB1.DBX0.3   (Saída CLP → move cilindro para trás)
Feedback_Av:     DB1.DBX8.1   (Unity escreve TRUE quando totalmente avançado)
Feedback_Rec:    DB1.DBX8.2   (Unity escreve TRUE quando totalmente recuado)
Tempo de Curso:  0.5 s`,
        },
        { type: 'h2', text: 'Passo 5: Pressione Play — valide o ciclo' },
        {
          type: 'p',
          text: 'Com o PLCSIM Advanced em RUN e o Unity em modo Play, seu programa CLP agora controla a máquina virtual. Observe:',
        },
        {
          type: 'ul',
          items: [
            'Temporização da sequência: a esteira para antes do cilindro avançar?',
            'Lógica de feedback: o CLP aguarda o feedback de cilindro avançado antes de prosseguir?',
            'Injeção de falha: force `Sobrecarga_Disparo = TRUE` no inspetor Unity e verifique se o CLP vai para estado de falha corretamente.',
          ],
        },
        { type: 'h2', text: 'Armadilhas comuns' },
        {
          type: 'ul',
          items: [
            '**Firewall bloqueando a porta 102** — o protocolo S7 usa a porta TCP 102. Desabilite o Windows Firewall para o adaptador de rede local conectado ao PLCSIM, ou adicione uma regra explícita de entrada.',
            '**Desalinhamento de bytes no DB** — DBs não otimizados preenchem booleanos em bytes inteiros. `DBX0.0` a `DBX0.7` são os 8 bits do byte 0. `DBX1.0` é o byte 1, bit 0. Fácil de errar ao mapear manualmente.',
            '**Intervalo de poll muito rápido** — um intervalo de 1ms com 200 sinais pode saturar a conexão S7. Comece com 10ms, verifique a estabilidade e reduza se necessário.',
          ],
        },
        {
          type: 'p',
          text: 'Uma vez que você tenha essa base funcionando, a mesma arquitetura escala para centenas de sinais, células multi-robô e gêmeos digitais de linhas de produção completas. A chave é sempre o DB de interface: limpo, documentado e não otimizado.',
        },
      ],
    },
  },

  // ── 3. SINAMICS S120 ──────────────────────────────────────────────────────────
  {
    slug: {
      en: 'sinamics-s120-speed-position',
      pt: 'sinamics-s120-velocidade-posicao',
    },
    title: {
      en: 'SINAMICS S120: speed control and positioning with SINA_SPEED and SINA_POS',
      pt: 'SINAMICS S120: controle de velocidade e posicionamento com SINA_SPEED e SINA_POS',
    },
    excerpt: {
      en: 'Drive parameterization, reference ramp and position request via PLC. Practical guide for integrators migrating from simple drives to S120 booksize format.',
      pt: 'Parametrização do drive, rampa de referência e requisição de posição via CLP. Guia prático para integradores que migram para o formato booksize S120.',
    },
    tag: 'drives',
    readMin: 10,
    date: '2025-03-14',
    content: {
      en: [
        {
          type: 'p',
          text: "The G120 is intuitive. You parameterize it with STARTER, drop a SINA_SPEED block into your ladder, and 20 minutes later the motor is running. The S120 will humiliate you with that same approach. It is a different beast: multi-axis, vector-oriented, with a commissioning philosophy that rewards engineers who understand the architecture before touching a parameter.",
        },
        {
          type: 'p',
          text: "This guide covers the minimal viable path from unboxed S120 to a working speed-controlled and positioned axis via TIA Portal — without the detours that cost engineers days of frustration.",
        },
        { type: 'h2', text: 'S120 architecture fundamentals' },
        {
          type: 'p',
          text: "The S120 is not a standalone drive. It is a drive system. Key components:",
        },
        {
          type: 'ul',
          items: [
            "**Control Unit (CU320-2)** — the CPU of the drive system. Runs the closed-loop control for all connected motor modules. Connects to TIA Portal PLC via PROFINET.",
            "**Line Module** — rectifies AC mains to DC bus. Active Line Modules can feed energy back to the grid (regenerative). Basic Line Modules are simpler and cheaper.",
            "**Motor Modules (booksize/blocksize)** — each one drives one axis. They share the DC bus from the Line Module.",
            "**DRIVE-CLiQ** — Siemens proprietary digital communication bus between CU, motor modules and encoders. Enables automatic topology detection.",
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          text: "DRIVE-CLiQ auto-detection: when you power up the system and run the commissioning wizard in STARTER/Startdrive, the CU automatically discovers all connected modules and encoder types. Never manually configure topology if you can avoid it.",
        },
        { type: 'h2', text: 'Commissioning with Startdrive (TIA Portal add-on)' },
        {
          type: 'ol',
          items: [
            "Install Startdrive V17+ as a TIA Portal add-on.",
            "Add the CU320-2 PN to your TIA project and configure the PROFINET interface.",
            "Run the First Commissioning Wizard: it reads the DRIVE-CLiQ topology and auto-configures motor modules.",
            "Enter motor nameplate data (voltage, current, frequency, cos φ). For Siemens motors, use the order number to auto-import from the motor database.",
            "Run motor identification (stand-still measurement) to measure actual motor parameters. This is mandatory for good vector control.",
            "Configure encoder: absolute (EnDat, HIPERFACE) or incremental. Set the pulse count per revolution.",
          ],
        },
        { type: 'h2', text: 'SINA_SPEED: speed control from PLC' },
        {
          type: 'p',
          text: "SINA_SPEED is the standard function block for speed-controlled S120 axes from a S7-1500. It wraps the PROFINET telegram 1 (or 352) interface into a usable block.",
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// SINA_SPEED block (FB284) — call in OB1 or motion OB
SINA_SPEED(
    EnableAxis      := TRUE,          // axis enable
    AckError        := Reset_Button,  // fault acknowledge
    SpeedSp         := 1500.0,        // speed setpoint in RPM
    RefSpeed        := 3000.0,        // motor rated speed (nameplate)
    ConfigEPos      := 0,             // 0 = speed mode
    HWIDSTW         := "Drive_1_STW", // HW identifier — control word
    HWIDZSW         := "Drive_1_ZSW", // HW identifier — status word
    ActVelocity     => ActSpeed_RPM,  // actual speed feedback
    Fault           => Drive_Fault,   // fault flag
    Warning         => Drive_Warning
);`,
        },
        { type: 'h2', text: 'SINA_POS: absolute and relative positioning' },
        {
          type: 'p',
          text: "SINA_POS (FB284 with `ConfigEPos = 1`) switches the axis to EPos mode — the built-in positioning controller inside the CU320. The PLC sends a position setpoint; the S120 handles the trajectory generation internally.",
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// SINA_POS block — absolute positioning
SINA_POS(
    EnableAxis      := TRUE,
    AckError        := Reset_Button,
    ExecuteMode     := 6,          // mode 6 = absolute positioning MDI
    Position        := 500.0,      // target position in mm (or degrees)
    Velocity        := 200.0,      // velocity in mm/s
    OverV           := 100,        // velocity override %
    OverAcc         := 100,        // acceleration override %
    OverDec         := 100,        // deceleration override %
    MdiTrip         := Start_Pos,  // rising edge triggers move
    ConfigEPos      := 1,
    HWIDSTW         := "Drive_1_STW",
    HWIDZSW         := "Drive_1_ZSW",
    ActPosition     => ActPos_mm,
    TargetReached   => PosReached,
    Fault           => Drive_Fault
);`,
        },
        { type: 'h2', text: 'Homing before the first move' },
        {
          type: 'p',
          text: "Absolute positioning only makes sense after homing. Without homing, the axis has no reference zero. The S120 supports several homing modes:",
        },
        {
          type: 'ul',
          items: [
            "Mode 0: set current position as reference (useful with absolute encoders)",
            "Mode 3: travel to fixed stop (current-based detection) and set zero there",
            "Mode 7: travel to external homing switch, then index pulse",
          ],
        },
        {
          type: 'p',
          text: "In SINA_POS, set `ExecuteMode := 3` (or 4 for direction) and pulse `MdiTrip` to trigger homing. Wait for `TargetReached` to confirm completion before switching to positioning mode.",
        },
        { type: 'h2', text: 'The three mistakes that consume commissioning time' },
        {
          type: 'ul',
          items: [
            "**Wrong RefSpeed** — `SpeedSp` in SINA_SPEED is in RPM but is normalized to `RefSpeed`. If `RefSpeed` is 1500 but the motor nameplate says 3000, your actual speed will be double what you set. Always match `RefSpeed` to the rated motor speed.",
            "**Missing gearbox factor** — if there is a gearbox between motor and load, configure the gear ratio in STARTER/Startdrive. Position feedback from the encoder already accounts for the gear ratio after this, so SINA_POS position units become the *load* position, not the motor position.",
            "**Topology mismatch after module swap** — if you replace a motor module and the DRIVE-CLiQ topology changes, you must run topology detection again. A mismatch causes Fault 7900 at startup and the system refuses to enable.",
          ],
        },
      ],
      pt: [
        {
          type: 'p',
          text: 'O G120 é intuitivo. Você parametriza com o STARTER, coloca um bloco SINA_SPEED no seu ladder, e 20 minutos depois o motor está rodando. O S120 vai te humilhar com essa mesma abordagem. É uma fera diferente: multi-eixo, orientado a vetor, com uma filosofia de comissionamento que recompensa engenheiros que entendem a arquitetura antes de tocar em um parâmetro.',
        },
        {
          type: 'p',
          text: 'Este guia cobre o caminho mínimo viável de um S120 desembalado para um eixo com controle de velocidade e posicionamento via TIA Portal — sem os desvios que custam dias de frustração para engenheiros.',
        },
        { type: 'h2', text: 'Fundamentos da arquitetura S120' },
        {
          type: 'p',
          text: 'O S120 não é um drive standalone. É um sistema de acionamento. Componentes principais:',
        },
        {
          type: 'ul',
          items: [
            '**Control Unit (CU320-2)** — a CPU do sistema de acionamento. Executa o controle de malha fechada para todos os módulos de motor conectados. Conecta ao CLP TIA Portal via PROFINET.',
            '**Line Module** — retifica a rede CA para barramento CC. Active Line Modules podem devolver energia à rede (regenerativo). Basic Line Modules são mais simples e baratos.',
            '**Motor Modules (booksize/blocksize)** — cada um aciona um eixo. Compartilham o barramento CC do Line Module.',
            '**DRIVE-CLiQ** — barramento de comunicação digital proprietário Siemens entre CU, módulos de motor e encoders. Permite detecção automática de topologia.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          text: 'Detecção automática DRIVE-CLiQ: ao energizar o sistema e executar o assistente de comissionamento no STARTER/Startdrive, a CU descobre automaticamente todos os módulos conectados e tipos de encoder. Nunca configure a topologia manualmente se puder evitar.',
        },
        { type: 'h2', text: 'Comissionamento com Startdrive (add-on TIA Portal)' },
        {
          type: 'ol',
          items: [
            'Instale o Startdrive V17+ como add-on do TIA Portal.',
            'Adicione a CU320-2 PN ao seu projeto TIA e configure a interface PROFINET.',
            'Execute o Assistente de Primeiro Comissionamento: ele lê a topologia DRIVE-CLiQ e configura automaticamente os módulos de motor.',
            'Insira os dados da plaqueta do motor (tensão, corrente, frequência, cos φ). Para motores Siemens, use o número de pedido para importar automaticamente do banco de dados de motores.',
            'Execute a identificação do motor (medição em parada) para medir os parâmetros reais do motor. É obrigatório para um bom controle vetorial.',
            'Configure o encoder: absoluto (EnDat, HIPERFACE) ou incremental. Defina a contagem de pulsos por rotação.',
          ],
        },
        { type: 'h2', text: 'SINA_SPEED: controle de velocidade via CLP' },
        {
          type: 'p',
          text: 'SINA_SPEED é o bloco de função padrão para eixos S120 controlados por velocidade a partir de um S7-1500. Ele encapsula a interface do telegrama PROFINET 1 (ou 352) em um bloco utilizável.',
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// Bloco SINA_SPEED (FB284) — chamar no OB1 ou OB de motion
SINA_SPEED(
    EnableAxis      := TRUE,          // habilitar eixo
    AckError        := Botao_Reset,   // reconhecer falha
    SpeedSp         := 1500.0,        // setpoint de velocidade em RPM
    RefSpeed        := 3000.0,        // velocidade nominal do motor (plaqueta)
    ConfigEPos      := 0,             // 0 = modo velocidade
    HWIDSTW         := "Drive_1_STW", // identificador HW — palavra de controle
    HWIDZSW         := "Drive_1_ZSW", // identificador HW — palavra de status
    ActVelocity     => VelAtual_RPM,  // feedback de velocidade real
    Fault           => Drive_Falha,   // flag de falha
    Warning         => Drive_Aviso
);`,
        },
        { type: 'h2', text: 'SINA_POS: posicionamento absoluto e relativo' },
        {
          type: 'p',
          text: 'SINA_POS (FB284 com `ConfigEPos = 1`) troca o eixo para o modo EPos — o controlador de posicionamento embutido dentro da CU320. O CLP envia um setpoint de posição; o S120 trata a geração de trajetória internamente.',
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// Bloco SINA_POS — posicionamento absoluto
SINA_POS(
    EnableAxis      := TRUE,
    AckError        := Botao_Reset,
    ExecuteMode     := 6,          // modo 6 = posicionamento absoluto MDI
    Position        := 500.0,      // posição alvo em mm (ou graus)
    Velocity        := 200.0,      // velocidade em mm/s
    OverV           := 100,        // override de velocidade %
    OverAcc         := 100,        // override de aceleração %
    OverDec         := 100,        // override de desaceleração %
    MdiTrip         := Iniciar_Pos,// borda de subida aciona o movimento
    ConfigEPos      := 1,
    HWIDSTW         := "Drive_1_STW",
    HWIDZSW         := "Drive_1_ZSW",
    ActPosition     => PosAtual_mm,
    TargetReached   => PosAlcancada,
    Fault           => Drive_Falha
);`,
        },
        { type: 'h2', text: 'Homing antes do primeiro movimento' },
        {
          type: 'p',
          text: 'O posicionamento absoluto só faz sentido após o homing. Sem homing, o eixo não tem referência zero. O S120 suporta vários modos de homing:',
        },
        {
          type: 'ul',
          items: [
            'Modo 0: define a posição atual como referência (útil com encoders absolutos)',
            'Modo 3: vai até batente fixo (detecção por corrente) e define zero lá',
            'Modo 7: vai até chave de homing externa, depois pulso de index',
          ],
        },
        { type: 'h2', text: 'Os três erros que consomem tempo de comissionamento' },
        {
          type: 'ul',
          items: [
            '**RefSpeed errada** — `SpeedSp` no SINA_SPEED é em RPM mas é normalizado para `RefSpeed`. Se `RefSpeed` é 1500 mas a plaqueta do motor diz 3000, sua velocidade real será o dobro do que você definiu. Sempre corresponda `RefSpeed` à velocidade nominal do motor.',
            '**Fator de redutora faltando** — se há uma redutora entre o motor e a carga, configure a relação de transmissão no STARTER/Startdrive. O feedback de posição do encoder já contabiliza a relação após isso, então as unidades de posição do SINA_POS se tornam a posição da *carga*, não do motor.',
            '**Incompatibilidade de topologia após troca de módulo** — se você substituir um módulo de motor e a topologia DRIVE-CLiQ mudar, deve executar a detecção de topologia novamente. Uma incompatibilidade causa Falha 7900 na inicialização e o sistema recusa a habilitar.',
          ],
        },
      ],
    },
  },

  // ── 4. Digital Twin ROI ───────────────────────────────────────────────────────
  {
    slug: {
      en: 'digital-twin-roi',
      pt: 'gemeo-digital-roi',
    },
    title: {
      en: 'The ROI of Digital Twin: numbers behind the decision',
      pt: 'O ROI do Gêmeo Digital: os números por trás da decisão',
    },
    excerpt: {
      en: 'Commissioning time reduction, elimination of startup damage and early validation of logic — how to present the business case for a Digital Twin to management.',
      pt: 'Redução do tempo de comissionamento, eliminação de danos no startup e validação antecipada de lógica — como apresentar o business case de um Gêmeo Digital para a gestão.',
    },
    tag: 'dt',
    readMin: 6,
    date: '2025-02-27',
    content: {
      en: [
        {
          type: 'p',
          text: "Every senior engineer intuitively understands the value of testing logic before it runs on real hardware. The challenge is never convincing the engineering team — it's convincing the project manager who controls the budget and sees 'build a Unity simulation' as a nice-to-have, not a line item.",
        },
        {
          type: 'p',
          text: "This article gives you the numbers. Not industry-generic statistics, but a concrete framework you can adapt to your own project to calculate expected ROI before committing the effort.",
        },
        { type: 'h2', text: 'The three cost drivers Virtual Commissioning eliminates' },
        { type: 'h3', text: '1. On-site debug time' },
        {
          type: 'p',
          text: "In a typical automation project, 40–60% of commissioning time is spent debugging logic that was never tested dynamically. The engineer wrote the sequence, reviewed it mentally, maybe walked through it in the editor — but never ran it against a moving machine before the real startup.",
        },
        {
          type: 'p',
          text: "On-site engineer cost (travel + daily rate + overtime): €800–1,500/day. A 10-day machine with 5 debug days that could have been found in simulation: €4,000–7,500 saved per project. On 6 projects/year: €24,000–45,000.",
        },
        { type: 'h3', text: '2. Startup damage and collisions' },
        {
          type: 'p',
          text: "First power-on collisions on robot cells and multi-axis machines are more common than the industry publicly admits. A gripper collision can damage tooling (€2k–15k), a workpiece (€500–5k), or — worst case — a robot arm (€20k–80k repair + downtime).",
        },
        {
          type: 'p',
          text: "Virtual commissioning with collision detection in the Digital Twin catches these scenarios 100% of the time before the real startup. One avoided robot collision pays for a year of Digital Twin investment.",
        },
        { type: 'h3', text: '3. Late-stage design changes' },
        {
          type: 'p',
          text: "The cost of a design change multiplies by 10x at each stage of the project lifecycle. A sequence change caught during offline simulation (before code is written): 2h. The same change caught on-site: 8–16h (understanding why, reverting tested code, re-testing, re-documenting).",
        },
        {
          type: 'callout',
          variant: 'info',
          text: "Boehm's Law: the cost to fix a defect found during design is 1x. Found during testing: 10x. Found during operation: 100x. Virtual commissioning is structured 'testing' for PLC logic.",
        },
        { type: 'h2', text: 'A simple ROI model' },
        {
          type: 'p',
          text: "For a mid-complexity machine (robot cell, 3–5 axes, 150 I/O points):",
        },
        {
          type: 'ul',
          items: [
            "**Digital Twin build effort**: 60–120h for a kinematic twin with full I/O mapping",
            "**Commissioning time saved**: 4–8 days on-site (based on 40% debug reduction)",
            "**On-site cost**: €1,200/day average (engineer + travel)",
            "**Net saving per project**: (6 days × €1,200) − (90h × €80/h) = €7,200 − €7,200 = break even on first project",
            "**From project 2 onwards**: the twin template is reused. Build effort drops to 20–30h. Net saving: €7,200 − €2,400 = €4,800 per project.",
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          text: "The 'expensive' part of Digital Twin is the first one. Once your team has a template library of standard machines (conveyors, cylinders, drives, sensors), each new twin takes 30–50% of the original effort.",
        },
        { type: 'h2', text: 'How to present this to management' },
        {
          type: 'p',
          text: "Three slides. Slide 1: the baseline cost (last 3 projects, on-site debug days, any startup damage). Slide 2: the VC model (twin build effort vs. days saved, break-even point). Slide 3: the scaling story (template library, team capability, competitive advantage in bidding).",
        },
        {
          type: 'p',
          text: "The engineering argument is always the wrong one. The business argument — 'we save €5k per project and eliminate the risk of a €30k startup collision' — closes the budget.",
        },
      ],
      pt: [
        {
          type: 'p',
          text: "Todo engenheiro sênior entende intuitivamente o valor de testar a lógica antes de executá-la no hardware real. O desafio nunca é convencer a equipe de engenharia — é convencer o gerente de projeto que controla o orçamento e vê 'construir uma simulação Unity' como algo legal de ter, não como uma linha no orçamento.",
        },
        {
          type: 'p',
          text: "Este artigo fornece os números. Não estatísticas genéricas do setor, mas um framework concreto que você pode adaptar ao seu próprio projeto para calcular o ROI esperado antes de comprometer o esforço.",
        },
        { type: 'h2', text: 'Os três geradores de custo que o Comissionamento Virtual elimina' },
        { type: 'h3', text: '1. Tempo de depuração no site' },
        {
          type: 'p',
          text: "Em um projeto de automação típico, 40–60% do tempo de comissionamento é gasto depurando lógica que nunca foi testada dinamicamente. O engenheiro escreveu a sequência, revisou mentalmente, talvez tenha percorrido no editor — mas nunca executou contra uma máquina em movimento antes do startup real.",
        },
        {
          type: 'p',
          text: "Custo do engenheiro no site (viagem + diária + hora extra): R$2.000–4.000/dia. Uma máquina de 10 dias com 5 dias de depuração que poderiam ter sido encontrados em simulação: R$10.000–20.000 economizados por projeto. Em 6 projetos/ano: R$60.000–120.000.",
        },
        { type: 'h3', text: '2. Danos no startup e colisões' },
        {
          type: 'p',
          text: "Colisões no primeiro energizamento em células robóticas e máquinas multi-eixo são mais comuns do que o setor admite publicamente. Uma colisão de garra pode danificar ferramental (R$10k–80k), uma peça de trabalho (R$2k–25k), ou — no pior caso — um braço robótico (R$100k–400k em reparo + downtime).",
        },
        {
          type: 'p',
          text: "O comissionamento virtual com detecção de colisão no Gêmeo Digital captura esses cenários 100% das vezes antes do startup real. Uma colisão robótica evitada paga um ano de investimento em Gêmeo Digital.",
        },
        { type: 'h3', text: '3. Mudanças de projeto em fase tardia' },
        {
          type: 'p',
          text: "O custo de uma mudança de projeto se multiplica por 10x em cada estágio do ciclo de vida do projeto. Uma mudança de sequência identificada durante a simulação offline (antes do código ser escrito): 2h. A mesma mudança identificada no site: 8–16h (entender o porquê, reverter código testado, re-testar, re-documentar).",
        },
        {
          type: 'callout',
          variant: 'info',
          text: "Lei de Boehm: o custo para corrigir um defeito encontrado durante o design é 1x. Encontrado durante os testes: 10x. Encontrado durante a operação: 100x. O comissionamento virtual é 'teste' estruturado para lógica CLP.",
        },
        { type: 'h2', text: 'Um modelo simples de ROI' },
        {
          type: 'p',
          text: "Para uma máquina de complexidade média (célula robótica, 3–5 eixos, 150 pontos de I/O):",
        },
        {
          type: 'ul',
          items: [
            "**Esforço de construção do Gêmeo Digital**: 60–120h para um gêmeo cinemático com mapeamento completo de I/O",
            "**Tempo de comissionamento economizado**: 4–8 dias no site (baseado em redução de 40% de depuração)",
            "**Custo no site**: R$3.000/dia em média (engenheiro + viagem)",
            "**Economia líquida por projeto**: (6 dias × R$3.000) − (90h × R$200/h) = R$18.000 − R$18.000 = empate no primeiro projeto",
            "**Do projeto 2 em diante**: o template do gêmeo é reutilizado. O esforço de construção cai para 20–30h. Economia líquida: R$18.000 − R$6.000 = R$12.000 por projeto.",
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          text: "A parte 'cara' do Gêmeo Digital é o primeiro. Uma vez que sua equipe tenha uma biblioteca de templates de máquinas padrão (esteiras, cilindros, drives, sensores), cada novo gêmeo leva 30–50% do esforço original.",
        },
        { type: 'h2', text: 'Como apresentar para a gestão' },
        {
          type: 'p',
          text: "Três slides. Slide 1: o custo da linha de base (últimos 3 projetos, dias de depuração no site, qualquer dano no startup). Slide 2: o modelo de CV (esforço de construção do gêmeo vs. dias economizados, ponto de equilíbrio). Slide 3: a história de escala (biblioteca de templates, capacidade da equipe, vantagem competitiva nas propostas).",
        },
        {
          type: 'p',
          text: "O argumento de engenharia é sempre o errado. O argumento de negócio — 'economizamos R$25k por projeto e eliminamos o risco de uma colisão de R$150k no startup' — fecha o orçamento.",
        },
      ],
    },
  },

  // ── 5. PLC FSM ────────────────────────────────────────────────────────────────
  {
    slug: {
      en: 'plc-fsm-fundamentals',
      pt: 'clp-maquina-de-estados',
    },
    title: {
      en: 'Finite State Machines in the PLC: the foundation everything else rests on',
      pt: 'Máquinas de estado no CLP: a base sobre a qual tudo se apoia',
    },
    excerpt: {
      en: 'FSM is the conceptual backbone of almost every industrial sequence. See how to implement it cleanly in Ladder and SCL.',
      pt: 'A MEF é a espinha dorsal conceitual de quase toda sequência industrial. Veja como implementar de forma limpa em Ladder e SCL.',
    },
    tag: 'plc',
    readMin: 9,
    date: '2025-02-10',
    content: {
      en: [
        {
          type: 'p',
          text: "Every time you write a sequence in a PLC — a press cycle, a conveyor start/stop, a dosing routine — you are implementing a Finite State Machine, whether you call it that or not. The difference between engineers who write maintainable logic and those who don't is whether they make the FSM explicit.",
        },
        { type: 'h2', text: 'What is an FSM?' },
        {
          type: 'p',
          text: "A Finite State Machine is a model with: a finite set of states, one active state at any time, and defined transitions between states triggered by conditions. In a PLC context: states are operating modes (IDLE, RUNNING, FAULT, HOMING), and transitions are logic conditions (start button pressed, fault detected, cycle complete).",
        },
        { type: 'h2', text: 'Why explicit FSM beats inline logic' },
        {
          type: 'ul',
          items: [
            "**Debugging**: if the machine is stuck, you read the current state variable and instantly know where it is in the sequence. No need to trace through 50 rungs of interlocked logic.",
            "**Modification**: adding a new step or modifying a transition does not require touching unrelated rungs. Each state's actions and each transition's conditions are isolated.",
            "**Documentation**: the state diagram IS the documentation. An FSM in code reads like a specification.",
          ],
        },
        { type: 'h2', text: 'Implementation in Ladder (STEP7-style)' },
        {
          type: 'code',
          lang: 'txt',
          code: `// Using INT variable: State (0=IDLE, 1=RUNNING, 2=FAULT, 3=HOMING)
// Rung 1 — IDLE → RUNNING transition
[State == 0] AND [StartButton] AND NOT [EmergencyStop]
  ─(S State_Running)─   // set RUNNING flag
  ─(R State_Idle)─      // clear IDLE flag
  // → Set State := 1

// Rung 2 — RUNNING actions (active every scan while RUNNING)
[State == 1]
  ─( )─ Conveyor_Run
  ─( )─ Dosing_Enable

// Rung 3 — RUNNING → FAULT transition
[State == 1] AND [OverloadTrip OR EmergencyStop]
  ─(MOVE 2 → State)─    // State := 2 (FAULT)

// Rung 4 — FAULT actions
[State == 2]
  ─( )─ Fault_Lamp
  ─( )─ Conveyor_Stop`,
        },
        { type: 'h2', text: 'Implementation in SCL (cleaner)' },
        {
          type: 'code',
          lang: 'txt',
          code: `// SCL CASE statement — the natural FSM implementation
CASE State OF
  0: // IDLE
    Conveyor_Run := FALSE;
    IF StartButton AND NOT EmergencyStop THEN
      State := 1; // → RUNNING
    END_IF;

  1: // RUNNING
    Conveyor_Run := TRUE;
    Dosing_Enable := TRUE;
    IF OverloadTrip OR EmergencyStop THEN
      State := 2; // → FAULT
    ELSIF CycleComplete THEN
      State := 0; // → IDLE
    END_IF;

  2: // FAULT
    Conveyor_Run := FALSE;
    Fault_Lamp := TRUE;
    IF AcknowledgeButton AND NOT OverloadTrip THEN
      State := 0; // → IDLE
    END_IF;

  ELSE:
    State := 0; // safety: unknown state → IDLE
END_CASE;`,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: "The ELSE clause is not optional. If a bug or memory corruption sets State to an undefined value, the ELSE clause recovers safely instead of locking the machine in an undefined behavior.",
        },
        { type: 'h2', text: 'Nested FSMs for multi-level sequences' },
        {
          type: 'p',
          text: "Complex machines require nested FSMs: a top-level FSM for machine modes (MANUAL, AUTO, HOMING, FAULT) and sub-FSMs for each automated sequence (LOADING, PROCESSING, UNLOADING). The top-level FSM controls which sub-FSM is active.",
        },
        {
          type: 'p',
          text: "The rule: never let a sub-FSM execute when the top-level FSM is not in AUTO mode. A single guard at the top of each sub-FSM rung enforces this.",
        },
        { type: 'h2', text: 'State variable naming convention' },
        {
          type: 'p',
          text: "Use constants (in TIA Portal: VAR_GLOBAL CONSTANT, or a UDT with named values) instead of magic numbers. `State := STATE_RUNNING` is self-documenting. `State := 1` requires a comment — and comments go stale.",
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// Declare in DB or Global DB
STATE_IDLE    : INT := 0;
STATE_RUNNING : INT := 1;
STATE_FAULT   : INT := 2;
STATE_HOMING  : INT := 3;

// Usage
IF StartButton THEN
  State := STATE_RUNNING;  // reads like English
END_IF;`,
        },
      ],
      pt: [
        {
          type: 'p',
          text: "Toda vez que você escreve uma sequência em um CLP — um ciclo de prensa, um start/stop de esteira, uma rotina de dosagem — você está implementando uma Máquina de Estados Finitos, quer você chame assim ou não. A diferença entre engenheiros que escrevem lógica manutenível e os que não escrevem é se eles tornam a MEF explícita.",
        },
        { type: 'h2', text: 'O que é uma MEF?' },
        {
          type: 'p',
          text: "Uma Máquina de Estados Finitos é um modelo com: um conjunto finito de estados, um estado ativo por vez, e transições definidas entre estados disparadas por condições. No contexto de CLP: estados são modos de operação (IDLE, RODANDO, FALHA, HOMING), e transições são condições de lógica (botão start pressionado, falha detectada, ciclo completo).",
        },
        { type: 'h2', text: 'Por que MEF explícita supera lógica inline' },
        {
          type: 'ul',
          items: [
            "**Depuração**: se a máquina está travada, você lê a variável de estado atual e instantaneamente sabe onde está na sequência. Não é necessário rastrear 50 rungs de lógica interligada.",
            "**Modificação**: adicionar um novo passo ou modificar uma transição não exige tocar em rungs não relacionados. As ações de cada estado e as condições de cada transição são isoladas.",
            "**Documentação**: o diagrama de estados É a documentação. Uma MEF no código se lê como uma especificação.",
          ],
        },
        { type: 'h2', text: 'Implementação em SCL (mais limpa)' },
        {
          type: 'code',
          lang: 'txt',
          code: `// Instrução CASE em SCL — a implementação natural de MEF
CASE Estado OF
  0: // IDLE
    Esteira_Rodando := FALSE;
    IF BotaoStart AND NOT EmergenciaStop THEN
      Estado := 1; // → RODANDO
    END_IF;

  1: // RODANDO
    Esteira_Rodando := TRUE;
    Dosagem_Habilitada := TRUE;
    IF Sobrecarga OR EmergenciaStop THEN
      Estado := 2; // → FALHA
    ELSIF CicloCompleto THEN
      Estado := 0; // → IDLE
    END_IF;

  2: // FALHA
    Esteira_Rodando := FALSE;
    Lampada_Falha := TRUE;
    IF BotaoAcknowledge AND NOT Sobrecarga THEN
      Estado := 0; // → IDLE
    END_IF;

  ELSE:
    Estado := 0; // segurança: estado desconhecido → IDLE
END_CASE;`,
        },
        {
          type: 'callout',
          variant: 'tip',
          text: "A cláusula ELSE não é opcional. Se um bug ou corrupção de memória definir Estado para um valor indefinido, a cláusula ELSE recupera com segurança em vez de travar a máquina em comportamento indefinido.",
        },
        { type: 'h2', text: 'MEFs aninhadas para sequências multi-nível' },
        {
          type: 'p',
          text: "Máquinas complexas exigem MEFs aninhadas: uma MEF de nível superior para modos da máquina (MANUAL, AUTO, HOMING, FALHA) e sub-MEFs para cada sequência automatizada (CARREGAMENTO, PROCESSAMENTO, DESCARREGAMENTO). A MEF de nível superior controla qual sub-MEF está ativa.",
        },
        { type: 'h2', text: 'Convenção de nomenclatura de variáveis de estado' },
        {
          type: 'p',
          text: "Use constantes (no TIA Portal: VAR_GLOBAL CONSTANT, ou um UDT com valores nomeados) em vez de números mágicos. `Estado := ESTADO_RODANDO` é autodocumentável. `Estado := 1` requer um comentário — e comentários ficam desatualizados.",
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// Declarar em DB ou DB Global
ESTADO_IDLE    : INT := 0;
ESTADO_RODANDO : INT := 1;
ESTADO_FALHA   : INT := 2;
ESTADO_HOMING  : INT := 3;

// Uso
IF BotaoStart THEN
  Estado := ESTADO_RODANDO;  // lê-se como inglês natural
END_IF;`,
        },
      ],
    },
  },

  // ── 6. Rotary Knife ───────────────────────────────────────────────────────────
  {
    slug: {
      en: 'rotary-knife-electronic-gear',
      pt: 'faca-rotativa-acoplamento-eletronico',
    },
    title: {
      en: 'Rotary Knife with electronic gearing: synchronization without mechanical coupling',
      pt: 'Faca Rotativa com acoplamento eletrônico: sincronização sem eixo mecânico',
    },
    excerpt: {
      en: 'Electronic gearing on SINAMICS S120 eliminates the mechanical drive train between knife and conveyor. See the configuration logic and position synchronization loop.',
      pt: 'O acoplamento eletrônico no SINAMICS S120 elimina a transmissão mecânica entre faca e esteira. Veja a lógica de configuração e o loop de sincronização de posição.',
    },
    tag: 'drives',
    readMin: 11,
    date: '2025-01-22',
    content: {
      en: [
        {
          type: 'p',
          text: "The Rotary Knife (or Flying Shear) is one of the most elegant applications in industrial motion control: a rotating blade that cuts a continuously moving material at a precise length, without stopping the product flow. Mechanically, it required a complex gear train, cam and clutch assembly. Electronically, it requires two axes and a synchronization algorithm.",
        },
        { type: 'h2', text: 'The problem: cutting a moving product without stopping it' },
        {
          type: 'p',
          text: "The material (film, paper, tube, wire) moves continuously at velocity V_line. The knife must:",
        },
        {
          type: 'ol',
          items: [
            "Accelerate to match the line speed exactly at the moment of cut (surface speed of the knife tip = V_line)",
            "Complete the cut",
            "Decelerate, reverse and return to start position",
            "Re-accelerate to be ready for the next cut at the correct position",
          ],
        },
        {
          type: 'p',
          text: "The cut length is determined by how much material passes while the knife completes one full cycle.",
        },
        { type: 'h2', text: 'Electronic gearing on SINAMICS S120' },
        {
          type: 'p',
          text: "The S120 Technology Object (TO) for electronic gearing (`TO_ExternalEncoder` + `TO_SynchronousAxis`) provides the framework for this. The line speed encoder (or virtual master axis) is the master. The knife axis is the slave. The gearing ratio defines the relationship between master position and slave position.",
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// SCOUT/Startdrive: Electronic Gear configuration
Master:          VirtualMaster (or physical encoder)
Slave:           KnifeAxis
Gear ratio:      1:1  (at cut point — knife surface speed = line speed)
Synchronization: Position-based (not time-based)
Cam profile:     Applied for acceleration/deceleration outside sync window`,
        },
        { type: 'h2', text: 'The cut window: synchronization logic in TIA Portal' },
        {
          type: 'p',
          text: "The PLCopen motion blocks used for the synchronization sequence:",
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// Phase 1: GEARING_IN — sync knife to line
MC_GearIn(
    Master          := VirtualMaster,
    Slave           := KnifeAxis,
    RatioNumerator  := 1,
    RatioDenominator:= 1,
    Execute         := StartSync,       // rising edge
    InSync          => GearSynced       // TRUE when speed matched
);

// Phase 2: When InSync, wait for cut position window
// (encoder-based position comparison)
CutWindowOpen := (MasterPos > CutStartAngle) AND (MasterPos < CutEndAngle);

// Phase 3: GEARING_OUT — return to home
MC_GearOut(
    Slave           := KnifeAxis,
    Execute         := GearSynced AND CutWindowOpen,
    Done            => GearOut_Done
);

// Phase 4: Move back to start position
MC_MoveAbsolute(
    Axis            := KnifeAxis,
    Position        := HomePosition,
    Velocity        := ReturnVelocity,
    Execute         := GearOut_Done,
    Done            => ReadyForNextCycle
);`,
        },
        { type: 'h2', text: 'Cut length calculation' },
        {
          type: 'p',
          text: "Cut length = (line speed) × (time for one complete knife cycle). To change the cut length, you change the knife cycle time — which means changing the knife's park position (how far it retreats before the next cut) or the return velocity.",
        },
        {
          type: 'callout',
          variant: 'info',
          text: "For variable cut lengths, use a cam profile (MC_CamIn) instead of fixed gear ratio. The cam maps master position to slave position for a custom synchronization curve.",
        },
        { type: 'h2', text: 'Digital Twin validation before real hardware' },
        {
          type: 'p',
          text: "The Rotary Knife is a perfect candidate for Virtual Commissioning. Before testing on a real film line (where a mistime cut can waste meters of expensive material), the Digital Twin lets you:",
        },
        {
          type: 'ul',
          items: [
            "Verify the sync window timing at different line speeds",
            "Test cut length accuracy with measured encoder feedback",
            "Validate the return sequence doesn't create a mechanical interference with the material",
            "Test fault scenarios: line speed change during cut, encoder loss, overtravel",
          ],
        },
        {
          type: 'p',
          text: "The Rotary Knife build (Build 17 in the ADVANCED level) covers the complete implementation: from SCOUT configuration to TIA Portal MC blocks to Digital Twin validation.",
        },
      ],
      pt: [
        {
          type: 'p',
          text: "A Faca Rotativa (ou Flying Shear) é uma das aplicações mais elegantes no controle de motion industrial: uma lâmina giratória que corta um material em movimento contínuo em um comprimento preciso, sem parar o fluxo de produto. Mecanicamente, exigia um trem de engrenagens complexo, conjunto de came e embreagem. Eletronicamente, exige dois eixos e um algoritmo de sincronização.",
        },
        { type: 'h2', text: 'O problema: cortar um produto em movimento sem pará-lo' },
        {
          type: 'p',
          text: "O material (filme, papel, tubo, arame) se move continuamente na velocidade V_linha. A faca deve:",
        },
        {
          type: 'ol',
          items: [
            "Acelerar para corresponder exatamente à velocidade da linha no momento do corte (velocidade superficial da ponta da faca = V_linha)",
            "Completar o corte",
            "Desacelerar, reverter e retornar à posição inicial",
            "Re-acelerar para estar pronta para o próximo corte na posição correta",
          ],
        },
        { type: 'h2', text: 'Acoplamento eletrônico no SINAMICS S120' },
        {
          type: 'p',
          text: "O Technology Object (TO) do S120 para acoplamento eletrônico (`TO_ExternalEncoder` + `TO_SynchronousAxis`) fornece o framework para isso. O encoder de velocidade da linha (ou eixo mestre virtual) é o mestre. O eixo da faca é o escravo. A relação de transmissão define a relação entre a posição do mestre e a posição do escravo.",
        },
        {
          type: 'code',
          lang: 'txt',
          code: `// SCOUT/Startdrive: Configuração de Engrenagem Eletrônica
Mestre:          MestreVirtual (ou encoder físico)
Escravo:         EixoFaca
Relação:         1:1  (no ponto de corte — velocidade superficial faca = velocidade linha)
Sincronização:   Baseada em posição (não em tempo)
Perfil de came:  Aplicado para aceleração/desaceleração fora da janela de sincronismo`,
        },
        { type: 'h2', text: 'A janela de corte: lógica de sincronização no TIA Portal' },
        {
          type: 'code',
          lang: 'txt',
          code: `// Fase 1: GEARING_IN — sincronizar faca com linha
MC_GearIn(
    Master          := MestreVirtual,
    Slave           := EixoFaca,
    RatioNumerator  := 1,
    RatioDenominator:= 1,
    Execute         := IniciarSync,     // borda de subida
    InSync          => GearSincronizado // TRUE quando velocidade corresponde
);

// Fase 2: Quando InSync, aguardar janela de posição de corte
JanelaCortAberta := (PosMestre > AnguloInicioCorte) AND (PosMestre < AnguloFimCorte);

// Fase 3: GEARING_OUT — retornar à home
MC_GearOut(
    Slave           := EixoFaca,
    Execute         := GearSincronizado AND JanelaCortAberta,
    Done            => GearOut_Pronto
);

// Fase 4: Mover de volta à posição inicial
MC_MoveAbsolute(
    Axis            := EixoFaca,
    Position        := PosicaoHome,
    Velocity        := VelocidadeRetorno,
    Execute         := GearOut_Pronto,
    Done            => ProntoProximoCiclo
);`,
        },
        { type: 'h2', text: 'Cálculo do comprimento de corte' },
        {
          type: 'p',
          text: "Comprimento de corte = (velocidade da linha) × (tempo para um ciclo completo da faca). Para alterar o comprimento de corte, você muda o tempo do ciclo da faca — o que significa mudar a posição de estacionamento da faca (o quanto ela recua antes do próximo corte) ou a velocidade de retorno.",
        },
        {
          type: 'callout',
          variant: 'info',
          text: "Para comprimentos de corte variáveis, use um perfil de came (MC_CamIn) em vez de relação de transmissão fixa. O came mapeia a posição do mestre para a posição do escravo para uma curva de sincronização personalizada.",
        },
        { type: 'h2', text: 'Validação no Gêmeo Digital antes do hardware real' },
        {
          type: 'p',
          text: "A Faca Rotativa é candidata perfeita para Comissionamento Virtual. Antes de testar em uma linha real de filme (onde um corte fora de tempo pode desperdiçar metros de material caro), o Gêmeo Digital permite:",
        },
        {
          type: 'ul',
          items: [
            "Verificar o timing da janela de sincronismo em diferentes velocidades de linha",
            "Testar a precisão do comprimento de corte com feedback real do encoder",
            "Validar se a sequência de retorno não cria interferência mecânica com o material",
            "Testar cenários de falha: mudança de velocidade da linha durante o corte, perda de encoder, excursão de limite",
          ],
        },
        {
          type: 'p',
          text: "O build de Faca Rotativa (Build 17 no nível ADVANCED) cobre a implementação completa: da configuração no SCOUT aos blocos MC no TIA Portal até a validação no Gêmeo Digital.",
        },
      ],
    },
  },
]

export function getPostBySlug(slug: string, lang: Lang): BlogPost | undefined {
  return posts.find(p => p.slug[lang] === slug)
}

export function getAllSlugs(): string[] {
  return posts.flatMap(p => [p.slug.en, p.slug.pt])
}
