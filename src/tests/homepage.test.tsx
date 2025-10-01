import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import { vi, describe, it, expect, afterEach } from 'vitest';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string | { src: string }; alt: string }) => (
    <img src={typeof src === 'string' ? src : src?.src ?? ''} alt={alt} />
  ),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', setLanguage: vi.fn(), t: (key: string) => key }),
  getLocalizedText: (english: string | null | undefined, french: string | null | undefined, language: 'en' | 'fr') => {
    if (language === 'fr') {
      return french ?? english ?? '';
    }
    return english ?? french ?? '';
  },
}));

vi.mock('@/components/ExperienceCard', () => ({
  __esModule: true,
  default: ({ experience }: { experience: { title: string } }) => (
    <div data-testid="experience-card">{experience.title}</div>
  ),
}));

vi.mock('@/components/HighlightCardGrid', () => ({
  __esModule: true,
  default: ({ title, highlights }: { title: string; highlights: unknown[] }) => (
    <section>
      <h3>{title}</h3>
      <span data-testid="highlight-count">{highlights.length}</span>
    </section>
  ),
}));

vi.mock('@/components/Carousel', () => ({
  __esModule: true,
  Carousel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="carousel">{children}</div>
  ),
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="carousel">{children}</div>
  ),
}));

vi.mock('@/components/EducationCard', () => ({
  __esModule: true,
  default: ({ education }: { education: { title: string } }) => (
    <div data-testid="education-card">{education.title}</div>
  ),
}));

vi.mock('@/components/CertificationCard', () => ({
  __esModule: true,
  default: ({ certification }: { certification: { title: string } }) => (
    <div data-testid="certification-card">{certification.title}</div>
  ),
}));

vi.mock('@/components/SkillCard', () => ({
  __esModule: true,
  default: ({ skill }: { skill: { title: string } }) => (
    <div data-testid="skill-card">{skill.title}</div>
  ),
}));

vi.mock('@/components/MediaModal', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('@/components/Footer', () => ({
  __esModule: true,
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  __esModule: true,
  default: () => <button data-testid="language-switcher">Language</button>,
}));

vi.mock('@/components/SkeletonCarousel', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => (
    <div data-testid={`skeleton-${title}`}>{title}</div>
  ),
}));

const createMockHomeResponse = () => ({
  portfolioExperiences: [
    {
      id: 'company-1',
      name: 'Tech Corp',
      nameFr: 'Tech Corp FR',
      logoUrl: 'https://example.com/logo.png',
      experiences: [
        {
          id: 'experience-1',
          title: 'Senior Engineer',
          titleFr: 'Ingénieur Senior',
          description: 'Built platform',
          descriptionFr: 'Plateforme construite',
          startDate: '2020-01-01T00:00:00.000Z',
          endDate: null,
          companyId: 'company-1',
          company: {
            id: 'company-1',
            name: 'Tech Corp',
            nameFr: 'Tech Corp FR',
            logoUrl: 'https://example.com/logo.png',
          },
          cardMedia: [],
          homepageMedia: [],
          media: [],
          dateRanges: [
            {
              id: 'range-1',
              startDate: '2020-01-01T00:00:00.000Z',
              endDate: null,
            },
          ],
          createdAt: '2020-01-01T00:00:00.000Z',
        },
      ],
    },
  ],
  educations: [
    {
      id: 'edu-1',
      kind: 'EDUCATION',
      title: 'BSc Computer Science',
      titleFr: 'Licence Informatique',
      issuer: 'University',
      issuerFr: 'Université',
      category: 'Computer Science',
      categoryFr: 'Informatique',
      description: 'Studied CS',
      descriptionFr: 'Étudié informatique',
      competencyLevel: null,
      startDate: '2014-09-01T00:00:00.000Z',
      endDate: '2018-06-30T00:00:00.000Z',
      validUntil: null,
      isCurrent: false,
      url: null,
      location: null,
      media: [
        {
          id: 'media-edu-1',
          url: 'https://example.com/edu.jpg',
          type: 'image',
        },
      ],
      createdAt: '2014-09-01T00:00:00.000Z',
      updatedAt: '2018-06-30T00:00:00.000Z',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      kind: 'CERTIFICATION',
      title: 'AWS Certified',
      titleFr: 'Certifié AWS',
      issuer: 'AWS',
      issuerFr: 'AWS',
      category: 'Cloud',
      categoryFr: 'Nuage',
      description: 'Cloud certification',
      descriptionFr: 'Certification cloud',
      competencyLevel: null,
      startDate: '2019-01-01T00:00:00.000Z',
      endDate: '2021-01-01T00:00:00.000Z',
      validUntil: null,
      isCurrent: false,
      url: null,
      location: null,
      media: [
        {
          id: 'media-cert-1',
          url: 'https://example.com/cert.jpg',
          type: 'image',
        },
      ],
      createdAt: '2019-01-01T00:00:00.000Z',
      updatedAt: '2021-01-01T00:00:00.000Z',
    },
  ],
  skills: [
    {
      id: 'skill-1',
      kind: 'SKILL',
      title: 'TypeScript',
      titleFr: 'TypeScript',
      issuer: null,
      issuerFr: null,
      category: 'Programming',
      categoryFr: 'Programmation',
      description: null,
      descriptionFr: null,
      competencyLevel: 'ADVANCED',
      startDate: null,
      endDate: null,
      validUntil: null,
      isCurrent: true,
      url: null,
      location: null,
      media: [
        {
          id: 'media-skill-1',
          url: 'https://example.com/skill.jpg',
          type: 'image',
        },
      ],
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  contributions: [
    {
      id: 'contrib-1',
      title: 'Open Source CLI',
      titleFr: 'CLI Open Source',
      organization: 'advisely',
      organizationFr: 'advisely',
      role: 'Maintainer',
      roleFr: 'Mainteneur',
      description: 'Published internal tooling.',
      descriptionFr: 'Outils internes publiés.',
      type: 'OPEN_SOURCE',
      impact: 'Used by 5 teams',
      impactFr: 'Utilisé par 5 équipes',
      startDate: '2023-01-01T00:00:00.000Z',
      endDate: null,
      isCurrent: true,
      url: 'https://example.com',
      downloadUrl: null,
      thumbnailUrl: null,
      displayOrder: 1,
      media: [
        {
          id: 'media-contrib-hero',
          url: 'https://example.com/contrib.jpg',
          type: 'image',
        },
      ],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  highlights: [
    {
      id: 'highlight-hero',
      title: 'Key Achievement',
      titleFr: 'Réussite clé',
      description: 'Created a major feature',
      descriptionFr: 'Créé une fonctionnalité majeure',
      startDate: '2023-01-01T00:00:00.000Z',
      createdAt: '2023-01-01T00:00:00.000Z',
      media: [],
      homepageMedia: [
        {
          id: 'media-highlight-hero',
          url: 'https://example.com/highlight.jpg',
          type: 'image',
        },
      ],
      cardMedia: [
        {
          id: 'media-highlight-card',
          url: 'https://example.com/highlight-card.jpg',
          type: 'image',
        },
      ],
      company: {
        id: 'company-1',
        name: 'Tech Corp',
        nameFr: 'Tech Corp FR',
        logoUrl: 'https://example.com/logo.png',
      },
    },
    {
      id: 'highlight-secondary',
      title: 'Another Win',
      titleFr: 'Autre succès',
      description: 'Improved conversions',
      descriptionFr: 'Conversions améliorées',
      startDate: '2022-06-01T00:00:00.000Z',
      createdAt: '2022-06-01T00:00:00.000Z',
      media: [],
      cardMedia: [],
      company: {
        id: 'company-2',
        name: 'Biz LLC',
        nameFr: 'Biz LLC FR',
        logoUrl: null,
      },
    },
  ],
  recommendedBooks: [],
  navbarConfig: {
    id: 'nav-1',
    logoText: 'resumeflex',
    logoTextFr: 'resumeflex FR',
    logoImageUrl: null,
    useImageLogo: false,
    workExperienceLabel: 'Portfolio',
    workExperienceLabelFr: 'Portfolio',
    careerSeriesLabel: 'Career Series',
    careerSeriesLabelFr: 'Série de carrière',
    knowledgeLabel: 'Knowledge',
    knowledgeLabelFr: 'Connaissances',
    backgroundColor: '#141414',
    backgroundType: 'color',
    backgroundImageUrl: null,
    gradientFrom: '#141414',
    gradientTo: '#1a1a1a',
    fontFamily: 'Inter',
    logoFontFamily: 'Inter',
  },
});

describe('Home page', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // Vitest cleanup hook already clears the DOM
    delete (globalThis as { fetch?: unknown }).fetch;
  });

  it('renders skeletons before data loads and then displays homepage sections', async () => {
    const deferred = createDeferred<Response>();

    (globalThis as { fetch?: unknown }).fetch = vi.fn(() => deferred.promise) as unknown as typeof fetch;

    render(<Home />);

    expect(screen.getByTestId('skeleton-Portfolio')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-Education')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-Certifications')).toBeInTheDocument();

    deferred.resolve({
      ok: true,
      json: async () => createMockHomeResponse(),
    } as Response);

    await waitFor(() => {
      expect(screen.getByText('resumeflex')).toBeInTheDocument();
    });

    expect(screen.getByText('Featured Highlights')).toBeInTheDocument();
    expect(screen.getByTestId('highlight-count')).toHaveTextContent('1');

    const experienceCards = await screen.findAllByTestId('experience-card');
    const educationCards = await screen.findAllByTestId('education-card');
    const certificationCards = await screen.findAllByTestId('certification-card');
    const skillCards = await screen.findAllByTestId('skill-card');
    const contributionCards = await screen.findAllByTestId('contribution-card');

    expect(experienceCards).toHaveLength(1);
    expect(educationCards).toHaveLength(1);
    expect(certificationCards).toHaveLength(1);
    expect(skillCards).toHaveLength(1);
    expect(contributionCards).toHaveLength(1);
    expect(screen.getByText('Contributions')).toBeInTheDocument();
    expect(screen.getByText('Open Source CLI')).toBeInTheDocument();
    expect(screen.getByText('Used by 5 teams')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders default layout when API returns empty data', async () => {
    (globalThis as { fetch?: unknown }).fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        portfolioExperiences: [],
        educations: [],
        certifications: [],
        skills: [],
        highlights: [],
        contributions: [],
        recommendedBooks: [],
        navbarConfig: createMockHomeResponse().navbarConfig,
      }),
    })) as unknown as typeof fetch;

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('resumeflex')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('experience-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('highlight-count')).not.toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.queryByTestId('contribution-card')).not.toBeInTheDocument();
  });
});
