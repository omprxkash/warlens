import React from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Hero from '../components/Hero/Hero';
import Problem from '../components/Problem/Problem';
import SampleStrip from '../components/SampleStrip/SampleStrip';
import Capabilities from '../components/Capabilities/Capabilities';
import HowItWorks from '../components/HowItWorks/HowItWorks';

function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <SampleStrip />
        <Capabilities />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}

export default Home;
