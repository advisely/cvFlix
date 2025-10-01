import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
async function main() {
  // Delete all existing data
  await prisma.media.deleteMany({})
  await prisma.accomplishment.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.experience.deleteMany({})
  await prisma.highlight.deleteMany({})
  await prisma.company.deleteMany({})
  await prisma.knowledge.deleteMany({})
  await prisma.user.deleteMany({})

  // Admin User
  const hashedPassword = await bcrypt.hash('password', 10)
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
    },
  })

  // Companies
  const bnc = await prisma.company.create({ data: { name: 'National Bank of Canada', nameFr: 'Banque Nationale du Canada' } });
  const bombardier = await prisma.company.create({ data: { name: 'Bombardier', nameFr: 'Bombardier' } });
  const cn = await prisma.company.create({ data: { name: 'CN (Canadian National)', nameFr: 'CN (Canadien National)' } });
  const exo = await prisma.company.create({ data: { name: 'EXO (Metropolitan Transport Network)', nameFr: 'EXO (Réseau de transport métropolitain)' } });
  const bmo = await prisma.company.create({ data: { name: 'Bank of Montreal', nameFr: 'Banque de Montréal' } });
  const cibc = await prisma.company.create({ data: { name: 'CIBC Bank', nameFr: 'Banque CIBC' } });
  const fct = await prisma.company.create({ data: { name: 'FCT Title Services', nameFr: 'Services de titres FCT' } });
  const beyondTheRack = await prisma.company.create({ data: { name: 'Beyond the Rack', nameFr: 'Beyond the Rack' } });

  // Experiences
  await prisma.experience.createMany({
    data: [
      {
        title: 'Analyste d\'affaires principal - Domaine de paiement',
        titleFr: 'Analyste d\'affaires principal - Domaine de paiement',
        startDate: new Date('2022-09-01'),
        description: 'Agir en tant qu\'analyste pluridisciplinaire (affaires, fonctionnel, QA) au sein de l\'équipe Payment Hub, axé sur la transformation de l\'écosystème des paiements.',
        descriptionFr: 'Agir en tant qu\'analyste pluridisciplinaire (affaires, fonctionnel, QA) au sein de l\'équipe Payment Hub, axé sur la transformation de l\'écosystème des paiements.',
        companyId: bnc.id,
      },
      {
        title: 'Conseiller en processus d\'affaires',
        titleFr: 'Conseiller en processus d\'affaires',
        startDate: new Date('2015-07-01'),
        endDate: new Date('2016-08-01'),
        description: 'Conseiller la haute direction pour les initiatives stratégiques en tant que représentant officiel du service de gestion de la perception dans divers comités.',
        descriptionFr: 'Conseiller la haute direction pour les initiatives stratégiques en tant que représentant officiel du service de gestion de la perception dans divers comités.',
        companyId: bnc.id,
      },
      {
        title: 'Analyste d\'affaires principal - Expérience Utilisateur',
        titleFr: 'Analyste d\'affaires principal - Expérience Utilisateur',
        startDate: new Date('2022-08-01'),
        endDate: new Date('2022-11-01'),
        description: 'Agir en tant qu\'analyste hybride (affaires et fonctionnel) pour l\'amélioration de l\'expérience utilisateur et l\'innovation dans les outils de collaboration.',
        descriptionFr: 'Agir en tant qu\'analyste hybride (affaires et fonctionnel) pour l\'amélioration de l\'expérience utilisateur et l\'innovation dans les outils de collaboration.',
        companyId: bombardier.id,
      },
      {
        title: 'Analyste d\'affaires principal',
        titleFr: 'Analyste d\'affaires principal',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2021-09-01'),
        description: 'Agir en tant qu\'intégrateur de la solution Microsoft 365 (Office 365, SharePoint Online, Azure et Power Platform).',
        descriptionFr: 'Agir en tant qu\'intégrateur de la solution Microsoft 365 (Office 365, SharePoint Online, Azure et Power Platform).',
        companyId: cn.id,
      },
      {
        title: 'Analyste d\'affaires principal',
        titleFr: 'Analyste d\'affaires principal',
        startDate: new Date('2019-05-01'),
        endDate: new Date('2020-08-01'),
        description: 'Agir en tant que représentant exo dans la livraison et réalisation des projets.',
        descriptionFr: 'Agir en tant que représentant exo dans la livraison et réalisation des projets.',
        companyId: exo.id,
      },
      {
        title: 'Analyste d\'affaires et en gestion du changement principal',
        titleFr: 'Analyste d\'affaires et en gestion du changement principal',
        startDate: new Date('2016-08-01'),
        endDate: new Date('2017-10-01'),
        description: 'Agir comme membre de l\'équipe de gestion du changement du service de comptabilité et de réconciliation, formuler les orientations stratégiques et concevoir des processus simplifiés.',
        descriptionFr: 'Agir comme membre de l\'équipe de gestion du changement du service de comptabilité et de réconciliation, formuler les orientations stratégiques et concevoir des processus simplifiés.',
        companyId: bmo.id,
      },
      {
        title: 'Spécialiste en affaires et opérations',
        titleFr: 'Spécialiste en affaires et opérations',
        startDate: new Date('2012-07-01'),
        endDate: new Date('2015-07-01'),
        description: 'Créer et exécuter les plans d\'action dans le but d\'améliorer les processus mis en place; assurer le succès des déploiements technologiques par le développement de stratégies de formation et encadrer des employés touchés par le changement.',
        descriptionFr: 'Créer et exécuter les plans d\'action dans le but d\'améliorer les processus mis en place; assurer le succès des déploiements technologiques par le développement de stratégies de formation et encadrer des employés touchés par le changement.',
        companyId: cibc.id,
      },
      {
        title: 'Agent de titres',
        titleFr: 'Agent de titres',
        startDate: new Date('2009-03-01'),
        endDate: new Date('2010-11-01'),
        description: 'Rédaction et préparation des documents de refinancement hypothécaires.',
        descriptionFr: 'Rédaction et préparation des documents de refinancement hypothécaires.',
        companyId: fct.id,
      },
      {
        title: 'Analyste d\'affaires principal / spécialiste en application',
        titleFr: 'Analyste d\'affaires principal / spécialiste en application',
        startDate: new Date('2017-10-01'),
        endDate: new Date('2018-01-01'),
        description: 'Agir à titre de chef d\'équipe pour le projet Transformation.',
        descriptionFr: 'Agir à titre de chef d\'équipe pour le projet Transformation.',
        companyId: beyondTheRack.id,
      },
    ],
  });

  // Knowledge entries (Education, Certifications, Skills)
  await prisma.knowledge.createMany({
    data: [
      // Education
      {
        kind: 'EDUCATION',
        title: 'Stratégie Innovante',
        titleFr: 'Stratégie Innovante',
        issuer: 'École de Commerce de Harvard, Boston, USA',
        issuerFr: 'École de Commerce de Harvard, Boston, USA',
        category: 'Commerce',
        categoryFr: 'Commerce',
        startDate: new Date('2018-01-01'),
        isCurrent: false,
        location: 'Boston, USA'
      },
      {
        kind: 'EDUCATION',
        title: 'Maîtrise en gestion des affaires (MBA)',
        titleFr: 'Maîtrise en gestion des affaires (MBA)',
        issuer: 'Université de Moncton, Moncton',
        issuerFr: 'Université de Moncton, Moncton',
        category: 'Gestion',
        categoryFr: 'Gestion',
        startDate: new Date('2009-01-01'),
        isCurrent: false,
        location: 'Moncton, Canada'
      },
      {
        kind: 'EDUCATION',
        title: 'Diplôme en technologie de l\'information (TI)',
        titleFr: 'Diplôme en technologie de l\'information (TI)',
        issuer: 'Université de Moncton, Moncton',
        issuerFr: 'Université de Moncton, Moncton',
        category: 'Informatique',
        categoryFr: 'Informatique',
        startDate: new Date('2007-01-01'),
        isCurrent: false,
        location: 'Moncton, Canada'
      },

      // Certifications
      {
        kind: 'CERTIFICATION',
        title: 'Agile Scrum Master',
        titleFr: 'Agile Scrum Master',
        issuer: 'CSM',
        issuerFr: 'CSM',
        startDate: new Date('2018-01-01')
      },
      {
        kind: 'CERTIFICATION',
        title: 'Information Technology Infrastructure Library',
        titleFr: 'Information Technology Infrastructure Library',
        issuer: 'ITIL Foundation',
        issuerFr: 'ITIL Foundation',
        startDate: new Date('2018-01-01')
      },
      {
        kind: 'CERTIFICATION',
        title: 'Robotic Process Automation',
        titleFr: 'Robotic Process Automation',
        issuer: 'RPA Developer Foundation',
        issuerFr: 'RPA Developer Foundation',
        startDate: new Date('2018-01-01')
      },
      {
        kind: 'CERTIFICATION',
        title: 'IBM Blockchain Essentials',
        titleFr: 'IBM Blockchain Essentials',
        issuer: 'IBM',
        issuerFr: 'IBM',
        startDate: new Date('2018-01-01')
      },
      {
        kind: 'CERTIFICATION',
        title: 'Six Sigma Professionnel – Ceinture noire',
        titleFr: 'Six Sigma Professionnel – Ceinture noire',
        issuer: 'SSBBP',
        issuerFr: 'SSBBP',
        startDate: new Date('2017-01-01')
      },
      {
        kind: 'CERTIFICATION',
        title: 'Qualifié en gestion des projets',
        titleFr: 'Qualifié en gestion des projets',
        issuer: 'PMQ',
        issuerFr: 'PMQ',
        startDate: new Date('2017-01-01')
      },
      {
        kind: 'CERTIFICATION',
        title: 'Certifié en gestion exécutive',
        titleFr: 'Certifié en gestion exécutive',
        issuer: 'EMC',
        issuerFr: 'EMC',
        startDate: new Date('2016-01-01')
      },
      {
        kind: 'CERTIFICATION',
        title: 'Expert en marketing en ligne',
        titleFr: 'Expert en marketing en ligne',
        issuer: 'CFE',
        issuerFr: 'CFE',
        startDate: new Date('2014-01-01')
      },
      {
        kind: 'CERTIFICATION',
        title: 'Gestion des processus d\'affaires',
        titleFr: 'Gestion des processus d\'affaires',
        issuer: 'HEC Montréal',
        issuerFr: 'HEC Montréal',
        startDate: new Date('2015-01-01')
      },
      {
        kind: 'CERTIFICATION',
        title: 'Analyse d\'affaires et conception de solutions TI',
        titleFr: 'Analyse d\'affaires et conception de solutions TI',
        issuer: 'HEC Montréal',
        issuerFr: 'HEC Montréal',
        startDate: new Date('2014-01-01')
      },
      {
        kind: 'CERTIFICATION',
        title: 'Systèmes d\'information en gestion',
        titleFr: 'Systèmes d\'information en gestion',
        issuer: 'HEC Montréal',
        issuerFr: 'HEC Montréal',
        startDate: new Date('2014-01-01')
      },

      // Skills
      { kind: 'SKILL', title: 'Analyse d\'affaires', titleFr: 'Analyse d\'affaires', category: 'Compétence', categoryFr: 'Compétence' },
      { kind: 'SKILL', title: 'Jira & Confluence', titleFr: 'Jira & Confluence', category: 'Technologie', categoryFr: 'Technologie' },
      { kind: 'SKILL', title: 'Expertise bancaire et dans le transport', titleFr: 'Expertise bancaire et dans le transport', category: 'Compétence', categoryFr: 'Compétence' },
      { kind: 'SKILL', title: 'MS Project & MS Visio aux normes BPMN', titleFr: 'MS Project & MS Visio aux normes BPMN', category: 'Technologie', categoryFr: 'Technologie' },
      { kind: 'SKILL', title: 'Rédaction des requis d\'affaires', titleFr: 'Rédaction des requis d\'affaires', category: 'Compétence', categoryFr: 'Compétence' },
      { kind: 'SKILL', title: 'MS Office 365 (Word, Excel, PowerPoint & Outlook)', titleFr: 'MS Office 365 (Word, Excel, PowerPoint & Outlook)', category: 'Technologie', categoryFr: 'Technologie' },
      { kind: 'SKILL', title: 'Gestion de projets agile', titleFr: 'Gestion de projets agile', category: 'Compétence', categoryFr: 'Compétence' },
      { kind: 'SKILL', title: 'Microsoft 365 (Teams, Planner, SharePoint, Azure)', titleFr: 'Microsoft 365 (Teams, Planner, SharePoint, Azure)', category: 'Technologie', categoryFr: 'Technologie' },
      { kind: 'SKILL', title: 'Amélioration Continue Lean Six Sigma', titleFr: 'Amélioration Continue Lean Six Sigma', category: 'Compétence', categoryFr: 'Compétence' },
      { kind: 'SKILL', title: 'Google Business Suite', titleFr: 'Google Business Suite', category: 'Technologie', categoryFr: 'Technologie' },
      { kind: 'SKILL', title: 'Gestion du changement', titleFr: 'Gestion du changement', category: 'Compétence', categoryFr: 'Compétence' },
      { kind: 'SKILL', title: 'SAP, SAS, AWS, Splunk, Datadog', titleFr: 'SAP, SAS, AWS, Splunk, Datadog', category: 'Technologie', categoryFr: 'Technologie' },
      { kind: 'SKILL', title: 'Planification stratégique', titleFr: 'Planification stratégique', category: 'Compétence', categoryFr: 'Compétence' },
      { kind: 'SKILL', title: 'Oracle NetSuite, Kafka Topic', titleFr: 'Oracle NetSuite, Kafka Topic', category: 'Technologie', categoryFr: 'Technologie' },
      { kind: 'SKILL', title: 'Communication interpersonnelle bilingue', titleFr: 'Communication interpersonnelle bilingue', category: 'Compétence', categoryFr: 'Compétence' },
      { kind: 'SKILL', title: 'Dassault Systèmes 3DS', titleFr: 'Dassault Systèmes 3DS', category: 'Technologie', categoryFr: 'Technologie' }
    ],
  });

  // Contributions
  await prisma.contribution.createMany({
    data: [
      {
        title: 'Open Source QR Code Generator',
        titleFr: 'Générateur de codes QR open source',
        organization: 'GitHub Community',
        organizationFr: 'Communauté GitHub',
        role: 'Maintainer',
        roleFr: 'Mainteneur',
        description: 'Led refactor to support SVG exports and accessibility metadata.',
        descriptionFr: 'Dirigé la refonte pour prendre en charge les exports SVG et les métadonnées d’accessibilité.',
        type: 'OPEN_SOURCE',
        impact: 'Adopted by 5k+ projects; increased build throughput by 35%.',
        impactFr: 'Adopté par plus de 5 000 projets; augmentation de 35 % du débit de compilation.',
        startDate: new Date('2021-03-01'),
        isCurrent: true,
        url: 'https://github.com/example/qr-generator',
        downloadUrl: 'https://github.com/example/qr-generator/releases',
        thumbnailUrl: '/images/contributions/qr-generator.svg',
        displayOrder: 1,
      },
      {
        title: 'Legacy Node.js Package Revival',
        titleFr: 'Relance d’un package Node.js obsolète',
        organization: 'npm Community',
        organizationFr: 'Communauté npm',
        role: 'Contributor',
        roleFr: 'Contributeur',
        description: 'Modernized TypeScript definitions and CI for an abandoned analytics SDK.',
        descriptionFr: 'Modernisation des définitions TypeScript et de l’intégration continue pour un SDK d’analytique abandonné.',
        type: 'OPEN_SOURCE',
        impact: 'Restored weekly downloads to 20k+ with zero critical vulnerabilities.',
        impactFr: 'Téléchargements hebdomadaires restaurés à plus de 20 000 sans vulnérabilités critiques.',
        startDate: new Date('2022-06-01'),
        url: 'https://www.npmjs.com/package/legacy-analytics-sdk',
        downloadUrl: 'https://www.npmjs.com/package/legacy-analytics-sdk',
        thumbnailUrl: '/images/contributions/legacy-sdk.svg',
        displayOrder: 2,
      },
      {
        title: 'Distributed Cancer Research Compute',
        titleFr: 'Calcul distribué pour la recherche sur le cancer',
        organization: 'World Community Grid',
        organizationFr: 'World Community Grid',
        role: 'Volunteer Researcher',
        roleFr: 'Chercheur bénévole',
        description: 'Provisioned GPU capacity and automation pipelines to maximize lab throughput.',
        descriptionFr: 'Provision de capacité GPU et de pipelines d’automatisation pour maximiser le rendement du laboratoire.',
        type: 'RESEARCH',
        impact: 'Accelerated molecule discovery throughput by 18% across 3 active studies.',
        impactFr: 'Accélération de 18 % de la découverte de molécules dans 3 études actives.',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2021-12-01'),
        url: 'https://www.worldcommunitygrid.org/',
        thumbnailUrl: '/images/contributions/wcg.svg',
        displayOrder: 3,
      },
      {
        title: 'Board of Directors, Visionary Media',
        titleFr: 'Conseil d’administration, Visionary Media',
        organization: 'Visionary Media Inc.',
        organizationFr: 'Visionary Media Inc.',
        role: 'Board Member',
        roleFr: 'Membre du conseil',
        description: 'Advised on digital transformation roadmap and OTT launch readiness.',
        descriptionFr: 'Conseils sur la feuille de route de transformation numérique et la préparation au lancement OTT.',
        type: 'CORPORATE',
        impact: 'Guided 3 new revenue streams and 40% YoY audience growth.',
        impactFr: 'Guidé 3 nouvelles sources de revenus et une croissance d’audience de 40 % YoY.',
        startDate: new Date('2019-05-01'),
        endDate: new Date('2022-04-01'),
        url: 'https://visionarymedia.example.com',
        thumbnailUrl: '/images/contributions/visionary.svg',
        displayOrder: 4,
      },
    ],
  });

  // Recommended books
  await prisma.recommendedBook.createMany({
    data: [
      {
        title: 'Thinking in Systems',
        titleFr: 'Penser en systèmes',
        author: 'Donella H. Meadows',
        authorFr: 'Donella H. Meadows',
        recommendedReason: 'Essential framework for systems thinking applied to digital transformations.',
        recommendedReasonFr: 'Cadre essentiel de pensée systémique appliqué aux transformations numériques.',
        summary: 'Introduces feedback loops, resilience, and leverage points for complex initiatives.',
        summaryFr: 'Introduit les boucles de rétroaction, la résilience et les points de levier pour les initiatives complexes.',
        purchaseUrl: 'https://www.bookshop.org/books/thinking-in-systems/9781603580557',
        priority: 1,
        coverImageUrl: '/images/books/thinking-in-systems.svg',
      },
      {
        title: 'Accelerate: Building and Scaling High Performing Technology Organizations',
        titleFr: 'Accelerate : Construire et scaler des organisations technologiques performantes',
        author: 'Nicole Forsgren, Jez Humble, Gene Kim',
        authorFr: 'Nicole Forsgren, Jez Humble, Gene Kim',
        recommendedReason: 'Data-backed practices that correlate with elite software delivery performance.',
        recommendedReasonFr: 'Pratiques basées sur les données corrélées avec la performance logicielle élite.',
        summary: 'Explores DevOps metrics, cultural shifts, and leadership patterns driving outcomes.',
        summaryFr: 'Explore les métriques DevOps, les changements culturels et les modèles de leadership générateurs de résultats.',
        purchaseUrl: 'https://itrevolution.com/accelerate-book/',
        priority: 2,
        coverImageUrl: '/images/books/accelerate.svg',
      },
      {
        title: 'Creative Confidence',
        titleFr: 'Confiance créative',
        author: 'Tom Kelley & David Kelley',
        authorFr: 'Tom Kelley & David Kelley',
        recommendedReason: 'Shows how to unlock creativity for product innovation and stakeholder empathy.',
        recommendedReasonFr: 'Montre comment libérer la créativité pour l’innovation produit et l’empathie envers les parties prenantes.',
        summary: 'Design thinking toolkit with real-world case studies for team ideation.',
        summaryFr: 'Boîte à outils design thinking avec études de cas concrètes pour l’idéation d’équipe.',
        purchaseUrl: 'https://www.ideou.com/products/creative-confidence',
        priority: 3,
        coverImageUrl: '/images/books/creative-confidence.svg',
      },
      {
        title: 'The Phoenix Project',
        titleFr: 'Le Projet Phoenix',
        author: 'Gene Kim, Kevin Behr, George Spafford',
        authorFr: 'Gene Kim, Kevin Behr, George Spafford',
        recommendedReason: 'Narrative-driven illustration of DevOps, flow efficiency, and value streams.',
        recommendedReasonFr: 'Illustration narrative du DevOps, de l’efficacité du flux et des chaînes de valeur.',
        summary: 'Follows an IT manager turned hero as he stabilizes a failing product launch.',
        summaryFr: 'Suit un gestionnaire TI devenu héros en stabilisant un lancement produit en échec.',
        purchaseUrl: 'https://www.amazon.com/Phoenix-Project-DevOps-Helping-Business/dp/1942788290',
        priority: 4,
        coverImageUrl: '/images/books/phoenix-project.svg',
      },
      {
        title: 'Measure What Matters',
        titleFr: 'Mesurez ce qui compte',
        author: 'John Doerr',
        authorFr: 'John Doerr',
        recommendedReason: 'Practical guidance on Objectives and Key Results to align cross-functional teams.',
        recommendedReasonFr: 'Guide pratique sur les OKR pour aligner les équipes multifonctions.',
        summary: 'Case studies from Google, YouTube, and Gates Foundation showcasing OKR adoption.',
        summaryFr: 'Études de cas de Google, YouTube et la Fondation Gates démontrant l’adoption des OKR.',
        purchaseUrl: 'https://www.whatmatters.com/book/',
        priority: 5,
        coverImageUrl: '/images/books/measure-what-matters.svg',
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
