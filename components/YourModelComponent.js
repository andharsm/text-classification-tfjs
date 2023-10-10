// components/YourModelComponent.js
import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';


const YourModelComponent = () => {
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadLayersModel('../public/model.json');
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading the model:', error);
      }
    };

    loadModel();
  }, []);

  // Use the 'model' state in your component as needed

  return (
    <div>
      {/* Your component content */}
    </div>
  );
};

export default YourModelComponent;
