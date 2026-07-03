import React from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import DatasetGallery from '../components/DatasetGallery/DatasetGallery';
import './Dataset.css';

function Dataset() {
  return (
    <>
      <Header />
      <main className="dataset-main">
        <DatasetGallery />
      </main>
      <Footer />
    </>
  );
}

export default Dataset;
