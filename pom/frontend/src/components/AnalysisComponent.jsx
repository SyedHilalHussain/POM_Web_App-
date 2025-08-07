// Analysiscomponent.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalysisComponent = ({ fileId }) => {
  const [inputData, setInputData] = useState({});
  const [outputData, setOutputData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (fileId) {
        try {
          const token = localStorage.getItem('access_token');
          const response = await axios.get(`/api/retrieve-file/${fileId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setInputData(response.data.inputData);
          setOutputData(response.data.outputData);
        } catch (error) {
          console.error('Error fetching file data:', error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [fileId]);

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    const url = fileId
      ? `/api/retrieve-file/${fileId}/` // Update endpoint
      : '/api/retrieve-file/'; // Create endpoint

    const data = { inputData, outputData };

    try {
      const response = await axios.post(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('File saved:', response.data);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  return (
    <div>
      {/* Render the input and output data or forms */}
      <button onClick={handleSave}>{fileId ? 'Update' : 'Save'} Analysis</button>
    </div>
  );
};

export default AnalysisComponent;
