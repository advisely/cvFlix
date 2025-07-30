

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
  const bnc = await prisma.company.create({ data: { name: 'Banque Nationale du Canada' } });
  const bombardier = await prisma.company.create({ data: { name: 'Bombardier' } });
  const cn = await prisma.company.create({ data: { name: 'CN (Canadian National)' } });
  const exo = await prisma.company.create({ data: { name: 'EXO (Réseau de transport métropolitain)' } });
  const bmo = await prisma.company.create({ data: { name: 'Banque de Montréal' } });
  const cibc = await prisma.company.create({ data: { name: 'Banque CIBC' } });
  const fct = await prisma.company.create({ data: { name: 'Services de titres FCT' } });
  const beyondTheRack = await prisma.company.create({ data: { name: 'Beyond the Rack' } });

  // Experiences
  await prisma.experience.createMany({
    data: [
      {
        title: 'Analyste d\'affaires principal - Domaine de paiement',
        startDate: new Date('2022-09-01'),
        description: 'Agir en tant qu\'analyste pluridisciplinaire (affaires, fonctionnel, QA) au sein de l\'équipe Payment Hub, axé sur la transformation de l\'écosystème des paiements.',
        companyId: bnc.id,
      },
      {
        title: 'Conseiller en processus d\'affaires',
        startDate: new Date('2015-07-01'),
        endDate: new Date('2016-08-01'),
        description: 'Conseiller la haute direction pour les initiatives stratégiques en tant que représentant officiel du service de gestion de la perception dans divers comités.',
        companyId: bnc.id,
      },
      {
        title: 'Analyste d\'affaires principal - Expérience Utilisateur',
        startDate: new Date('2022-08-01'),
        endDate: new Date('2022-11-01'),
        description: 'Agir en tant qu\'analyste hybride (affaires et fonctionnel) pour l\'amélioration de l\'expérience utilisateur et l\'innovation dans les outils de collaboration.',
        companyId: bombardier.id,
      },
      {
        title: 'Analyste d\'affaires principal',
        startDate: new Date('2020-09-01'),
        endDate: new Date('2021-09-01'),
        description: 'Agir en tant qu\'intégrateur de la solution Microsoft 365 (Office 365, SharePoint Online, Azure et Power Platform).',
        companyId: cn.id,
      },
      {
        title: 'Analyste d\'affaires principal',
        startDate: new Date('2019-05-01'),
        endDate: new Date('2020-08-01'),
        description: 'Agir en tant que représentant exo dans la livraison et réalisation des projets.',
        companyId: exo.id,
      },
      {
        title: 'Analyste d\'affaires et en gestion du changement principal',
        startDate: new Date('2016-08-01'),
        endDate: new Date('2017-10-01'),
        description: 'Agir comme membre de l\'équipe de gestion du changement du service de comptabilité et de réconciliation, formuler les orientations stratégiques et concevoir des processus simplifiés.',
        companyId: bmo.id,
      },
      {
        title: 'Spécialiste en affaires et opérations',
        startDate: new Date('2012-07-01'),
        endDate: new Date('2015-07-01'),
        description: 'Créer et exécuter les plans d\'action dans le but d\'améliorer les processus mis en place; assurer le succès des déploiements technologiques par le développement de stratégies de formation et encadrer des employés touchés par le changement.',
        companyId: cibc.id,
      },
      {
        title: 'Agent de titres',
        startDate: new Date('2009-03-01'),
        endDate: new Date('2010-11-01'),
        description: 'Rédaction et préparation des documents de refinancement hypothécaires.',
        companyId: fct.id,
      },
      {
        title: 'Analyste d\'affaires principal / spécialiste en application',
        startDate: new Date('2017-10-01'),
        endDate: new Date('2018-01-01'),
        description: 'Agir à titre de chef d\'équipe pour le projet Transformation.',
        companyId: beyondTheRack.id,
      },
    ],
  });

  // Education
  await prisma.education.createMany({
    data: [
      {
        institution: 'École de Commerce de Harvard, Boston, USA',
        degree: 'Stratégie Innovante',
        field: 'Commerce',
        startDate: new Date('2018-01-01'),
      },
      {
        institution: 'Université de Moncton, Moncton',
        degree: 'Maîtrise en gestion des affaires (MBA)',
        field: 'Gestion',
        startDate: new Date('2009-01-01'),
      },
      {
        institution: 'Université de Moncton, Moncton',
        degree: 'Diplôme en technologie de l\'information (TI)',
        field: 'Informatique',
        startDate: new Date('2007-01-01'),
      },
    ],
  });

  // Certifications
  await prisma.certification.createMany({
    data: [
      { name: 'Agile Scrum Master', issuer: 'CSM', issueDate: new Date('2018-01-01') },
      { name: 'Information Technology Infrastructure Library', issuer: 'ITIL Foundation', issueDate: new Date('2018-01-01') },
      { name: 'Robotic Process Automation', issuer: 'RPA Developer Foundation', issueDate: new Date('2018-01-01') },
      { name: 'IBM Blockchain Essentials', issuer: 'IBM', issueDate: new Date('2018-01-01') },
      { name: 'Six Sigma Professionnel – Ceinture noire', issuer: 'SSBBP', issueDate: new Date('2017-01-01') },
      { name: 'Qualifié en gestion des projets', issuer: 'PMQ', issueDate: new Date('2017-01-01') },
      { name: 'Certifié en gestion exécutive', issuer: 'EMC', issueDate: new Date('2016-01-01') },
      { name: 'Expert en marketing en ligne', issuer: 'CFE', issueDate: new Date('2014-01-01') },
      { name: 'Gestion des processus d\'affaires', issuer: 'HEC Montréal', issueDate: new Date('2015-01-01') },
      { name: 'Analyse d\'affaires et conception de solutions TI', issuer: 'HEC Montréal', issueDate: new Date('2014-01-01') },
      { name: 'Systèmes d\'information en gestion', issuer: 'HEC Montréal', issueDate: new Date('2014-01-01') },
    ],
  });

  // Skills
  await prisma.skill.createMany({
    data: [
      { name: 'Analyse d\'affaires', category: 'Compétence' },
      { name: 'Jira & Confluence', category: 'Technologie' },
      { name: 'Expertise bancaire et dans le transport', category: 'Compétence' },
      { name: 'MS Project & MS Visio aux normes BPMN', category: 'Technologie' },
      { name: 'Rédaction des requis d\'affaires', category: 'Compétence' },
      { name: 'MS Office 365 (Word, Excel, PowerPoint & Outlook)', category: 'Technologie' },
      { name: 'Gestion de projets agile', category: 'Compétence' },
      { name: 'Microsoft 365 (Teams, Planner, SharePoint, Azure)', category: 'Technologie' },
      { name: 'Amélioration Continue Lean Six Sigma', category: 'Compétence' },
      { name: 'Google Business Suite', category: 'Technologie' },
      { name: 'Gestion du changement', category: 'Compétence' },
      { name: 'SAP, SAS, AWS, Splunk, Datadog', category: 'Technologie' },
      { name: 'Planification stratégique', category: 'Compétence' },
      { name: 'Oracle NetSuite, Kafka Topic', category: 'Technologie' },
      { name: 'Communication interpersonnelle bilingue', category: 'Compétence' },
      { name: 'Dassault Systèmes 3DS', category: 'Technologie' },
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
