// components/SubmitButton.js
import React from 'react';

const SubmitButton = ({ onSubmit }) => {
  return <button type="submit" onClick={onSubmit}>Kirim</button>;
};

export default SubmitButton;
