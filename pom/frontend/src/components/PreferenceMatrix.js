import React, { useState, useEffect } from 'react';
import { Table, InputNumber, Button, message } from 'antd';
import axios from 'axios';

function PreferenceMatrix({ fileId, fileName, matrixConfig, setSelectedFile }) {
  const [matrixData, setMatrixData] = useState(null);
  const [weights, setWeights] = useState([]);
  const [scores, setScores] = useState([]);
  const [result, setResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (fileId) {
      fetchData();
    } else if (matrixConfig) {
      initializeMatrix(matrixConfig);
    }
  }, [fileId, matrixConfig]);

  // Fetch saved matrix data from backend
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error("User is not authenticated.");
        return;
      }

      const response = await axios.get(`/api/retrieve_preferencematrix/${fileId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      setMatrixData(data.input_data);
      setWeights(data.input_data.weights);
      setScores(data.input_data.scores);
      setResult(data.output_data);
      setIsSaved(true); // File is already saved

    } catch (error) {
      console.error('Error fetching matrix data:', error);
      message.error('Failed to load Preference Matrix data');
    }
  };

  // Initialize new preference matrix
  const initializeMatrix = (config) => {
    const criteriaNames = config.rows || Array.from({ length: config.numFactors }, (_, i) => `Factor ${i + 1}`);
    const optionNames = config.columns || Array.from({ length: config.numOptions }, (_, i) => `Option ${i + 1}`);

    const initialWeights = Array(config.numFactors).fill(1 / config.numFactors);
    const initialScores = Array(config.numFactors).fill().map(() =>
      Array(config.numOptions).fill(5)
    );

    setMatrixData({
      criteriaNames,
      optionNames,
      weights: initialWeights,
      scores: initialScores
    });

    setWeights(initialWeights);
    setScores(initialScores);
  };

  // Save or update matrix data
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error("User is not authenticated.");
        return;
      }

      const payload = {
        name: fileName,
        input_data: {
          criteriaNames: matrixData.criteriaNames,
          optionNames: matrixData.optionNames,
          weights,
          scores
        }
      };

      const url = fileId
        ? `/api/update_preferencematrix/${fileId}/`
        : '/api/save_preferencematrix/';

      const method = fileId ? 'put' : 'post';

      console.log("Saving matrix data...", payload);

      const response = await axios({
        method,
        url,
        data: payload,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!fileId && response.data.id) {
        console.log("New file saved, updating selectedFile:", response.data.id);

        // ✅ Ensure setSelectedFile is available before calling
        if (typeof setSelectedFile === "function") {
          setSelectedFile(prev => ({
            ...prev,
            id: response.data.id,
            type: "config"
          }));
        } else {
          console.error("setSelectedFile is undefined! Check if it's passed as a prop.");
        }
      }

      setResult(response.data.output_data);
      setIsSaved(true);
      message.success('Preference Matrix saved successfully');

    } catch (error) {
      console.error('Error saving matrix:', error);
      message.error('Failed to save Preference Matrix');
    }
  };

  if (!matrixData) return <p>Loading...</p>;

  return (
    <div>
      <h3>Preference Matrix - {fileName}</h3>
      <Table
        bordered
        pagination={false}
        columns={[
          { title: 'Criteria', dataIndex: 'criteria', key: 'criteria' },
          { title: 'Weights', dataIndex: 'weight', key: 'weight' },
          ...matrixData.optionNames.map((opt, index) => ({
            title: opt,
            dataIndex: `option_${index}`,
            key: `option_${index}`
          }))
        ]}
        dataSource={matrixData.criteriaNames.map((criteria, rowIndex) => {
          let row = {
            key: rowIndex,
            criteria,
            weight: (
              <InputNumber
                min={0}
                value={weights[rowIndex]}
                onChange={(value) => {
                  const newWeights = [...weights];
                  newWeights[rowIndex] = value;
                  setWeights(newWeights);
                }}
              />
            )
          };
          matrixData.optionNames.forEach((_, colIndex) => {
            row[`option_${colIndex}`] = (
              <InputNumber
                min={0}
                value={scores[rowIndex][colIndex]}
                onChange={(value) => {
                  const newScores = [...scores];
                  newScores[rowIndex][colIndex] = value;
                  setScores(newScores);
                }}
              />
            );
          });
          return row;
        })}
      />

      <Button type="primary" onClick={handleSave} style={{ marginTop: '16px' }}>
        {isSaved ? 'Update' : 'Save'} Matrix
      </Button>

      {result && (
        <div style={{ marginTop: '24px' }}>
          <h4>Calculated Results</h4>
          <Table
            bordered
            pagination={false}
            columns={[
              { title: 'Option', dataIndex: 'option', key: 'option' },
              { title: 'Weighted Score', dataIndex: 'score', key: 'score' },
              { title: 'Rank', dataIndex: 'rank', key: 'rank' },
            ]}
            dataSource={matrixData.optionNames.map((option, index) => ({
              key: index,
              option,
              score: result.weightedTotals[index].toFixed(2),
              rank: result.weightedTotals.map((score, i) => ({ score, index: i }))
                .sort((a, b) => b.score - a.score)
                .findIndex(item => item.index === index) + 1
            }))}
          />
        </div>
      )}
    </div>
  );
}

export default PreferenceMatrix;