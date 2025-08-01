
'use client'

import { useEffect, useState } from 'react';
import MovieCard from '@/components/MovieCard'
import SeriesCard from '@/components/SeriesCard'
import { Carousel } from '@/components/Carousel'
import EducationCard from '@/components/EducationCard'
import CertificationCard from '@/components/CertificationCard'
import SkillCard from '@/components/SkillCard'
import SkeletonCarousel from '@/components/SkeletonCarousel'
import type { Company, Experience, Education, Certification, Skill } from '@prisma/client'

export default function Home() {
  const [data, setData] = useState<{
    singleExperiences: (Company & { experiences: Experience[] })[];
    seriesExperiences: (Company & { experiences: Experience[] })[];
    educations: Education[];
    certifications: Certification[];
    skills: Skill[];
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

  const { singleExperiences, seriesExperiences, educations, certifications, skills } = data;

  return (
    <main className="bg-[#141414] text-white min-h-screen">
      <div className="p-4 md:p-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-[#e50914]">cvFlix</h1>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Work Experience</h2>
          <Carousel>
            {singleExperiences.map((company: Company & { experiences: Experience[] }) => (
              <div key={company.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <MovieCard experience={{ ...company.experiences[0], company }} />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Career Series</h2>
          <Carousel>
            {seriesExperiences.map((company: Company & { experiences: Experience[] }) => (
              <div key={company.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <SeriesCard company={company} />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Education</h2>
          <Carousel>
            {educations.map((education: Education) => (
              <div key={education.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <EducationCard education={education} />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Certifications</h2>
          <Carousel>
            {certifications.map((certification: Certification) => (
              <div key={certification.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <CertificationCard certification={certification} />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Skills</h2>
          <Carousel>
            {skills.map((skill: Skill) => (
              <div key={skill.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] p-2">
                <SkillCard skill={skill} />
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </main>
  );
}
