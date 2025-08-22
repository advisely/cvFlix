/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import ExperienceCard from '@/components/ExperienceCard'
import SeriesCard from '@/components/SeriesCard'
import { Carousel } from '@/components/Carousel'
import EducationCard from '@/components/EducationCard'
import CertificationCard from '@/components/CertificationCard'
import SkillCard from '@/components/SkillCard'
import HighlightCardGrid from '@/components/HighlightCardGrid'
import SkeletonCarousel from '@/components/SkeletonCarousel'
import Footer from '@/components/Footer'
import FloatingExperienceCard from '@/components/FloatingExperienceCard';
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
    singleExperiences: (Company & { experiences: Experience[] })[];
    seriesExperiences: (Company & { experiences: Experience[] })[];
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
          singleExperiences: [],
          seriesExperiences: [],
          educations: [],
          certifications: [],
          skills: [],
          highlights: [],
          navbarConfig: {
            id: '',
            logoText: 'resumeflex',
            logoImageUrl: null,
            useImageLogo: false,
            workExperienceLabel: 'Work Experience',
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
          <SkeletonCarousel title="Work Experience" cardType="movie" count={3} />
          <SkeletonCarousel title="Career Series" cardType="series" count={2} />
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

  const { singleExperiences, seriesExperiences, educations, certifications, skills, highlights, navbarConfig } = data;

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
                <img
                  src={navbarConfig.logoImageUrl}
                  alt={navbarConfig.logoText}
                  className="h-8 md:h-12 w-auto"
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
                    onClick={() => scrollToSection('career-series')}
                    className="text-white hover:text-[#e50914] transition-colors duration-200 font-medium"
                  >
                    {navbarConfig.careerSeriesLabel}
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
                    <img
                      src={homepageImage.url}
                      alt={highlights[0].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          <Carousel>
            {singleExperiences.map((company: any) => (
              <div key={company.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <ExperienceCard 
                    experience={{ ...company.experiences[0], company, companyId: company.id }} 
                    onClick={() => {
                        setSelectedExperience({ ...company.experiences[0], company });
                        setIsExperienceModalOpen(true);
                    }}
                />
              </div>
            ))}
          </Carousel>
        </div>

        <div id="career-series" className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">{navbarConfig.careerSeriesLabel}</h2>
          <Carousel>
            {seriesExperiences.map((company: any) => (
              <div key={company.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <SeriesCard company={company} />
              </div>
            ))}
          </Carousel>
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

      <Modal
        open={isHighlightModalOpen}
        onCancel={(e) => {
          e.stopPropagation();
          setIsHighlightModalOpen(false);
          setSelectedHighlight(null);
        }}
        footer={null}
        width="90vw"
        style={{ maxWidth: '1000px', top: 0 }}
        centered
        maskClosable={true}
        destroyOnHidden
        keyboard
        closable={true}
        styles={{
          body: { 
            padding: 0,
            height: '75vh',
            maxHeight: '800px',
            minHeight: '500px',
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden'
          },
          content: {
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden'
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)'
          }
        }}
        className="highlight-modal"
      >
        {selectedHighlight && (
          <div 
            className="relative w-full h-full flex items-center justify-center bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const cardMedia = selectedHighlight.cardMedia?.[0];
              
              if (!cardMedia) {
                return (
                  <div className="text-white text-center p-8">
                    <h2 className="text-2xl font-bold mb-4">{selectedHighlight.title}</h2>
                    <p className="text-lg text-white/80 mb-2">{selectedHighlight.company}</p>
                    {selectedHighlight.description && (
                      <p className="text-white/60 mt-4">{selectedHighlight.description}</p>
                    )}
                    <p className="text-white/60 mt-2">
                      {new Date(selectedHighlight.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                );
              }

              if (cardMedia.type === 'video') {
                return (
                  <>
                    <video
                      className="max-w-full max-h-full object-contain"
                      autoPlay
                      muted
                      loop
                      playsInline
                      id="modal-video"
                    >
                      <source src={cardMedia.url} type="video/mp4" />
                    </video>
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const video = document.getElementById('modal-video') as HTMLVideoElement;
                          if (video) {
                            if (video.paused) {
                              video.play();
                            } else {
                              video.pause();
                            }
                          }
                        }}
                        className="text-white bg-black/50 border-0 hover:bg-black/70 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      >
                        ⏸️
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const video = document.getElementById('modal-video') as HTMLVideoElement;
                          if (video) {
                            video.muted = !video.muted;
                            const btn = document.getElementById('modal-mute-btn');
                            if (btn) {
                              btn.style.backgroundColor = video.muted ? 'rgba(239, 68, 68, 0.7)' : 'rgba(0, 0, 0, 0.5)';
                            }
                          }
                        }}
                        id="modal-mute-btn"
                        className="text-white bg-black/50 hover:bg-black/70 border-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      >
                        🔊
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white bg-black/50 backdrop-blur-sm rounded-lg p-4">
                      <h3 className="text-lg font-bold mb-1">{selectedHighlight.title}</h3>
                      <p className="text-sm text-white/90 mb-1">{selectedHighlight.company}</p>
                      {selectedHighlight.description && (
                        <p className="text-xs text-white/80 mb-1">{selectedHighlight.description}</p>
                      )}
                      <p className="text-xs text-white/70">
                        {new Date(selectedHighlight.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </>
                );
              }

              if (cardMedia.type === 'image') {
                return (
                  <>
                    <img
                      src={cardMedia.url}
                      alt={selectedHighlight.title}
                      className="max-w-full max-h-full object-contain"
                    />

                    <div className="absolute bottom-4 left-4 right-4 text-white bg-black/50 backdrop-blur-sm rounded-lg p-4">
                      <h3 className="text-lg font-bold mb-1">{selectedHighlight.title}</h3>
                      <p className="text-sm text-white/90 mb-1">{selectedHighlight.company}</p>
                      {selectedHighlight.description && (
                        <p className="text-xs text-white/80 mb-1">{selectedHighlight.description}</p>
                      )}
                      <p className="text-xs text-white/70">
                        {new Date(selectedHighlight.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </>
                );
              }

              return null;
            })()}
          </div>
        )}
      </Modal>

      <Modal
        open={isExperienceModalOpen}
        onCancel={() => setIsExperienceModalOpen(false)}
        footer={null}
        width="90vw"
        style={{ maxWidth: '1000px', top: 0 }}
        centered
        maskClosable={true}
        destroyOnHidden
        keyboard
        closable={true}
        styles={{
          body: { 
            padding: 0,
            height: '75vh',
            maxHeight: '800px',
            minHeight: '500px',
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden'
          },
          content: {
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden'
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)'
          }
        }}
        className="experience-modal"
      >
        {selectedExperience && <FloatingExperienceCard experience={selectedExperience} />}
      </Modal>

    </main>
  );
}