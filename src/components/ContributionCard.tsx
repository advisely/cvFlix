"use client";

import { useMemo } from 'react';
import { getLocalizedText, useLanguage } from '@/contexts/LanguageContext';

type ContributionMedia = {
  id: string;
  url: string;
  type: string;
};

type ContributionCardProps = {
  contribution: {
    id: string;
    title: string;
    titleFr: string | null;
    organization: string | null;
    organizationFr: string | null;
    role: string | null;
    roleFr: string | null;
    description: string | null;
    descriptionFr: string | null;
    type: string;
    impact: string | null;
    impactFr: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    media?: ContributionMedia[];
  };
  onSelect?: () => void;
};

const formatYearRange = (startDate: string | null, endDate: string | null, isCurrent: boolean) => {
  if (!startDate) {
    return isCurrent ? 'Present' : '—';
  }

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return isCurrent ? 'Present' : '—';
  }

  const startYear = start.getFullYear();

  if (isCurrent) {
    return `${startYear} – Present`;
  }

  if (!endDate) {
    return `${startYear}`;
  }

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) {
    return `${startYear}`;
  }

  const endYear = end.getFullYear();
  return startYear === endYear ? `${startYear}` : `${startYear} – ${endYear}`;
};

const typeColors: Record<string, string> = {
  OPEN_SOURCE: '#e50914',
  CORPORATE: '#2563eb',
  COMMUNITY: '#059669',
  RESEARCH: '#9333ea',
  THOUGHT_LEADERSHIP: '#f59e0b',
};

const ContributionCard = ({ contribution, onSelect }: ContributionCardProps) => {
  const { language } = useLanguage();

  const localizedTitle = getLocalizedText(contribution.title, contribution.titleFr, language);
  const localizedOrganization = getLocalizedText(
    contribution.organization,
    contribution.organizationFr,
    language,
  );
  const localizedRole = getLocalizedText(contribution.role, contribution.roleFr, language);
  const localizedImpact = getLocalizedText(contribution.impact, contribution.impactFr, language);

  const bannerMedia = useMemo(() => contribution.media?.find((item) => item.type === 'image'), [
    contribution.media,
  ]);

  const typeTag = contribution.type ?? 'OPEN_SOURCE';
  const tagColor = typeColors[typeTag] ?? '#e50914';

  const timeframe = formatYearRange(contribution.startDate, contribution.endDate, contribution.isCurrent);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.();
        }
      }}
      className="bg-[#303030] border border-[#404040] rounded-lg overflow-hidden shadow-lg transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
      data-testid="contribution-card"
    >
      <div className="w-full h-48 bg-[#141414] flex items-center justify-center relative">
        {bannerMedia ? (
          <img
            src={bannerMedia.url}
            alt={localizedTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-[#808080] text-3xl font-bold uppercase tracking-wider">
            {localizedTitle.charAt(0)}
          </span>
        )}
        <span
          className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold uppercase rounded-full"
          style={{ backgroundColor: `${tagColor}dd` }}
        >
          {typeTag.replace('_', ' ')}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <header className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">{localizedTitle}</h3>
          {localizedOrganization && (
            <p className="text-sm text-[#e50914] font-semibold leading-tight line-clamp-1">
              {localizedOrganization}
            </p>
          )}
        </header>

        {localizedRole && (
          <p className="text-sm text-white/80 line-clamp-2">{localizedRole}</p>
        )}

        <p className="text-xs uppercase tracking-wide text-[#808080]">{timeframe}</p>

        {localizedImpact && (
          <p className="text-sm text-white/70 line-clamp-3">{localizedImpact}</p>
        )}
      </div>
    </article>
  );
};

export default ContributionCard;
