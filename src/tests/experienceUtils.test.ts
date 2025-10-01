import { describe, it, expect } from 'vitest';
import type { Media } from '@prisma/client';
import {
  convertCompaniesToMultiPeriodExperiences,
  convertToMultiPeriodExperience,
  sortExperiences,
  getExperienceStats,
  type CompanyWithExperiences,
} from '@/utils/experienceUtils';

const createMedia = (overrides: Partial<Media> = {}): Media => ({
  id: overrides.id ?? 'media-1',
  url: overrides.url ?? 'https://example.com/media.jpg',
  type: overrides.type ?? 'image',
  experienceId: overrides.experienceId ?? null,
  experienceHomepageId: overrides.experienceHomepageId ?? null,
  experienceCardId: overrides.experienceCardId ?? null,
  knowledgeId: overrides.knowledgeId ?? null,
  highlightId: overrides.highlightId ?? null,
  highlightHomepageId: overrides.highlightHomepageId ?? null,
  highlightCardId: overrides.highlightCardId ?? null,
  createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00.000Z'),
});

describe('experienceUtils', () => {
  const company: CompanyWithExperiences = {
    id: 'company-1',
    name: 'Tech Corp',
    nameFr: 'Tech Corp FR',
    logoUrl: 'https://example.com/logo.png',
    experiences: [
      {
        id: 'exp-1',
        title: 'Senior Engineer',
        titleFr: 'Ingénieur Senior',
        startDate: '2020-01-01T00:00:00.000Z',
        endDate: '2020-12-31T00:00:00.000Z',
        description: 'Delivered platform',
        descriptionFr: 'Plateforme livrée',
        companyId: 'company-1',
        media: [createMedia({ id: 'media-exp-1' })],
        homepageMedia: [createMedia({ id: 'media-exp-homepage' })],
        cardMedia: [createMedia({ id: 'media-exp-card' })],
        dateRanges: [
          {
            id: 'range-1',
            startDate: '2020-01-01T00:00:00.000Z',
            endDate: '2020-12-31T00:00:00.000Z',
          },
        ],
        createdAt: '2020-01-01T00:00:00.000Z',
      },
      {
        id: 'exp-2',
        title: 'Lead Engineer',
        titleFr: 'Ingénieur Principal',
        startDate: '2021-01-01T00:00:00.000Z',
        endDate: null,
        description: 'Lead initiatives',
        descriptionFr: 'Dirigé des initiatives',
        companyId: 'company-1',
        media: [],
        homepageMedia: [],
        cardMedia: [],
        dateRanges: [
          {
            id: 'range-2',
            startDate: '2021-01-01T00:00:00.000Z',
            endDate: null,
          },
        ],
        createdAt: '2021-01-01T00:00:00.000Z',
      },
    ],
  };

  it('converts company experiences into multi-period experience aggregate', () => {
    const result = convertToMultiPeriodExperience(company);

    expect(result.company).toEqual({
      id: 'company-1',
      name: 'Tech Corp',
      nameFr: 'Tech Corp FR',
      logoUrl: 'https://example.com/logo.png',
    });
    expect(result.dateRanges).toHaveLength(2);
    expect(result.media).toHaveLength(1);
    expect(result.homepageMedia).toHaveLength(1);
    expect(result.cardMedia).toHaveLength(1);
    expect(result.isCurrentPosition).toBe(true);
    expect(result.earliestStartDate).toBe('2020-01-01T00:00:00.000Z');
    expect(result.latestEndDate).toBe('2020-12-31T00:00:00.000Z');
    expect(result.formattedPeriods).toBe('2019 - 2020');
  });

  it('converts array of companies and sorts by most recent start date', () => {
    const otherCompany: CompanyWithExperiences = {
      id: 'company-2',
      name: 'Biz LLC',
      nameFr: 'Biz LLC FR',
      logoUrl: null,
      experiences: [
        {
          id: 'exp-3',
          title: 'Developer',
          titleFr: 'Développeur',
          startDate: '2018-01-01T00:00:00.000Z',
          endDate: '2019-01-01T00:00:00.000Z',
          description: 'Built features',
          descriptionFr: 'Fonctionnalités développées',
          companyId: 'company-2',
          media: [],
          homepageMedia: [],
          cardMedia: [],
          createdAt: '2018-01-01T00:00:00.000Z',
        },
      ],
    };

    const results = convertCompaniesToMultiPeriodExperiences([company, otherCompany]);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('exp-2');
    expect(results[1].id).toBe('exp-3');
  });

  it('sorts experiences according to different strategies', () => {
    const experiences = convertCompaniesToMultiPeriodExperiences([company]);
    const base = [...experiences];

    const latestEnd = sortExperiences([...base], 'latestEnd');
    expect(latestEnd[0].id).toBe('exp-2');

    const currentFirst = sortExperiences([...base], 'currentFirst');
    expect(currentFirst[0].isCurrentPosition).toBe(true);

    const multiPeriodFirst = sortExperiences([...base], 'multiPeriodFirst');
    expect(multiPeriodFirst[0].dateRanges.length).toBeGreaterThan(0);
  });

  it('computes aggregate statistics for experiences', () => {
    const experiences = convertCompaniesToMultiPeriodExperiences([company]);
    const stats = getExperienceStats(experiences);

    expect(stats.totalExperiences).toBe(1);
    expect(stats.currentPositions).toBe(1);
    expect(stats.multiPeriodExperiences).toBe(1);
    expect(stats.totalYearsExperience).toBeGreaterThan(0);
    expect(stats.averageExperienceLength).toBeGreaterThan(0);
  });
});
