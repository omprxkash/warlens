import React from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ResultCard from '../components/ResultCard/ResultCard';
import './Result.css';

function Result() {
  return (
    <>
      <Header />
      <main className="result-main">
        <div className="container">
          <ResultCard />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Result;
