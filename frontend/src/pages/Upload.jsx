import React from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ImageUpload from '../components/ImageUpload/ImageUpload';
import './Upload.css';

function Upload() {
  return (
    <>
      <Header />
      <main className="upload-main">
        <div className="container">
          <ImageUpload />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Upload;
