import React, { useState, useEffect } from 'react';
import TextInput from '../components/TextInput';
import SubmitButton from '../components/SubmitButton';
import { punctuationRemoval, stemming, removeStopwords } from '../utils/textUtils';
import { calculateTFIDFWithWeights } from '../utils/tfidfUtils';
import * as tf from '@tensorflow/tfjs';
import jsonData from '../public/label_encoder.json'

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState([]);
  const [model, setModel] = useState(null);
  const [vocab, setVocab] = useState(null);
  const [resultPredict, setResultPredict] = useState(''); // Moved to component state

  // Fungsi untuk memuat model
  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadLayersModel('/model.json');
      setModel(loadedModel);
    } catch (error) {
      console.error('Gagal memuat model:', error);
    }
  };

   // Fungsi untuk memuat vocab.json
   const loadVocab = async () => {
    try {
      const response = await fetch('/vocab.json');
      const data = await response.json();
      setVocab(data);
    } catch (error) {
      console.error('Gagal memuat vocab:', error);
    }
  };

  useEffect(() => {
    // Load model and vocab.json when the component mounts
    loadModel();
    loadVocab();
  }, []);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let processedText = punctuationRemoval(inputText);
    console.log('Punkremove:', processedText);
    processedText = stemming(processedText);
    console.log('stemming:', processedText);
    processedText = removeStopwords(processedText);
    console.log('removeStopwords:', processedText);

    // Memastikan model dan vocab dimuat sebelum melakukan prediksi
    if (!model || !vocab) {
      console.error('Model atau vocab belum dimuat.');
      return;
    }

    // Hitung TF-IDF untuk setiap kata dalam inputText dengan bobot dari vocab
    const tfidfResults = Object.keys(vocab).map(word => {
      return {
        word: word,
        tfidf: calculateTFIDFWithWeights(word, processedText, [processedText], vocab)
      };
    });

    // Menyusun ulang hasil untuk menyimpan nilai TF-IDF dalam bentuk array
    const orderedResults = tfidfResults.map(result => result.tfidf);

    // Cetak hasil
    console.log('Data yang dikirim:', orderedResults);
    
    // Jika model telah dimuat, lakukan prediksi
    if (model) {
      const inputArray = [orderedResults]; // Sesuaikan dengan bentuk input model
      const inputTensor = tf.tensor2d(inputArray);
      const prediction = model.predict(inputTensor);
      const result = prediction.dataSync();
      console.log('Hasil prediksi:', result);
      
      // Temukan indeks kelas dengan nilai tertinggi
      const predictedClassIndex = result.indexOf(Math.max(...result));
      const checkValueOfResult = orderedResults.reduce((curr, prev)=> curr + prev, 0);
      
      if (checkValueOfResult === 0) {
        setResultPredict("Command tidak ditemukan");
      } else {
        setResultPredict(jsonData[predictedClassIndex]);
        console.log('Kelas yang diprediksi:', jsonData[predictedClassIndex]);
      }
      
      setSubmittedText(orderedResults); // Simpan nilai input yang telah diolah
    }
  };

  return (
    <div>
      <h1>Formulir Next.js</h1>
      <form onSubmit={handleSubmit}>
        <TextInput value={inputText} onChange={handleInputChange} />
        <SubmitButton onSubmit={handleSubmit} />
      </form>

      {submittedText.length > 0 && (
        <div>
            {resultPredict && (
              <div>
                <p>Hasil prediksi: {resultPredict}</p>
              </div>
            )}
          
            {submittedText.length > 0 && (
              <div>
                <p>Anda mengirim:</p>
                <ul>
                  {submittedText.map((tfidf, index) => (
                    <li key={index}>
                      {Object.keys(vocab)[index]} TF-IDF: {tfidf}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

    </div>
    // <div>TEST</div>
  );
}
