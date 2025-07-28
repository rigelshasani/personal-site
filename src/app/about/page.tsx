// src/app/about/page.tsx
import Image from 'next/image';

export const metadata = {
  title: 'About',
  description: 'About Rigels Hasani - Data Analyst and Writer',
};

export default function AboutPage() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Me</h1>
          <p className="text-xl text-foreground/80">
            Data analyst, writer, and curious mind exploring the intersection of technology and human behavior
          </p>
        </header>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-12 items-start">
          {/* Photo Section */}
          <div className="md:col-span-1">
            <div className="relative">
              {/* Replace this with your actual photo */}
              <div className="aspect-square bg-surface border border-border-light rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-accent" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <p className="text-sm text-text-mid">
                    Add your photo here
                  </p>
                </div>
              </div>
              
              {/* Uncomment and update this when you add your photo */}
              {/* 
              <Image
                src="/images/rigels-photo.jpg"
                alt="Rigels Hasani"
                width={400}
                height={400}
                className="rounded-2xl object-cover"
                priority
              />
              */}
            </div>
          </div>

          {/* Bio Section */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Hello, I'm Rigels</h2>
              <div className="prose prose-lg max-w-none text-foreground/80 space-y-4">
                <p>
                  I'm a data analyst and writer passionate about uncovering insights from complex datasets 
                  and translating them into meaningful stories. My work sits at the intersection of 
                  technology, analytics, and human behavior.
                </p>
                
                <p>
                  When I'm not diving deep into data, you'll find me writing about philosophy, 
                  exploring new technologies, or sharing tutorials that help others solve technical challenges. 
                  I believe in the power of clear communication to make complex ideas accessible.
                </p>
                
                <p>
                  This site serves as my digital garden where I share my latest projects, 
                  thoughts on data analytics, philosophical musings, and technical insights 
                  I've gathered along the way.
                </p>
              </div>
            </div>

            {/* Skills & Interests */}
            <div>
              <h3 className="text-xl font-semibold mb-4">What I Work With</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Python', 'SQL', 'Data Visualization', 
                  'Machine Learning', 'React', 'Next.js',
                  'Philosophy', 'Technical Writing', 'Analytics'
                ].map(skill => (
                  <span 
                    key={skill}
                    className="px-3 py-2 bg-surface border border-border-light text-foreground rounded-lg text-sm text-center"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="mailto:your.email@example.com"
                  className="text-accent hover:underline"
                >
                  Email
                </a>
                <a 
                  href="https://github.com/rigelshasani"
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a 
                  href="https://linkedin.com/in/rigelshasani"
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}