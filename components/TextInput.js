// components/TextInput.js
import React from 'react';

const TextInput = ({ value, onChange }) => {
  return (
    <label>
      Text:
      <input type="text" value={value} onChange={onChange} />
    </label>
  );
};

export default TextInput;
