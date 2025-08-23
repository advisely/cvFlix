/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ExperienceCard from '@/components/ExperienceCard'
import { Carousel } from '@/components/Carousel'
import EducationCard from '@/components/EducationCard'
import CertificationCard from '@/components/CertificationCard'
import SkillCard from '@/components/SkillCard'
import HighlightCardGrid from '@/components/HighlightCardGrid'
import SkeletonCarousel from '@/components/SkeletonCarousel'
import Footer from '@/components/Footer'
import MediaModal from '@/components/MediaModal';
import type { Company, Education, Certification, Skill, Media } from '@prisma/client'

interface Highlight {
  id: string;
  title: string;
  company: string;
  description?: string | null;
  startDate: string;
  createdAt: string;
  media: Media[];
  homepageMedia?: Media[];
  cardMedia?: Media[];
}

interface Experience {
    id: string;
    title: string;
    company: Company;
    description?: string | null;
    startDate: string;
    endDate?: string | null;
    createdAt: string;
    media: Media[];
    homepageMedia?: Media[];
    cardMedia?: Media[];
}

interface NavbarConfig {
  id: string;
  logoText: string;
  logoImageUrl: string | null;
  useImageLogo: boolean;
  workExperienceLabel: string;
  careerSeriesLabel: string;
  educationLabel: string;
  certificationsLabel: string;
  skillsLabel: string;
  backgroundColor: string;
  backgroundType: string;
  backgroundImageUrl: string | null;
  gradientFrom: string;
  gradientTo: string;
  fontFamily: string;
  logoFontFamily: string;
}

export default function Home() {
  const [data, setData] = useState<{
    portfolioExperiences: (Company & { experiences: Experience[] })[];
    educations: (Education & { media: Media[] })[];
    certifications: (Certification & { media: Media[] })[];
    skills: (Skill & { media: Media[] })[];
    highlights: Highlight[];
    navbarConfig: NavbarConfig;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setData({
          portfolioExperiences: [],
          educations: [],
          certifications: [],
          skills: [],
          highlights: [],
          navbarConfig: {
            id: '',
            logoText: 'resumeflex',
            logoImageUrl: null,
            useImageLogo: false,
            workExperienceLabel: 'Portfolio',
            careerSeriesLabel: 'Career Series',
            educationLabel: 'Education',
            certificationsLabel: 'Certifications',
            skillsLabel: 'Skills',
            backgroundColor: '#141414',
            backgroundType: 'color',
            backgroundImageUrl: null,
            gradientFrom: '#141414',
            gradientTo: '#1a1a1a',
            fontFamily: 'Inter',
            logoFontFamily: 'Inter'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="bg-[#141414] text-white min-h-screen">
        <div className="p-4 md:p-8">
          <div className="h-12 bg-[#404040] rounded mb-8 w-1/4 animate-pulse"></div>
          <SkeletonCarousel title="Portfolio" cardType="movie" count={3} />
          <SkeletonCarousel title="Education" cardType="education" count={2} />
          <SkeletonCarousel title="Certifications" cardType="certification" count={2} />
          <SkeletonCarousel title="Skills" cardType="skill" count={3} />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="bg-[#141414] text-white min-h-screen">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-[#e50914]">resumeflex</h1>
          <p className="text-[#808080]">Failed to load data. Please try again later.</p>
        </div>
      </main>
    );
  }

  const { portfolioExperiences, educations, certifications, skills, highlights, navbarConfig } = data;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getBackgroundStyle = () => {
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
              <ul className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-end">
                <li>
                  <button
                    onClick={() => scrollToSection('work-experience')}
                    className="text-white hover:text-[#e50914] transition-colors duration-200 font-medium"
                  >
                    {navbarConfig.workExperienceLabel}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('education')}
                    className="text-white hover:text-[#e50914] transition-colors duration-200 font-medium"
                  >
                    {navbarConfig.educationLabel}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('certifications')}
                    className="text-white hover:text-[#e50914] transition-colors duration-200 font-medium"
                  >
                    {navbarConfig.certificationsLabel}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('skills')}
                    className="text-white hover:text-[#e50914] transition-colors duration-200 font-medium"
                  >
                    {navbarConfig.skillsLabel}
                  </button>
                </li>
              </ul>
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
                    {highlights[0].title}
                  </h2>
                  <p className="text-lg md:text-xl text-white/90 mb-2">
                    {highlights[0].company}
                  </p>
                  {highlights[0].description && (
                    <p className="text-sm md:text-base text-white/80 mb-2 line-clamp-2">
                      {highlights[0].description}
                    </p>
                  )}
                  <p className="text-sm md:text-base text-white/70">
                    {new Date(highlights[0].startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
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
            onCardClick={(highlight) => {
              console.log('Highlight clicked:', highlight.title);
            }}
          />
        )}

        <div id="work-experience" className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">{navbarConfig.workExperienceLabel}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioExperiences.map((company: any) => (
              <div key={company.id}>
                <ExperienceCard
                    experience={{ ...company.experiences[0], company, companyId: company.id }}
                    onClick={() => {
                        setSelectedExperience({ ...company.experiences[0], company });
                        setIsExperienceModalOpen(true);
                    }}
                />
              </div>
            ))}
          </div>
        </div>

        <div id="education" className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">{navbarConfig.educationLabel}</h2>
          <Carousel>
            {educations.map((education: Education) => (
              <div key={education.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <EducationCard education={education} />
              </div>
            ))}
          </Carousel>
        </div>

        <div id="certifications" className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">{navbarConfig.certificationsLabel}</h2>
          <Carousel>
            {certifications.map((certification: Certification) => (
              <div key={certification.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <CertificationCard certification={certification} />
              </div>
            ))}
          </Carousel>
        </div>

        <div id="skills" className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">{navbarConfig.skillsLabel}</h2>
          <Carousel>
            {skills.map((skill: Skill) => (
              <div key={skill.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <SkillCard skill={skill} />
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      <Footer />

      {selectedHighlight && selectedHighlight.cardMedia?.[0] && (
        <MediaModal
          isVisible={isHighlightModalOpen}
          onClose={() => {
            setIsHighlightModalOpen(false);
            setSelectedHighlight(null);
          }}
          media={selectedHighlight.cardMedia[0]}
          highlightTitle={selectedHighlight.title}
          company={selectedHighlight.company}
          description={selectedHighlight.description}
          startDate={selectedHighlight.startDate}
        />
      )}

      {selectedExperience && (selectedExperience.cardMedia?.[0] || selectedExperience.media?.[0]) && (
        <MediaModal
          isVisible={isExperienceModalOpen}
          onClose={() => {
            setIsExperienceModalOpen(false);
            setSelectedExperience(null);
          }}
          media={selectedExperience.cardMedia?.[0] || selectedExperience.media?.[0]}
          highlightTitle={selectedExperience.title}
          company={selectedExperience.company.name}
          description={selectedExperience.description}
          startDate={selectedExperience.startDate}
          endDate={selectedExperience.endDate}
        />
      )}

    </main>
  );
}
