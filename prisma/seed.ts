import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
async function main() {
  // Delete all existing data
  await prisma.accomplishment.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.experience.deleteMany({})
  await prisma.company.deleteMany({})
  await prisma.skill.deleteMany({})
  await prisma.education.deleteMany({})
  await prisma.certification.deleteMany({})
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

  // Education
  await prisma.education.createMany({
    data: [
      {
        institution: 'École de Commerce de Harvard, Boston, USA',
        institutionFr: 'École de Commerce de Harvard, Boston, USA',
        degree: 'Stratégie Innovante',
        degreeFr: 'Stratégie Innovante',
        field: 'Commerce',
        fieldFr: 'Commerce',
        startDate: new Date('2018-01-01'),
      },
      {
        institution: 'Université de Moncton, Moncton',
        institutionFr: 'Université de Moncton, Moncton',
        degree: 'Maîtrise en gestion des affaires (MBA)',
        degreeFr: 'Maîtrise en gestion des affaires (MBA)',
        field: 'Gestion',
        fieldFr: 'Gestion',
        startDate: new Date('2009-01-01'),
      },
      {
        institution: 'Université de Moncton, Moncton',
        institutionFr: 'Université de Moncton, Moncton',
        degree: 'Diplôme en technologie de l\'information (TI)',
        degreeFr: 'Diplôme en technologie de l\'information (TI)',
        field: 'Informatique',
        fieldFr: 'Informatique',
        startDate: new Date('2007-01-01'),
      },
    ],
  });

  // Certifications
  await prisma.certification.createMany({
    data: [
      { name: 'Agile Scrum Master', nameFr: 'Agile Scrum Master', issuer: 'CSM', issuerFr: 'CSM', issueDate: new Date('2018-01-01') },
      { name: 'Information Technology Infrastructure Library', nameFr: 'Information Technology Infrastructure Library', issuer: 'ITIL Foundation', issuerFr: 'ITIL Foundation', issueDate: new Date('2018-01-01') },
      { name: 'Robotic Process Automation', nameFr: 'Robotic Process Automation', issuer: 'RPA Developer Foundation', issuerFr: 'RPA Developer Foundation', issueDate: new Date('2018-01-01') },
      { name: 'IBM Blockchain Essentials', nameFr: 'IBM Blockchain Essentials', issuer: 'IBM', issuerFr: 'IBM', issueDate: new Date('2018-01-01') },
      { name: 'Six Sigma Professionnel – Ceinture noire', nameFr: 'Six Sigma Professionnel – Ceinture noire', issuer: 'SSBBP', issuerFr: 'SSBBP', issueDate: new Date('2017-01-01') },
      { name: 'Qualifié en gestion des projets', nameFr: 'Qualifié en gestion des projets', issuer: 'PMQ', issuerFr: 'PMQ', issueDate: new Date('2017-01-01') },
      { name: 'Certifié en gestion exécutive', nameFr: 'Certifié en gestion exécutive', issuer: 'EMC', issuerFr: 'EMC', issueDate: new Date('2016-01-01') },
      { name: 'Expert en marketing en ligne', nameFr: 'Expert en marketing en ligne', issuer: 'CFE', issuerFr: 'CFE', issueDate: new Date('2014-01-01') },
      { name: 'Gestion des processus d\'affaires', nameFr: 'Gestion des processus d\'affaires', issuer: 'HEC Montréal', issuerFr: 'HEC Montréal', issueDate: new Date('2015-01-01') },
      { name: 'Analyse d\'affaires et conception de solutions TI', nameFr: 'Analyse d\'affaires et conception de solutions TI', issuer: 'HEC Montréal', issuerFr: 'HEC Montréal', issueDate: new Date('2014-01-01') },
      { name: 'Systèmes d\'information en gestion', nameFr: 'Systèmes d\'information en gestion', issuer: 'HEC Montréal', issuerFr: 'HEC Montréal', issueDate: new Date('2014-01-01') },
    ],
  });

  // Skills
  await prisma.skill.createMany({
    data: [
      { name: 'Analyse d\'affaires', nameFr: 'Analyse d\'affaires', category: 'Compétence', categoryFr: 'Compétence' },
      { name: 'Jira & Confluence', nameFr: 'Jira & Confluence', category: 'Technologie', categoryFr: 'Technologie' },
      { name: 'Expertise bancaire et dans le transport', nameFr: 'Expertise bancaire et dans le transport', category: 'Compétence', categoryFr: 'Compétence' },
      { name: 'MS Project & MS Visio aux normes BPMN', nameFr: 'MS Project & MS Visio aux normes BPMN', category: 'Technologie', categoryFr: 'Technologie' },
      { name: 'Rédaction des requis d\'affaires', nameFr: 'Rédaction des requis d\'affaires', category: 'Compétence', categoryFr: 'Compétence' },
      { name: 'MS Office 365 (Word, Excel, PowerPoint & Outlook)', nameFr: 'MS Office 365 (Word, Excel, PowerPoint & Outlook)', category: 'Technologie', categoryFr: 'Technologie' },
      { name: 'Gestion de projets agile', nameFr: 'Gestion de projets agile', category: 'Compétence', categoryFr: 'Compétence' },
      { name: 'Microsoft 365 (Teams, Planner, SharePoint, Azure)', nameFr: 'Microsoft 365 (Teams, Planner, SharePoint, Azure)', category: 'Technologie', categoryFr: 'Technologie' },
      { name: 'Amélioration Continue Lean Six Sigma', nameFr: 'Amélioration Continue Lean Six Sigma', category: 'Compétence', categoryFr: 'Compétence' },
      { name: 'Google Business Suite', nameFr: 'Google Business Suite', category: 'Technologie', categoryFr: 'Technologie' },
      { name: 'Gestion du changement', nameFr: 'Gestion du changement', category: 'Compétence', categoryFr: 'Compétence' },
      { name: 'SAP, SAS, AWS, Splunk, Datadog', nameFr: 'SAP, SAS, AWS, Splunk, Datadog', category: 'Technologie', categoryFr: 'Technologie' },
      { name: 'Planification stratégique', nameFr: 'Planification stratégique', category: 'Compétence', categoryFr: 'Compétence' },
      { name: 'Oracle NetSuite, Kafka Topic', nameFr: 'Oracle NetSuite, Kafka Topic', category: 'Technologie', categoryFr: 'Technologie' },
      { name: 'Communication interpersonnelle bilingue', nameFr: 'Communication interpersonnelle bilingue', category: 'Compétence', categoryFr: 'Compétence' },
      { name: 'Dassault Systèmes 3DS', nameFr: 'Dassault Systèmes 3DS', category: 'Technologie', categoryFr: 'Technologie' },
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
