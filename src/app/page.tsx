
'use client'

import { useEffect, useState } from 'react';
import MovieCard from '@/components/MovieCard'
import SeriesCard from '@/components/SeriesCard'
import { Carousel } from '@/components/Carousel'
import EducationCard from '@/components/EducationCard'
import CertificationCard from '@/components/CertificationCard'
import SkillCard from '@/components/SkillCard'
import HighlightCard from '@/components/HighlightCard'
import SkeletonCarousel from '@/components/SkeletonCarousel'
import Footer from '@/components/Footer'
import type { Company, Experience, Education, Certification, Skill, Media } from '@prisma/client'

interface Highlight {
  id: string;
  title: string;
  company: string;
  startDate: string;
  createdAt: string;
  media: Media[];
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
            logoText: 'cvFlix',
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
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-[#e50914]">cvFlix</h1>
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

        {/* Highlights Section - Cinematic placeholder */}
        {highlights && highlights.length > 0 && (
          <div className="mb-12">
            <HighlightCard highlight={highlights[0]} />
          </div>
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
    </main>
  );
}
