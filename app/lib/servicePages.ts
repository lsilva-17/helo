export type ServiceSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServicePageFallback = {
  slug: string;
  menuLabel: string;
  kind: 'service' | 'location';
  eyebrow: string;
  title: string;
  intro: string;
  sections: ServiceSection[];
  faqs: ServiceFaq[];
  ctaTitle: string;
  ctaBody: string;
  ctaLabel?: string;
  mapEmbedUrl?: string;
  seoTitle: string;
  seoDescription: string;
  address?: string;
  hours?: string[];
};

export const servicePageFallbacks: Record<string, ServicePageFallback> = {
  'facetas-em-resina': {
    slug: 'facetas-em-resina',
    menuLabel: 'Facetas em resina',
    kind: 'service',
    eyebrow: 'Odontologia estética',
    title: 'Facetas em resina: o que são e como funciona o procedimento',
    intro: 'As facetas em resina são restaurações estéticas realizadas diretamente sobre os dentes para ajustar forma, proporção, textura e harmonia do sorriso. A indicação depende de avaliação clínica individual, saúde bucal e objetivos de cada paciente.',
    sections: [
      {heading: 'O que são facetas em resina?', body: 'São camadas de resina composta planejadas e modeladas sobre a superfície dos dentes. O procedimento busca integrar estética e função, respeitando características como formato facial, linha do sorriso, cor e proporções dentárias.'},
      {heading: 'Em quais situações podem ser consideradas?', body: 'A avaliação pode considerar alterações de formato, pequenas assimetrias, espaços entre dentes, diferenças de proporção ou outras necessidades estéticas. Nem todo caso é indicado para facetas: saúde gengival, mordida, estrutura dental e hábitos precisam ser avaliados antes.', bullets: ['Avaliação clínica e fotográfica', 'Planejamento de forma e proporção', 'Definição individual de cor e acabamento', 'Análise de função e oclusão']},
      {heading: 'Como funciona o procedimento?', body: 'O tratamento começa com diagnóstico e planejamento. Quando indicado, a resina é aplicada e esculpida diretamente nos dentes, seguida por acabamento e polimento. O número de sessões e a necessidade de qualquer preparo variam conforme o caso.'},
      {heading: 'Faceta em resina desgasta o dente?', body: 'A necessidade de preparo não é igual para todos os pacientes. Em alguns casos pode ser possível trabalhar com intervenção mínima; em outros, ajustes podem ser necessários para obter função e estética adequadas. Essa decisão deve ser feita após avaliação.'},
      {heading: 'Manutenção e cuidados', body: 'A longevidade depende de fatores como higiene, alimentação, hábitos, mordida e manutenção periódica. Consultas de acompanhamento permitem avaliar polimento, integridade da resina e saúde dos tecidos ao redor.'},
      {heading: 'Resina ou porcelana?', body: 'São materiais e técnicas diferentes, com indicações próprias. A escolha não deve ser feita apenas pela aparência ou pelo preço: quantidade de estrutura dental, expectativa estética, possibilidade de reparo, planejamento e manutenção precisam entrar na decisão.'},
    ],
    faqs: [
      {question: 'As facetas em resina ficam naturais?', answer: 'O planejamento busca integrar cor, textura, brilho e proporções ao sorriso e ao rosto. O resultado depende das características clínicas e do plano individual.'},
      {question: 'Quantos dentes precisam receber facetas?', answer: 'Não existe um número padrão. A quantidade é definida conforme a linha do sorriso, os dentes envolvidos e o objetivo do tratamento.'},
      {question: 'É possível reparar uma faceta em resina?', answer: 'Em diversas situações a resina permite ajustes ou reparos, mas a viabilidade depende do tipo e da extensão do problema.'},
    ],
    ctaTitle: 'Quer entender se facetas em resina fazem sentido para o seu caso?',
    ctaBody: 'Agende uma avaliação com a Dra. Heloisa para discutir objetivos, possibilidades e limitações do tratamento.',
    seoTitle: 'Facetas em Resina em São Paulo | Dra. Heloisa Veiga',
    seoDescription: 'Entenda o que são facetas em resina, indicações, etapas, cuidados e diferenças em relação à porcelana. Avaliação individual em São Paulo.',
  },
  'clareamento-dental': {
    slug: 'clareamento-dental',
    menuLabel: 'Clareamento dental',
    kind: 'service',
    eyebrow: 'Estética do sorriso',
    title: 'Clareamento dental: como funciona e quais são as opções',
    intro: 'O clareamento dental utiliza agentes clareadores para reduzir pigmentos que escurecem os dentes. A estratégia mais adequada depende da avaliação clínica, da causa da alteração de cor e da sensibilidade de cada paciente.',
    sections: [
      {heading: 'Como o clareamento dental funciona?', body: 'Os agentes clareadores penetram na estrutura dental e atuam sobre pigmentos responsáveis pelo escurecimento. O procedimento precisa ser indicado e acompanhado de acordo com as condições dos dentes e gengivas.'},
      {heading: 'Clareamento em consultório', body: 'É realizado pelo profissional com produtos e protocolo clínico definidos para o caso. O número de sessões varia conforme resposta dos dentes, objetivo e sensibilidade.'},
      {heading: 'Clareamento supervisionado em casa', body: 'Quando indicado, o paciente utiliza moldeiras e gel clareador seguindo concentração, tempo e frequência orientados pelo dentista. O acompanhamento permite ajustar o protocolo durante o processo.'},
      {heading: 'Sensibilidade pode acontecer?', body: 'Alguns pacientes apresentam sensibilidade durante o clareamento. A intensidade varia e pode exigir ajustes de concentração, frequência ou medidas específicas de controle.'},
      {heading: 'Restaurações e coroas clareiam?', body: 'Materiais restauradores não respondem ao clareamento da mesma forma que o dente natural. Por isso, restaurações, facetas e coroas existentes precisam ser consideradas no planejamento estético.'},
      {heading: 'Cuidados durante e depois', body: 'Higiene adequada, acompanhamento odontológico e controle de hábitos que favorecem pigmentação ajudam a manter o resultado. Retoques futuros podem ser avaliados conforme necessidade individual.'},
    ],
    faqs: [
      {question: 'Qual tipo de clareamento é melhor?', answer: 'Não existe uma técnica única para todos. A escolha considera saúde bucal, sensibilidade, rotina, expectativa e características da alteração de cor.'},
      {question: 'Clareamento enfraquece os dentes?', answer: 'Protocolos profissionais precisam respeitar indicação, concentração e tempo de uso. A avaliação odontológica é importante para identificar riscos e contraindicações.'},
      {question: 'Quanto tempo dura o resultado?', answer: 'A estabilidade varia conforme hábitos alimentares, higiene, tabagismo, características individuais e manutenção.'},
    ],
    ctaTitle: 'Quer avaliar qual estratégia de clareamento é adequada para você?',
    ctaBody: 'Converse com a Dra. Heloisa e faça uma avaliação antes de iniciar o procedimento.',
    seoTitle: 'Clareamento Dental em São Paulo | Dra. Heloisa Veiga',
    seoDescription: 'Saiba como funciona o clareamento dental, diferenças entre consultório e uso supervisionado em casa, sensibilidade e cuidados.',
  },
  'coroa-dentaria': {
    slug: 'coroa-dentaria',
    menuLabel: 'Coroa dentária',
    kind: 'service',
    eyebrow: 'Reabilitação e estética',
    title: 'Coroa dentária: o que é, quando pode ser indicada e como funciona',
    intro: 'A coroa dentária recobre a porção visível de um dente ou pode fazer parte de uma reabilitação sobre implante. Ela é planejada para recuperar forma, proteção, função e estética quando há indicação clínica.',
    sections: [
      {heading: 'O que é uma coroa dentária?', body: 'É uma restauração indireta confeccionada para envolver a estrutura dental preparada ou integrar uma prótese sobre implante. O material e o desenho são definidos conforme localização, carga mastigatória e necessidade estética.'},
      {heading: 'Quando uma coroa pode ser necessária?', body: 'Dentes com grande perda de estrutura, fraturas extensas, algumas situações após tratamento endodôntico ou reabilitações sobre implantes podem exigir uma solução com maior cobertura. A indicação depende da quantidade e qualidade da estrutura remanescente.'},
      {heading: 'Coroa ou restauração?', body: 'A escolha depende de quanto tecido dental saudável permanece, posição da fratura, carga funcional e possibilidade de reconstrução. Preservar estrutura saudável é um princípio importante do planejamento.'},
      {heading: 'Quais materiais podem ser utilizados?', body: 'Existem diferentes cerâmicas e combinações de materiais. Translucidez, resistência, espessura disponível, posição do dente e características do sorriso influenciam a escolha.'},
      {heading: 'Como é o processo?', body: 'Em geral envolve avaliação, preparo quando necessário, registros ou escaneamento, etapa provisória quando indicada, prova e instalação. O fluxo específico varia de acordo com o caso.'},
      {heading: 'Manutenção', body: 'Coroas também exigem higiene cuidadosa, controle periodontal e avaliações periódicas. Bruxismo, mordida, hábitos e condições dos dentes vizinhos podem influenciar a longevidade.'},
    ],
    faqs: [
      {question: 'Coroa é a mesma coisa que implante?', answer: 'Não. O implante substitui a raiz ausente; a coroa é a parte protética visível. Uma coroa também pode ser realizada sobre um dente natural, quando indicada.'},
      {question: 'A coroa precisa parecer diferente dos outros dentes?', answer: 'O planejamento de cor, forma, textura e translucidez busca integração com os dentes vizinhos, respeitando as limitações de cada situação clínica.'},
      {question: 'Toda pessoa que fez canal precisa de coroa?', answer: 'Não necessariamente. A indicação depende principalmente da quantidade de estrutura remanescente, do dente envolvido e das cargas funcionais.'},
    ],
    ctaTitle: 'Seu dente precisa de restauração ou coroa?',
    ctaBody: 'Uma avaliação clínica ajuda a identificar quanto de estrutura permanece e qual alternativa é mais conservadora para o caso.',
    seoTitle: 'Coroa Dentária em São Paulo | Dra. Heloisa Veiga',
    seoDescription: 'Entenda quando uma coroa dentária pode ser indicada, materiais, etapas e diferenças entre coroa, restauração e implante.',
  },
  'dente-quebrado': {
    slug: 'dente-quebrado',
    menuLabel: 'Dente quebrado',
    kind: 'service',
    eyebrow: 'Atendimento odontológico',
    title: 'Dente quebrado: o que fazer e quais tratamentos podem ser considerados',
    intro: 'Um dente pode quebrar por trauma, desgaste, cárie, restaurações extensas ou forças mastigatórias. A conduta depende da profundidade da fratura, sintomas, estrutura remanescente e envolvimento da polpa ou da raiz.',
    sections: [
      {heading: 'Quebrei um dente. O que faço agora?', body: 'Evite mastigar sobre a região, preserve qualquer fragmento que encontrar e procure avaliação odontológica. Se houver sangramento, dor intensa, inchaço, trauma importante ou alteração de posição do dente, busque atendimento com prioridade.'},
      {heading: 'O tratamento depende do tamanho da fratura', body: 'Pequenas perdas podem permitir acabamento ou restauração direta. Fraturas maiores podem exigir reconstrução mais extensa, tratamento pulpar, coroa ou outras abordagens. Fraturas de raiz precisam de avaliação específica.'},
      {heading: 'Restauração em resina', body: 'Quando há estrutura suficiente e indicação, a resina composta pode reconstruir forma e função diretamente no consultório.'},
      {heading: 'Quando uma coroa entra no planejamento?', body: 'Se a perda estrutural é extensa, pode ser necessário envolver e proteger mais superfícies do dente. A decisão é tomada após avaliar remanescente, posição da fratura e carga mastigatória.'},
      {heading: 'E se o dente estiver com dor?', body: 'Dor pode indicar exposição ou inflamação de estruturas internas, mas somente o exame clínico e, quando necessário, exames de imagem permitem definir a causa e o tratamento.'},
      {heading: 'Não adie a avaliação', body: 'Mesmo uma fratura aparentemente pequena pode criar bordas cortantes, retenção de placa ou progredir. Avaliar cedo ajuda a entender as opções disponíveis e a proteger a estrutura remanescente.'},
    ],
    faqs: [
      {question: 'Dá para colar o pedaço que quebrou?', answer: 'Em alguns tipos de trauma, um fragmento preservado pode ser útil. Guarde-o de forma segura e leve para avaliação; a possibilidade de uso depende das condições clínicas.'},
      {question: 'Dente quebrado sempre precisa de canal?', answer: 'Não. Isso depende da profundidade da fratura e do estado da polpa. Muitos casos não envolvem tratamento endodôntico.'},
      {question: 'Posso esperar alguns dias?', answer: 'A urgência depende de sintomas e extensão. Dor intensa, inchaço, sangramento persistente ou trauma importante justificam atendimento prioritário.'},
    ],
    ctaTitle: 'Quebrou um dente e precisa entender as opções?',
    ctaBody: 'Entre em contato para avaliar a extensão da fratura e definir a abordagem mais adequada.',
    seoTitle: 'Dente Quebrado: o que fazer | Dra. Heloisa Veiga',
    seoDescription: 'Saiba o que fazer ao quebrar um dente, quando procurar atendimento e quais tratamentos podem ser considerados conforme a extensão da fratura.',
  },
  'botox': {
    slug: 'botox',
    menuLabel: 'Toxina botulínica',
    kind: 'service',
    eyebrow: 'Estética facial',
    title: 'Toxina botulínica: como funciona o planejamento facial',
    intro: 'A toxina botulínica é utilizada em indicações específicas para modular temporariamente a atividade muscular. Em estética facial, o planejamento considera anatomia, dinâmica da expressão, proporções e objetivos individuais.',
    sections: [
      {heading: 'Como a toxina botulínica funciona?', body: 'Ela reduz temporariamente a comunicação entre nervo e músculo na região tratada. O efeito e a estratégia de aplicação dependem da anatomia e do objetivo clínico.'},
      {heading: 'Avaliação da expressão facial', body: 'Antes da aplicação, é importante observar o rosto em repouso e em movimento. Assim é possível identificar assimetrias, padrões musculares e regiões em que a intervenção pode ou não fazer sentido.'},
      {heading: 'Quando os efeitos aparecem?', body: 'A resposta não é imediata e evolui ao longo dos dias após o procedimento. O tempo e a intensidade variam entre pessoas e regiões tratadas.'},
      {heading: 'Quanto tempo dura?', body: 'O efeito é temporário e sua duração varia conforme metabolismo, musculatura, dose, região e características individuais. Reavaliações ajudam a definir necessidade e intervalo entre aplicações.'},
      {heading: 'Naturalidade como objetivo', body: 'Planejamento individualizado busca evitar padronização de rostos. O objetivo é respeitar proporções, expressão e características próprias de cada paciente.'},
    ],
    faqs: [
      {question: 'Toxina botulínica e preenchimento são a mesma coisa?', answer: 'Não. São tratamentos com mecanismos e indicações diferentes. A avaliação define qual recurso, se algum, é adequado para o objetivo apresentado.'},
      {question: 'O resultado é permanente?', answer: 'Não. A ação da toxina botulínica é temporária e diminui progressivamente.'},
      {question: 'Preciso fazer manutenção em um intervalo fixo?', answer: 'Não existe um intervalo universal. A necessidade de nova aplicação deve ser avaliada individualmente.'},
    ],
    ctaTitle: 'Quer conversar sobre estética facial de forma individualizada?',
    ctaBody: 'Agende uma avaliação para discutir objetivos, indicação e expectativas de forma responsável.',
    seoTitle: 'Toxina Botulínica em São Paulo | Dra. Heloisa Veiga',
    seoDescription: 'Entenda como funciona a toxina botulínica, avaliação da expressão facial, duração e planejamento individualizado.',
  },
  'harmonizacao-facial': {
    slug: 'harmonizacao-facial',
    menuLabel: 'Harmonização facial',
    kind: 'service',
    eyebrow: 'Estética facial',
    title: 'Harmonização facial: planejamento, proporção e naturalidade',
    intro: 'Harmonização facial não é um único procedimento, mas um planejamento que pode combinar diferentes recursos de acordo com anatomia, proporções, dinâmica facial e objetivos da pessoa.',
    sections: [
      {heading: 'O que significa harmonização facial?', body: 'É uma abordagem de avaliação do conjunto facial. O foco está em identificar proporções, volumes, contornos e relações entre sorriso e face antes de considerar qualquer intervenção.'},
      {heading: 'O planejamento vem antes do procedimento', body: 'A avaliação individual evita indicar tratamentos apenas por tendência. Fotografias, análise facial e conversa sobre expectativas ajudam a definir prioridades e também situações em que não intervir é a melhor escolha.'},
      {heading: 'Quais recursos podem fazer parte?', body: 'Dependendo da habilitação profissional, indicação e caso clínico, diferentes técnicas podem ser consideradas. Cada uma possui finalidade, limitações, duração e riscos próprios, que devem ser discutidos previamente.'},
      {heading: 'Naturalidade e identidade', body: 'Um bom planejamento não busca padronizar traços. O objetivo estético deve respeitar características individuais, expressão e equilíbrio do conjunto facial.'},
      {heading: 'Acompanhamento', body: 'Procedimentos estéticos exigem orientações pós-atendimento e acompanhamento. Resultados e necessidade de manutenção variam de acordo com técnica e características individuais.'},
    ],
    faqs: [
      {question: 'Harmonização facial significa mudar o rosto?', answer: 'Não necessariamente. O planejamento pode ser sutil e deve partir dos objetivos da pessoa e da análise profissional.'},
      {question: 'É preciso fazer vários procedimentos?', answer: 'Não. A quantidade e o tipo de intervenção não são definidos por um pacote padrão; podem inclusive não ser indicados.'},
      {question: 'Como saber qual procedimento escolher?', answer: 'A escolha deve ocorrer após avaliação anatômica e discussão de objetivos, benefícios, limitações e riscos.'},
    ],
    ctaTitle: 'Quer entender quais possibilidades fazem sentido para você?',
    ctaBody: 'Converse com a Dra. Heloisa para realizar uma avaliação individual antes de decidir por qualquer procedimento.',
    seoTitle: 'Harmonização Facial em São Paulo | Dra. Heloisa Veiga',
    seoDescription: 'Saiba como funciona o planejamento de harmonização facial, avaliação de proporções, naturalidade e escolha individualizada de procedimentos.',
  },
  'dentista-santana': {
    slug: 'dentista-santana',
    menuLabel: 'Localização',
    kind: 'location',
    eyebrow: 'Localização e atendimento',
    title: 'Consultório odontológico em Santana, São Paulo',
    intro: 'O consultório onde a Dra. Heloisa Veiga realiza atendimentos fica em Santana, na Zona Norte de São Paulo. Consulte abaixo o endereço, horários e mapa para planejar sua visita.',
    sections: [
      {heading: 'Endereço', body: 'Rua Dr. César, 530 — Conjunto 106 — Santana, São Paulo — SP, 02013-002.'},
      {heading: 'Atendimento com hora marcada', body: 'Os atendimentos são realizados mediante agendamento. Para confirmar disponibilidade, alterações de horário ou encaixes, entre em contato pelo WhatsApp.'},
      {heading: 'Como chegar', body: 'Use o mapa abaixo para visualizar a localização do consultório e abrir rotas no Google Maps. A posição exibida corresponde ao endereço cadastrado no Perfil da Empresa da Dra. Heloisa.'},
    ],
    faqs: [
      {question: 'Preciso agendar antes de ir?', answer: 'Sim. O atendimento é realizado com horário marcado para permitir avaliação e planejamento individualizados.'},
      {question: 'Como confirmo o horário disponível?', answer: 'Entre em contato pelo WhatsApp para consultar a agenda atualizada.'},
    ],
    ctaTitle: 'Quer agendar uma consulta em Santana?',
    ctaBody: 'Fale diretamente com a Dra. Heloisa pelo WhatsApp para consultar horários disponíveis.',
    seoTitle: 'Dentista em Santana, São Paulo | Dra. Heloisa Veiga',
    seoDescription: 'Endereço, mapa e informações para atendimento odontológico com a Dra. Heloisa Veiga em Santana, Zona Norte de São Paulo.',
    address: 'Rua Dr. César, 530 — Conjunto 106 — Santana, São Paulo — SP, 02013-002',
    hours: ['Segunda a sexta: 09h às 19h', 'Atendimento mediante agendamento'],
  },
};

export const serviceMenuItems = [
  {href: '/', label: 'Início'},
  {href: '/facetas-em-resina', label: 'Facetas em resina'},
  {href: '/clareamento-dental', label: 'Clareamento dental'},
  {href: '/coroa-dentaria', label: 'Coroa dentária'},
  {href: '/botox', label: 'Toxina botulínica'},
  {href: '/harmonizacao-facial', label: 'Harmonização facial'},
  {href: '/dentista-santana', label: 'Localização'},
];
