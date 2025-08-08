import React, { useState, useEffect } from 'react';
import { Card, Table, Button, InputNumber, Radio, Row, Col, message } from 'antd';
import axios from 'axios';

const KanbanComputation = ({ fileId, fileName, setSelectedFile, initialConfig }) => {
  const [mode, setMode] = useState('known'); // 'known' or 'compute'
  const [parameters, setParameters] = useState({

    dailyDemand: 0,
    leadTime: 0,
    safetyStockPercent: 0,
    kanbanSize: 0,

    // Compute mode parameters
    setupCost: 0,
    annualHoldingCost: 0,
    dailyProduction: 0,
    annualUsage: 0,
    dailyUsage: 0,
    safetyStock: 0,
    daysPerYear: 0
  });

  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
const [currentFileid, setCurrentFileid] = useState(fileId);
  const getAuthToken = () => localStorage.getItem('access_token');

// Debug mode changes
useEffect(() => {
  console.log("Mode changed to:", mode);
}, [mode]);

// Debug parameter changes
useEffect(() => {
  console.log("Parameters updated:", parameters);
}, [parameters]);

// Debug file changes
useEffect(() => {
  console.log("Current fileid changed:", currentFileid);
}, [currentFileid]);

 useEffect(() => {
  if (fileId && fileId !== currentFileid) {
    setCurrentFileid(fileId);
    loadFileData(fileId);
  } else if (initialConfig) {
    setMode(initialConfig.mode || 'known');
    setParameters(prev => ({ ...prev, ...(initialConfig.parameters || {}) }));
  }
}, [fileId, initialConfig]);

  const loadFileData = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("User is not authenticated.");
        return;
      }

      setIsLoading(true);
      const response = await axios.get(`/api/retrieve_kanban_computation/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
     console.log("input data", input_data );
      const { input_data, output_data } = response.data;
      setMode(input_data.mode);
      console.log(parameters);
      setParameters(prev => ({ ...prev, ...input_data.parameters }));
       console.log(parameters);
      setResults(output_data);
      setIsSaved(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading file:', error);
      message.error('Failed to load file data');
      setIsLoading(false);
    }
  };

  const saveData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("User is not authenticated.");
        return;
      }

      setIsLoading(true);

      const payload = {
        name: fileName + ' - Kanban Computation' || 'Kanban Computation',
        mode,
        parameters

      };

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let response;
      if (currentFileid) {
        response = await axios.put(`/api/update_kanban_computation/${currentFileid}/`, payload, config);
      } else {
        response = await axios.post('/api/save_kanban_computation/', payload, config);
      }
if (!currentFileid && response.data.id) {
        setCurrentFileid(response.data.id);
      }
      setResults(response.data.output_data);
      setIsSaved(true);
      message.success(isSaved ? 'Computation updated successfully' : 'Computation saved successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving data:', error);
      message.error('Failed to save computation');
      setIsLoading(false);
    }
  };

  const handleParameterChange = (field, value) => {
    setParameters(prev => ({ ...prev, [field]: value }));
  };

  const renderKnownInputs = () => [
    { parameter: 'Daily Expected Demand', value: parameters.dailyDemand, field: 'dailyDemand' },
    { parameter: 'Lead time (Wait + process)', value: parameters.leadTime, field: 'leadTime' },
    { parameter: 'Safety stock %', value: parameters.safetyStockPercent, field: 'safetyStockPercent' },
    { parameter: 'Kanban size', value: parameters.kanbanSize, field: 'kanbanSize' }
  ];

  const renderComputeInputs = () => [
    { parameter: 'Setup cost', value: parameters.setupCost, field: 'setupCost' },
    { parameter: 'Annual holding cost', value: parameters.annualHoldingCost, field: 'annualHoldingCost' },
    { parameter: 'Daily production', value: parameters.dailyProduction, field: 'dailyProduction' },
    { parameter: 'Annual Usage', value: parameters.annualUsage, field: 'annualUsage' },
    { parameter: 'Daily usage', value: parameters.dailyUsage, field: 'dailyUsage' },
    { parameter: 'Lead time', value: parameters.leadTime, field: 'leadTime' },
    { parameter: 'Safety stock', value: parameters.safetyStock, field: 'safetyStock' },
    { parameter: 'Days per year', value: parameters.daysPerYear, field: 'daysPerYear' }
  ];

  const inputColumns = [
    {
      title: 'Parameter',
      dataIndex: 'parameter',
      key: 'parameter',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => handleParameterChange(record.field, value)}
          style={{ width: '100%' }}
        />
      ),
    },
  ];

  const renderOutputTable = () => {
    if (!results) return null;

    const outputData = [
      { parameter: 'Kanban size', value: results.kanbanSize?.toFixed(2) || 'N/A' },
      { parameter: 'Number of Kanbans', value: results.numberOfKanbans?.toFixed(2) || 'N/A' },
    ];

    if (mode === 'compute') {
      outputData.push(
        { parameter: 'Days per year', value: results.daysPerYear || 'N/A' }
      );
    }

    return (
      <Table
        columns={inputColumns}
        dataSource={outputData}
        pagination={false}
        bordered
        rowKey="parameter"
      />
    );
  };

  return (
    <Card
      title={fileName || 'Kanban Computation'}
      loading={isLoading}
      extra={
        <Button
          type="primary"
          onClick={saveData}
          loading={isLoading}
        >
          {isSaved ? 'Calculate & Update' : 'Calculate & Save'}
        </Button>
      }
    >
      <Radio.Group
        onChange={(e) => setMode(e.target.value)}
        value={mode}
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="known">Known Values</Radio.Button>
        <Radio.Button value="compute">To Be Computed</Radio.Button>
      </Radio.Group>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Input Parameters">
            <Table
              columns={inputColumns}
              dataSource={mode === 'known' ? renderKnownInputs() : renderComputeInputs()}
              pagination={false}
              bordered
              rowKey="parameter"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Results">
            {results ? renderOutputTable() : 'No results yet. Please save to calculate.'}
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default KanbanComputation;