import React from "react";

const Home = () => {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center bg-no-repeat pt-12"
      style={{
        width: '99%',
        margin: '0 auto',
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80')",
        padding: 0,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen text-center px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
        
        {/* Main Heading */}
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl">
          Find Your <span className="text-blue-400 block sm:inline">Dream Job</span> Today
        </h1>
        
        {/* Description */}
        <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl mb-6 sm:mb-8 md:mb-10 leading-relaxed px-2 sm:px-0">
          Explore thousands of job opportunities from top companies and start
          your career journey with us.
        </p>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl">
          
          {/* Jobs Available Stat */}
          <div className="bg-white/20 backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl shadow-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 md:mb-3">
              10,000+
            </h2>
            <p className="text-gray-200 text-xs sm:text-sm md:text-base lg:text-lg font-medium">
              Jobs Available
            </p>
          </div>
          
          {/* Companies Hiring Stat */}
          <div className="bg-white/20 backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl shadow-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 md:mb-3">
              500+
            </h2>
            <p className="text-gray-200 text-xs sm:text-sm md:text-base lg:text-lg font-medium">
              Companies Hiring
            </p>
          </div>
        </div>

        {/* Additional CTA */}
        <div className="mt-8 sm:mt-10 md:mt-12">
          <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-xs sm:max-w-md md:max-w-lg">
            Join thousands of job seekers who found their perfect match
          </p>
        </div>
      </div>

      {/* Footer (no margin, custom bg color) */}

    </section>
  );
};

export default Home;
