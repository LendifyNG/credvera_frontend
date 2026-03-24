import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import CustomCard from './components/CustomCard';
import BuiltForGrowth from './components/BuiltForGrowth';
import GlobalScale from './components/GlobalScale';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CustomCard />
        <BuiltForGrowth />
        <GlobalScale />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default App;
