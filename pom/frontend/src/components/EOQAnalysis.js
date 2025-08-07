import React, { useState, useEffect } from 'react';
import {
  Card, Tabs, Table, InputNumber, Button, Radio,
  Row, Col, Typography, Alert, Modal, Divider, message
} from 'antd';
import axios from 'axios';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const EOQAnalysis = ({ fileid, fileName, setSelectedFile, isSaved, setIsSaved }) => {
  const [formData, setFormData] = useState({
    demand: 0,
    order_cost: 0,
    holding_cost: 0,
    unit_cost: 0,
    fixed_quantity: 0,
    use_reorder_point: false,
    lead_time: 0,
    days_per_year: 365,
    daily_demand: 0,
    safety_stock: 0
  });

  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  const [isLoading, setIsLoading] = useState(false);
  const [currentFileid, setCurrentFileid] = useState(fileid);
  const getAuthToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    if (currentFileid) loadEOQData(currentFileid);
  }, [currentFileid]);

  const loadEOQData = async (id) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`/api/retrieve_eoq/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData(response.data.input_data);
      setResults(response.data.output_data);
      setIsSaved(true);
      setActiveTab('results');
    } catch (error) {
      console.error('Error loading EOQ data:', error);
      Modal.error({ title: 'Error', content: 'Failed to load EOQ data' });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      const url = currentFileid ? `/api/update_eoq/${currentFileid}/` : '/api/save_eoq/';

      const response = await axios({
        method: currentFileid ? 'put' : 'post',
        url,
        data: { name: fileName, input_data: formData },
        headers: { Authorization: `Bearer ${token}` }
      });
  if (!currentFileid && response.data.id) {
        setCurrentFileid(response.data.id);
      }
      setResults(response.data.output_data);
      setIsSaved(true);
      setActiveTab('results');
      message.success(currentFileid ? 'Analysis updated!' : 'Analysis saved!');

    } catch (error) {
      Modal.error({ title: 'Error', content: error.response?.data?.error || 'Calculation failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputColumns = [
    { title: 'Parameter', dataIndex: 'param', key: 'param' },
    { title: 'Value', dataIndex: 'input', key: 'input' }
  ];

  const inputData = [
    {
      key: '1',
      param: 'Annual Demand (D)',
      input: (
        <InputNumber
          value={formData.demand}
          onChange={(v) => setFormData({ ...formData, demand: v })}
          style={{ width: '100%' }}
        />
      )
    },
    {
      key: '2',
      param: 'Order Cost (S)',
      input: (
        <InputNumber
          value={formData.order_cost}
          onChange={(v) => setFormData({ ...formData, order_cost: v })}
          style={{ width: '100%' }}
        />
      )
    },
    {
      key: '3',
      param: 'Holding Cost (H)',
      input: (
        <InputNumber
          value={formData.holding_cost}
          onChange={(v) => setFormData({ ...formData, holding_cost: v })}
          style={{ width: '100%' }}
        />
      )
    },
    {
      key: '4',
      param: 'Unit Cost',
      input: (
        <InputNumber
          value={formData.unit_cost}
          onChange={(v) => setFormData({ ...formData, unit_cost: v })}
          style={{ width: '100%' }}
        />
      )
    },
    {
      key: '5',
      param: 'Fixed Quantity',
      input: (
        <InputNumber
          value={formData.fixed_quantity}
          onChange={(v) => setFormData({ ...formData, fixed_quantity: v })}
          style={{ width: '100%' }}
        />
      )
    },
    ...(formData.use_reorder_point
      ? [
          {
            key: '6',
            param: 'Lead Time (days)',
            input: (
              <InputNumber
                value={formData.lead_time}
                onChange={(v) => setFormData({ ...formData, lead_time: v })}
                style={{ width: '100%' }}
              />
            )
          },
          {
            key: '7',
            param: 'Days per Year',
            input: (
              <InputNumber
                value={formData.days_per_year}
                onChange={(v) => setFormData({ ...formData, days_per_year: v })}
                style={{ width: '100%' }}
              />
            )
          },
          {
            key: '8',
            param: 'Daily Demand',
            input: (
              <InputNumber
                value={formData.daily_demand}
                onChange={(v) => setFormData({ ...formData, daily_demand: v })}
                style={{ width: '100%' }}
              />
            )
          },
             {
            key: '9',
            param: 'safety_stock',
            input: (
              <InputNumber
                value={formData.safety_stock}
                onChange={(v) => setFormData({ ...formData, safety_stock: v })}
                style={{ width: '100%' }}
              />
            )
          }
        ]
      : [])
  ];

  const renderInputForm = () => (
    <Card title="EOQ Parameters">
      <Radio.Group
        value={formData.use_reorder_point}
        onChange={e => setFormData({ ...formData, use_reorder_point: e.target.value })}
        style={{ marginBottom: 24 }}
      >
        <Radio value={false}>Basic EOQ</Radio>
        <Radio value={true}>With Reorder Point</Radio>
      </Radio.Group>

      <Table
        columns={inputColumns}
        dataSource={inputData}
        pagination={false}
        bordered
        showHeader={false}
      />

      <Button
        type="primary"
        onClick={handleSave}
        loading={isLoading}
        style={{ marginTop: 24 }}
      >
        {isSaved ? 'Update Analysis' : 'Save & Calculate'}
      </Button>
    </Card>
  );

  const renderResultsTable = () => {
    if (!results) return null;

    const columns = [
      {
        title: 'Parameter',
        dataIndex: 'parameter',
        key: 'parameter',
        width: '40%'
      },
      {
        title: 'Results using EOQ',
        dataIndex: 'eoq',
        key: 'eoq',
        align: 'right'
      },
      {
        title: `Results using ${formData.fixed_quantity}`,
        dataIndex: 'fixed',
        key: 'fixed',
        align: 'right'
      }
    ];

    const dataSource = [
      {
        key: '1',
        parameter: 'Optimal order quantity (Q*)',
        eoq: results?.optimal_order_quantity?.toFixed(2),
        fixed: formData.fixed_quantity
      },
      {
        key: '2',
        parameter: 'Maximum Inventory Level (max)',
        eoq: results?.maximum_inventory_level?.toFixed(2),
        fixed: results.results_using_fixed?.maximum_inventory_level?.toFixed(2)
      },
      {
        key: '3',
        parameter: 'Average inventory',
        eoq: results?.average_inventory?.toFixed(2),
        fixed: results.results_using_fixed?.average_inventory?.toFixed(2)
      },
      {
        key: '4',
        parameter: 'Orders per period (N)',
        eoq: results?.orders_per_period?.toFixed(2),
        fixed: results.results_using_fixed?.orders_per_period?.toFixed(2)
      },
      {
        key: '5',
        parameter: 'Annual Setup cost',
        eoq: results?.annual_setup_cost?.toFixed(2),
        fixed: results.results_using_fixed?.annual_setup_cost?.toFixed(2)
      },
      {
        key: '6',
        parameter: 'Annual Holding cost',
        eoq: results?.annual_holding_cost?.toFixed(2),
        fixed: results.results_using_fixed?.annual_holding_cost?.toFixed(2)
      },
      {
        key: '7',
        parameter: 'Total Inventory (Holding + Setup) Cost',
        eoq: results?.total_inventory_cost?.toFixed(2),
        fixed: results.results_using_fixed?.total_inventory_cost?.toFixed(2)
      },
      {
        key: '8',
        parameter: 'Unit costs (PD)',
        eoq: results?.unit_costs?.toFixed(2),
        fixed: results.results_using_fixed?.unit_costs?.toFixed(2)
      },
      {
        key: '9',
        parameter: 'Total Cost (including units)',
        eoq: results?.total_cost?.toFixed(2),
        fixed: results.results_using_fixed?.total_cost?.toFixed(2)
      }
    ];

    if (formData.use_reorder_point) {
      dataSource.splice(1, 0, {
        key: '10',
        parameter: 'Reorder Point',
        eoq: results?.reorder_point?.toFixed(2),
        fixed: results.results_using_fixed?.reorder_point?.toFixed(2)
      });
    }

    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        size="middle"
      />
    );
  };

  const renderResults = () => (
    <Card title="Analysis Results">
      <Title level={4} style={{ marginBottom: 24 }}>EOQ Analysis Results</Title>
      {renderResultsTable()}

      {formData.use_reorder_point && (
        <>
          <Divider />
          <Title level={5}>Reorder Point Information</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Lead Time:</Text> {formData.lead_time} days<br/>
              <Text strong>Days per Year:</Text> {formData.days_per_year}
            </Col>
            <Col span={12}>
              <Text strong>Daily Demand:</Text> {formData.daily_demand || (formData.demand / formData.days_per_year).toFixed(2)}
            </Col>
          </Row>
        </>
      )}
    </Card>
  );

  return (
    <Card title={fileName || "EOQ Analysis"} style={{ margin: 16 }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Input Parameters" key="input">
          {renderInputForm()}
        </TabPane>
        <TabPane tab="Analysis Results" key="results" disabled={!results}>
          {results ? renderResults() : (
            <Alert
              message="No results available"
              description="Please provide input parameters and save the analysis"
              type="info"
              showIcon
            />
          )}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default EOQAnalysis;