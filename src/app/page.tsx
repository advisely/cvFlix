
'use client'

import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import MovieCard from '@/components/MovieCard'
import SeriesCard from '@/components/SeriesCard'
import { Carousel } from '@/components/Carousel'
import EducationCard from '@/components/EducationCard'
import CertificationCard from '@/components/CertificationCard'
import SkillCard from '@/components/SkillCard'
import HighlightCardGrid from '@/components/HighlightCardGrid'
import SkeletonCarousel from '@/components/SkeletonCarousel'
import Footer from '@/components/Footer'
import type { Company, Experience, Education, Certification, Skill, Media } from '@prisma/client'

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to empty data to show empty sections
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
            fontFamily: 'Inter'
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

  // Generate dynamic background style
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
        {/* Header with Logo and Navigation - Transparent */}
        <header className="mb-8 p-4 bg-transparent">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              {navbarConfig.useImageLogo && navbarConfig.logoImageUrl ? (
                <img
                  src={navbarConfig.logoImageUrl}
                  alt={navbarConfig.logoText}
                  className="h-8 md:h-12 w-auto"
                />
              ) : (
                <h1 className="text-2xl md:text-4xl font-bold text-[#e50914]">
                  {navbarConfig.logoText}
                </h1>
              )}
            </div>

            {/* Navigation */}
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

        {/* Highlights Section - Homepage Hero Card */}
        {highlights && highlights.length > 0 && (
          <div className="mb-12">
            <div 
              className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden rounded-lg group cursor-pointer"
              onClick={() => {
                setSelectedHighlight(highlights[0]);
                setIsModalOpen(true);
              }}
            >
              {/* Background Image (Homepage Media) */}
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
                // Fallback to generic background if no homepage image
                return (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#333] to-[#111] flex items-center justify-center">
                    <div className="text-center text-white/60">
                      <div className="text-4xl mb-2">🎬</div>
                      <div className="text-sm">No homepage image available</div>
                    </div>
                  </div>
                );
              })()}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content Overlay */}
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

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        )}

        {/* Featured Highlights Grid - Using new FloatingHighlightCard */}
        {highlights && highlights.length > 1 && (
          <HighlightCardGrid
            highlights={highlights.slice(1)} // Show all except the first one used in hero
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
            {singleExperiences.map((company: Company & { experiences: Experience[] }) => (
              <div key={company.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <MovieCard experience={{ ...company.experiences[0], company }} />
              </div>
            ))}
          </Carousel>
        </div>

        <div id="career-series" className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">{navbarConfig.careerSeriesLabel}</h2>
          <Carousel>
            {seriesExperiences.map((company: Company & { experiences: Experience[] }) => (
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

      {/* Footer */}
      <Footer />

      {/* Highlight Detail Modal - PROFESSIONAL SOLUTION */}
      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
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
        closeIcon={
          <div className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white text-lg">
            ✕
          </div>
        }
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
        transitionName="slide-up"
        maskTransitionName="fade"
      >
        {selectedHighlight && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
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
                    
                    {/* Video Controls - Clean Implementation */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {/* Pause Button */}
                      <button
                        onClick={() => {
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
                      
                      {/* Sound Button - RESTORED */}
                      <button
                        onClick={() => {
                          const video = document.getElementById('modal-video') as HTMLVideoElement;
                          if (video) {
                            video.muted = !video.muted;
                            // Update button appearance based on mute state
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

                    {/* Text Overlay for Video */}
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

                    {/* Text Overlay for Image */}
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
    </main>
  );
}
