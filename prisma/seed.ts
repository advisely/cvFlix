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
