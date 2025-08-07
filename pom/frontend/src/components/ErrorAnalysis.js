// ErrorAnalysis.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Tabs, Button, InputNumber, message, Row, Col, Form, Modal
} from 'antd';
import axios from 'axios';

const { TabPane } = Tabs;

const ErrorAnalysis = ({ fileId, fileName, setSelectedFile, initialConfig }) => {
  const [activeTab, setActiveTab] = useState('input');
  const [data, setData] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const getAuthToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    if (fileId) loadData(fileId);
    else if (initialConfig) {
      const initializedRows = initialConfig.itemNames.map((label) => ({
        label,
        actual: '',
        forecast: ''
      }));
      setData(initializedRows);
    }
  }, [fileId, initialConfig]);

  const loadData = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) return message.error('Not authenticated.');
      setIsLoading(true);
      const res = await axios.get(`/api/retrieve_error_analysis/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { input_data, output_data, chart_url } = res.data;
      const rows = input_data.labels.map((label, i) => ({
        label,
        actual: input_data.actual[i],
        forecast: input_data.forecast[i]
      }));
      setData(rows);
      setResults({ ...output_data, chart_url });
      setActiveTab('output');
      setIsSaved(true);
    } catch (err) {
      message.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    setData(prev => {
      const newData = [...prev];
      newData[index][field] = value;
      return newData;
    });
  };

  const saveData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return message.error('Not authenticated.');
      setIsLoading(true);

      const payload = {
        name: fileName || 'Error Analysis',
        input_data: {
          labels: data.map(d => d.label),
          actual: data.map(d => Number(d.actual)),
          forecast: data.map(d => Number(d.forecast))
        }
      };

      let res;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (fileId)
        res = await axios.put(`/api/update_error_analysis/${fileId}/`, payload, config);
      else
        res = await axios.post('/api/save_error_analysis/', payload, config);

      const { output_data, chart_url } = res.data;
      setResults({ ...output_data, chart_url });
      setActiveTab('output');
      setIsSaved(true);
      message.success(fileId ? 'Updated successfully' : 'Saved successfully');
    } catch (err) {
      message.error('Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  const inputColumns = [
    {
      title: 'Period Label',
      dataIndex: 'label',
      key: 'label',
      render: text => text
    },
    {
      title: 'Actual',
      dataIndex: 'actual',
      key: 'actual',
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={val => handleInputChange(index, 'actual', val)}
        />
      )
    },
    {
      title: 'Forecast',
      dataIndex: 'forecast',
      key: 'forecast',
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={val => handleInputChange(index, 'forecast', val)}
        />
      )
    },
  ];

  const renderInputTab = () => (
    <Card title="Input Data">
      <Table columns={inputColumns} dataSource={data} rowKey="label" pagination={false} />
      <Row justify="space-between" style={{ marginTop: 16 }}>
        <Button type="primary" onClick={saveData} loading={isLoading} disabled={!data.length}>
          {isSaved ? 'Update Analysis' : 'Save Analysis'}
        </Button>
      </Row>
    </Card>
  );

  const renderOutputTab = () => {
    if (!results) return <p style={{ textAlign: 'center' }}>No results. Please save first.</p>;

    return (
      <>
        <Card title="Control Table">
          <Table
            dataSource={results.control_table}
            pagination={false}
            rowKey="period"
            columns={[
              { title: 'Period', dataIndex: 'period' },
              { title: 'Actual', dataIndex: 'actual' },
              { title: 'Forecast', dataIndex: 'forecast' },
              { title: 'Error', dataIndex: 'error' },
              { title: 'Cum. Forecast Error', dataIndex: 'cum_fore_error' },
              { title: 'MAD', dataIndex: 'MAD' },
              { title: 'Tracking Signal', dataIndex: 'tracking_signal' },
            ]}
          />
        </Card>

        <Card title="Summary Metrics" style={{ marginTop: 24 }}>
          <Table
            dataSource={Object.entries(results.summary_metrics).map(([measure, value]) => ({
              measure,
              value
            }))}
            pagination={false}
            rowKey="measure"
            columns={[
              { title: 'Error Measure', dataIndex: 'measure' },
              { title: 'Value', dataIndex: 'value' },
            ]}
          />
        </Card>

        <Card title="Error Analysis Table" style={{ marginTop: 24 }}>
          <Table
            dataSource={results.error_analysis_table}
            pagination={false}
            rowKey="period"
            columns={Object.keys(results.error_analysis_table[0] || {}).map((key) => ({
              title: key,
              dataIndex: key
            }))}
          />
        </Card>

        {results.chart_url && (
          <Card title="Forecast Chart" style={{ marginTop: 24 }}>
            <img src={results.chart_url} alt="Forecast Chart" style={{ width: '100%' }} />
          </Card>
        )}
      </>
    );
  };

  return (
    <Card title={fileName || 'Error Analysis'}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Input Data" key="input">
          {renderInputTab()}
        </TabPane>
        <TabPane tab="Output" key="output">
          {renderOutputTab()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ErrorAnalysis;
