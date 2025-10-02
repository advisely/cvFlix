/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { MultiPeriodExperience } from '@/components/ExperienceCard'
import ExperienceCard from '@/components/ExperienceCard'
import { Carousel } from '@/components/Carousel'
import EducationCard from '@/components/EducationCard'
import CertificationCard from '@/components/CertificationCard'
import SkillCard from '@/components/SkillCard'
import ContributionCard from '@/components/ContributionCard'
import HighlightCardGrid from '@/components/HighlightCardGrid'
import SkeletonCarousel from '@/components/SkeletonCarousel'
import { Card } from 'antd'
import Footer from '@/components/Footer'
import MediaModal from '@/components/MediaModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { convertCompaniesToMultiPeriodExperiences, type CompanyWithExperiences } from '@/utils/experienceUtils'
import { useLanguage, getLocalizedText } from '@/contexts/LanguageContext';
import type { Company, Knowledge, Media } from '@prisma/client'
import dayjs from 'dayjs'

interface Highlight {
  id: string;
  title: string;
  titleFr: string;
  company: Company;
  description?: string | null;
  descriptionFr?: string | null;
  startDate: string;
  createdAt: string;
  media: Media[];
  homepageMedia?: Media[];
  cardMedia?: Media[];
}

interface Experience {
    id: string;
    title: string;
    titleFr: string;
    company: Company;
    description?: string | null;
    descriptionFr?: string | null;
    startDate: string;
    endDate?: string | null;
    companyId: string;
    createdAt: string;
    media: Media[];
    homepageMedia?: Media[];
    cardMedia?: Media[];
    dateRanges?: { id: string; startDate: string; endDate: string | null; isCurrent: boolean }[];
    formattedPeriods?: string;
}

interface NavbarConfig {
  id: string;
  logoText: string;
  logoTextFr: string;
  logoImageUrl: string | null;
  useImageLogo: boolean;
  workExperienceLabel: string;
  workExperienceLabelFr: string;
  careerSeriesLabel: string;
  careerSeriesLabelFr: string;
  knowledgeLabel: string;
  knowledgeLabelFr: string;
  backgroundColor: string;
  backgroundType: string;
  backgroundImageUrl: string | null;
  gradientFrom: string;
  gradientTo: string;
  fontFamily: string;
  logoFontFamily: string;
}

type KnowledgeWithMedia = Knowledge & { media: Media[] }

interface Contribution {
  id: string
  title: string
  titleFr: string | null
  organization: string | null
  organizationFr: string | null
  role: string | null
  roleFr: string | null
  description: string | null
  descriptionFr: string | null
  type: string
  impact: string | null
  impactFr: string | null
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  url: string | null
  downloadUrl: string | null
  thumbnailUrl: string | null
  displayOrder: number | null
  media: Media[]
}

interface RecommendedBook {
  id: string
  title: string
  titleFr: string | null
  author: string
  authorFr: string | null
  summary: string | null
  summaryFr: string | null
  recommendedReason: string | null
  recommendedReasonFr: string | null
  purchaseUrl: string | null
  priority: number
  coverImageUrl: string | null
  media: Media[]
}

type HomeResponse = {
  portfolioExperiences: CompanyWithExperiences[]
  educations: KnowledgeWithMedia[]
  certifications: KnowledgeWithMedia[]
  skills: KnowledgeWithMedia[]
  highlights: Highlight[]
  contributions: Contribution[]
  recommendedBooks: RecommendedBook[]
  navbarConfig: NavbarConfig
}

const DEFAULT_HOME_DATA: HomeResponse = {
  portfolioExperiences: [],
  educations: [],
  certifications: [],
  skills: [],
  highlights: [],
  contributions: [],
  recommendedBooks: [],
  navbarConfig: {
    id: '',
    logoText: 'resumeflex',
    logoTextFr: 'resumeflex',
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
}

const AUTO_REFRESH_INTERVAL_MS = 60_000

export default function Home() {
  const { language } = useLanguage();

  const [data, setData] = useState<HomeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<MultiPeriodExperience | null>(null);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [multiPeriodExperiences, setMultiPeriodExperiences] = useState<MultiPeriodExperience[]>([]);

  const fetchData = useCallback(async ({ showSpinner = false } = {}) => {
    try {
      if (showSpinner) {
        setLoading(true)
      }
      setError(null)

      const response = await fetch('/api/data', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to fetch homepage data')
      }
      const payload = (await response.json()) as Partial<HomeResponse>
      setData({
        ...DEFAULT_HOME_DATA,
        ...payload,
        portfolioExperiences: (payload.portfolioExperiences ?? DEFAULT_HOME_DATA.portfolioExperiences) as CompanyWithExperiences[],
        educations: payload.educations ?? DEFAULT_HOME_DATA.educations,
        certifications: payload.certifications ?? DEFAULT_HOME_DATA.certifications,
        skills: payload.skills ?? DEFAULT_HOME_DATA.skills,
        highlights: payload.highlights ?? DEFAULT_HOME_DATA.highlights,
        contributions: payload.contributions ?? DEFAULT_HOME_DATA.contributions,
        recommendedBooks: payload.recommendedBooks ?? DEFAULT_HOME_DATA.recommendedBooks,
        navbarConfig: payload.navbarConfig ?? DEFAULT_HOME_DATA.navbarConfig,
      })
    } catch (err) {
      console.error('Failed to fetch homepage data:', err)
      setError(err as Error)
      setData({ ...DEFAULT_HOME_DATA })
    } finally {
      if (showSpinner) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void fetchData({ showSpinner: true })
  }, [fetchData])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchData()
      }
    }

    const handleOnline = () => {
      if (navigator.onLine) {
        void fetchData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)

    let intervalId: number | undefined
    if (AUTO_REFRESH_INTERVAL_MS > 0) {
      intervalId = window.setInterval(() => {
        void fetchData()
      }, AUTO_REFRESH_INTERVAL_MS)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [fetchData])

  const resolvedData = data ?? DEFAULT_HOME_DATA

  // Process portfolio experiences into multi-period format
  useEffect(() => {
    if (resolvedData.portfolioExperiences) {
      const multiPeriod = convertCompaniesToMultiPeriodExperiences(resolvedData.portfolioExperiences);
      setMultiPeriodExperiences(multiPeriod);
    }
  }, [resolvedData.portfolioExperiences]);

  if (loading && !data) {
    return (
      <main className="bg-[#141414] text-white min-h-screen">
        <div className="p-4 md:p-8">
          <div className="h-12 bg-[#404040] rounded mb-8 w-1/4 animate-pulse"></div>
          <SkeletonCarousel title="Portfolio" cardType="movie" count={3} />
          <SkeletonCarousel title="Education" cardType="education" count={2} />
          <SkeletonCarousel title="Certifications" cardType="certification" count={2} />
          <SkeletonCarousel title="Skills" cardType="skill" count={3} />
          <SkeletonCarousel title="Contributions" cardType="contribution" count={3} />
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="bg-[#141414] text-white min-h-screen">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-[#e50914]">resumeflex</h1>
          <p className="text-[#808080]">Failed to load data. Please try again later.</p>
        </div>
      </main>
    );
  }

  const { educations, certifications, skills, highlights, contributions, recommendedBooks, navbarConfig } = resolvedData;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getBackgroundStyle = () => {
    if (!navbarConfig) {
      return { backgroundColor: '#141414' }; // Default background
    }

    switch (navbarConfig.backgroundType) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${navbarConfig.gradientFrom}, ${navbarConfig.gradientTo})`
        };
      case 'image':
        return navbarConfig.backgroundImageUrl ? {
          backgroundImage: `url(${navbarConfig.backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : { backgroundColor: navbarConfig.backgroundColor };
      default:
        return { backgroundColor: navbarConfig.backgroundColor };
    }
  };

  return (
    <main
      className="text-white min-h-screen"
      style={{
        ...getBackgroundStyle(),
        fontFamily: navbarConfig.fontFamily
      }}
    >
      <div className="p-4 md:p-8">
        <header className="mb-8 p-4 bg-transparent">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-shrink-0">
              {navbarConfig.useImageLogo && navbarConfig.logoImageUrl ? (
                <Image
                  src={navbarConfig.logoImageUrl}
                  alt={navbarConfig.logoText}
                  width={200}
                  height={48}
                  className="h-8 md:h-12 w-auto"
                  priority
                />
              ) : (
                <h1
                  className="text-2xl md:text-4xl font-bold text-[#e50914]"
                  style={{ fontFamily: navbarConfig.logoFontFamily }}
                >
                  {navbarConfig.logoText}
                </h1>
              )}
            </div>

            <nav className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
                <ul className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-end">
                  <li>
                    <button
                      onClick={() => scrollToSection('work-experience')}
                      className="text-white hover:text-[#e50914] transition-colors duration-200 font-medium"
                    >
                      {getLocalizedText(navbarConfig.workExperienceLabel, navbarConfig.workExperienceLabelFr, language)}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('knowledge')}
                      className="text-white hover:text-[#e50914] transition-colors duration-200 font-medium"
                    >
                      {getLocalizedText(navbarConfig.knowledgeLabel, navbarConfig.knowledgeLabelFr, language)}
                    </button>
                  </li>
                </ul>
                <LanguageSwitcher variant="navbar" />
              </div>
            </nav>
          </div>
        </header>

        {highlights && highlights.length > 0 && (
          <div className="mb-12">
            <div
              className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden rounded-lg group cursor-pointer"
              onClick={() => {
                if (isHighlightModalOpen) return;
                setSelectedHighlight(highlights[0]);
                setIsHighlightModalOpen(true);
              }}
            >
              {(() => {
                const homepageImage = highlights[0].homepageMedia?.[0];
                if (homepageImage && homepageImage.type === 'image') {
                  return (
                    <Image
                      src={homepageImage.url}
                      alt={highlights[0].title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                  );
                }
                return (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#333] to-[#111] flex items-center justify-center">
                    <div className="text-center text-white/60">
                      <div className="text-4xl mb-2">🎬</div>
                      <div className="text-sm">No homepage image available</div>
                    </div>
                  </div>
                );
              })()}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="text-white">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                    {getLocalizedText(highlights[0].title, highlights[0].titleFr, language)}
                  </h2>
                  <div className="flex items-center gap-2 mb-2">
                    {highlights[0].company.logoUrl && (
                      <img
                        src={highlights[0].company.logoUrl}
                        alt={`${highlights[0].company.name} logo`}
                        className="object-contain rounded-sm shadow-sm"
                        style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    <p className="text-lg md:text-xl font-semibold text-[#e50914]">
                      {getLocalizedText(highlights[0].company.name, highlights[0].company.nameFr, language)}
                    </p>
                  </div>
                  {/* Removed year display from hero section - keeping clean presentation */}
                </div>
              </div>

              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        )}

        {highlights && highlights.length > 1 && (
          <HighlightCardGrid
            highlights={highlights.slice(1)}
            title="Featured Highlights"
            variant="default"
            showActions={true}
            gridProps={{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 4 }}
            onCardClick={() => {
              // Highlight interaction handled by grid component
            }}
          />
        )}

        <div id="work-experience" className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">{getLocalizedText(navbarConfig.workExperienceLabel, navbarConfig.workExperienceLabelFr, language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {multiPeriodExperiences.map((experience) => (
              <div key={experience.id}>
                <ExperienceCard
                  experience={experience}
                  variant="detailed"
                  showTimeline={false}
                  maxTimelineRanges={3}
                  onClick={() => {
                    setSelectedExperience(experience)
                    setIsExperienceModalOpen(true)
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {contributions.length > 0 && (
          <section id="contributions" className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-xl md:text-2xl font-bold">
                {language === 'fr' ? 'Contributions' : 'Contributions'}
              </h2>
              <p className="text-sm text-white/70 max-w-2xl">
                {language === 'fr'
                  ? 'Une sélection de contributions open source, corporatives et communautaires qui démontrent un engagement continu.'
                  : 'A curated set of open-source, corporate, and community contributions showcasing ongoing impact.'}
              </p>
            </div>

            <Carousel>
              {contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2"
                >
                  <ContributionCard
                    contribution={contribution}
                    onSelect={() => {
                      setSelectedContribution(contribution);
                      setIsContributionModalOpen(true);
                    }}
                  />
                </div>
              ))}
            </Carousel>
          </section>
        )}

        {recommendedBooks.length > 0 && (
          <section id="recommended-books" className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-xl md:text-2xl font-bold">
                {language === 'fr' ? 'Livres recommandés' : 'Recommended Books'}
              </h2>
              <p className="text-sm text-white/70 max-w-2xl">
                {language === 'fr'
                  ? 'Une sélection de lectures qui complètent le portefeuille professionnel.'
                  : 'A curated list of reads that complement the professional portfolio.'}
              </p>
            </div>

            <Carousel>
              {recommendedBooks.map((book) => {
                const coverImage = book.coverImageUrl ?? (book.media?.[0]?.url ?? null)

                return (
                  <div key={book.id} className="flex-[0_0_auto] p-3">
                    <div className="mx-auto w-[320px] sm:w-[360px]">
                      <Card
                        className="bg-gradient-to-br from-[#1b1b1b] via-[#202020] to-[#242424] border border-white/10 text-white shadow-lg h-full overflow-hidden"
                        data-testid="recommended-book-card"
                        styles={{ body: { padding: 0 } }}
                      >
                        <div className="flex flex-col h-full">
                          <div className="relative w-full aspect-[2/3] bg-[#111111]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {coverImage ? (
                              <img
                                src={coverImage}
                                alt={getLocalizedText(book.title, book.titleFr, language)}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm tracking-[0.22em] uppercase">
                                {language === 'fr' ? 'Aucune image' : 'No cover available'}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-3 px-5 py-4 bg-gradient-to-b from-transparent via-[#1c1c1c] to-[#181818]">
                            <header className="space-y-2">
                              <h3 className="text-lg font-bold leading-tight line-clamp-2">
                                {getLocalizedText(book.title, book.titleFr, language)}
                              </h3>
                              <p className="text-xs text-[#e50914] font-semibold uppercase tracking-[0.22em]">
                                {getLocalizedText(book.author, book.authorFr, language)}
                              </p>
                            </header>

                            {book.summary && (
                              <p className="text-sm text-white/70 leading-relaxed line-clamp-4">
                                {getLocalizedText(book.summary, book.summaryFr, language)}
                              </p>
                            )}

                            <div className="mt-auto flex items-center justify-between text-[0.7rem] uppercase tracking-wide text-white/60">
                              <span className="rounded-md bg-white/10 px-3 py-1 font-semibold">#{book.priority}</span>
                              {book.purchaseUrl && (
                                <a
                                  href={book.purchaseUrl}
                                  className="text-[#e50914] hover:text-white transition-colors font-semibold"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {language === 'fr' ? 'Acheter' : 'Buy'}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )
              })}
            </Carousel>
          </section>
        )}

        <div id="knowledge" className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            {getLocalizedText(navbarConfig.knowledgeLabel, navbarConfig.knowledgeLabelFr, language)}
          </h2>

          {educations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg md:text-xl font-semibold mb-3">{language === 'fr' ? 'Éducation' : 'Education'}</h3>
              <Carousel>
                {educations.map((education) => (
                  <div key={education.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                    <EducationCard education={education} />
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          {certifications.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg md:text-xl font-semibold mb-3">{language === 'fr' ? 'Certifications' : 'Certifications'}</h3>
              {certifications.length > 0 && (
                <Carousel>
                  {certifications.map((certification) => (
                    <div key={certification.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                      <CertificationCard certification={certification} />
                    </div>
                  ))}
                </Carousel>
              )}
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-3">{language === 'fr' ? 'Compétences' : 'Skills'}</h3>
              {skills.length > 0 && (
                <Carousel>
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                      <SkillCard skill={skill} />
                    </div>
                  ))}
                </Carousel>
              )}
            </div>
          )}
        </div>

      </div>

      <Footer />
      {selectedHighlight && selectedHighlight.cardMedia?.[0] && (
        <MediaModal
          isVisible={isHighlightModalOpen}
          onClose={() => {
            setIsHighlightModalOpen(false);
          }}
          media={selectedHighlight.cardMedia[0]}
          highlightTitle={getLocalizedText(selectedHighlight.title, selectedHighlight.titleFr, language)}
          company={getLocalizedText(selectedHighlight.company.name, selectedHighlight.company.nameFr, language)}
          description={getLocalizedText(selectedHighlight.description, selectedHighlight.descriptionFr, language)}
          startDate={selectedHighlight.startDate}
        />
      )}

      {selectedExperience && (
        (() => {
          const mediaSource = selectedExperience.cardMedia?.[0] ?? selectedExperience.media?.[0] ?? selectedExperience.homepageMedia?.[0]

          if (!mediaSource) {
            return null
          }

          return (
            <MediaModal
              isVisible={isExperienceModalOpen}
              onClose={() => {
                setIsExperienceModalOpen(false);
                setSelectedExperience(null);
              }}
              media={mediaSource}
              highlightTitle={selectedExperience.title}
              company={selectedExperience.company.name}
              description={selectedExperience.description}
              startDate={selectedExperience.earliestStartDate}
              endDate={selectedExperience.latestEndDate}
              dateRanges={selectedExperience.dateRanges?.map((range) => ({
                id: range.id,
                startDate: range.startDate,
                endDate: range.endDate ?? null,
                isCurrent: range.isCurrent ?? false,
              }))}
              formattedPeriods={selectedExperience.formattedPeriods}
            />
          )
        })()
      )}

      {selectedContribution && selectedContribution.media?.[0] && (
        <MediaModal
          isVisible={isContributionModalOpen}
          onClose={() => {
            setIsContributionModalOpen(false)
            setSelectedContribution(null)
          }}
          media={selectedContribution.media[0]}
          highlightTitle={getLocalizedText(selectedContribution.title, selectedContribution.titleFr, language)}
          company={getLocalizedText(selectedContribution.organization, selectedContribution.organizationFr, language) ?? undefined}
          description={getLocalizedText(selectedContribution.description, selectedContribution.descriptionFr, language) ?? undefined}
          startDate={selectedContribution.startDate ?? undefined}
          endDate={selectedContribution.endDate ?? undefined}
        />
      )}

    </main>
  );
}

const TooltipContent = ({ text }: { text: string }) => {
  const truncated = text.length > 120 ? `${text.slice(0, 117)}...` : text
  return <p className="text-sm text-gray-700">{truncated}</p>
}
