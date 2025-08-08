import React, { useState, useEffect } from 'react';
import {
  Card, Tabs, Table, InputNumber, Button, Row, Col,
  message, Select, Modal, Input, Radio, Space
} from 'antd';
import axios from 'axios';

const { TabPane } = Tabs;
const { Option } = Select;

const AddItemModal = ({
  visible,
  onConfirm,
  onCancel,
  newItemName,
  setNewItemName,
  useDefaultName,
  setUseDefaultName,
  defaultNamePrefix,
  customLabel
}) => {
  const handleChange = (e) => {
    setNewItemName(e.target.value);
  };

  return (
    <Modal
      title="Add New Item"
      visible={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Add Item"
      cancelText="Cancel"
    >
      <Radio.Group
        onChange={(e) => setUseDefaultName(e.target.value)}
        value={useDefaultName}
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical">
          <Radio value={true}>Use default name ({defaultNamePrefix})</Radio>
          <Radio value={false}>Provide custom name</Radio>
        </Space>
      </Radio.Group>

      {!useDefaultName && (
        <Input
          placeholder={`Enter ${customLabel} name`}
          value={newItemName}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      )}
    </Modal>
  );
};

const CrossoverAnalysis = ({ fileId, fileName, setSelectedFile, initialConfig }) => {
  const [activeTab, setActiveTab] = useState('input');
  const [costTypes, setCostTypes] = useState([]);
  const [costLabels, setCostLabels] = useState([]);
  const [options, setOptions] = useState({});
  const [volume, setVolume] = useState(100);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFileid, setCurrentFileid] = useState(fileId);
  const [isSaved, setIsSaved] = useState(false);

  // Add/Remove states for costs (rows)
  const [isAddCostModalVisible, setIsAddCostModalVisible] = useState(false);
  const [newCostName, setNewCostName] = useState('');
  const [useDefaultCostName, setUseDefaultCostName] = useState(true);

  // Add/Remove states for options (columns)
  const [isAddOptionModalVisible, setIsAddOptionModalVisible] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const [useDefaultOptionName, setUseDefaultOptionName] = useState(true);

  useEffect(() => {
    if (currentFileid) {
      loadFileData(currentFileid);
    } else if (initialConfig) {
      setCostTypes(initialConfig.costTypes);
      setCostLabels(initialConfig.costLabels);
      setOptions(initialConfig.options);
    }
  }, [currentFileid, initialConfig]);

  const loadFileData = async (id) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`/api/retrieve_crossover/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { input_data, output_data } = response.data;
      setCostTypes(input_data.cost_types);
      setCostLabels(input_data.cost_labels.map(label =>
        label.toLowerCase().includes('variable') ? 'variable' : 'fixed'
      ));
      setOptions(input_data.options);
      setVolume(input_data.volume || 100);

      if (output_data) {
        Object.values(output_data.data.breakeven_points).forEach(item => {
          item.units = Number(item.units);
          item.dollars = Number(item.dollars);
        });

        Object.keys(output_data.data.volume_analysis.total_costs).forEach(option => {
          output_data.data.volume_analysis.total_fixed_costs[option] =
            Number(output_data.data.volume_analysis.total_fixed_costs[option]);
          output_data.data.volume_analysis.total_variable_costs[option] =
            Number(output_data.data.volume_analysis.total_variable_costs[option]);
          output_data.data.volume_analysis.total_costs[option] =
            Number(output_data.data.volume_analysis.total_costs[option]);
        });

        setResults(output_data.data);
        setActiveTab('output');
      }
      setIsSaved(true);
    } catch (error) {
      message.error('Failed to load file data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        name: fileName || 'Crossover Analysis',
        input_data: {
          cost_types: costTypes,
          cost_labels: costLabels.map(label =>
            label === 'fixed' ? 'Fixed cost' : 'Variable cost'
          ),
          volume,
          options
        }
      };

      let response;
      if (currentFileid) {
        response = await axios.put(`/api/update_crossover/${currentFileid}/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.post('/api/save_crossover/', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.id) {
          setCurrentFileid(response.data.id);
        }
      }

      if (response.data.output_data && response.data.output_data.data) {
        setResults(response.data.output_data.data);
      } else {
        message.warning('No output data available. Please check inputs.');
        console.log('nothing');
        setResults(null);
      }
      setTimeout(() => setActiveTab('output'), 100);
      setIsSaved(true);
      message.success(isSaved ? 'Analysis updated successfully' : 'Analysis saved successfully');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCostTypeChange = (index, value) => {
    const newLabels = [...costLabels];
    newLabels[index] = value;
    setCostLabels(newLabels);
  };

  const handleOptionChange = (costIndex, optionName, value) => {
    setOptions(prev => ({
      ...prev,
      [optionName]: prev[optionName].map((v, i) => i === costIndex ? value : v)
    }));
  };

  // Cost (row) management functions
  const handleAddCost = () => {
    setNewCostName('');
    setUseDefaultCostName(true);
    setIsAddCostModalVisible(true);
  };

  const handleAddCostConfirm = () => {
    const costName = useDefaultCostName
      ? `Cost ${costTypes.length + 1}`
      : newCostName || `Cost ${costTypes.length + 1}`;

    const newCostType = costName;
    const newCostLabel = 'fixed'; // Default to fixed cost

    // Add new cost to all options with default value 0
    const updatedOptions = { ...options };
    Object.keys(updatedOptions).forEach(option => {
      updatedOptions[option] = [...updatedOptions[option], 0];
    });

    setCostTypes([...costTypes, newCostType]);
    setCostLabels([...costLabels, newCostLabel]);
    setOptions(updatedOptions);
    setIsAddCostModalVisible(false);
    setNewCostName('');
  };

  const handleRemoveCost = (index) => {
    if (costTypes.length <= 2) {
      message.warning('Minimum 1 cost required');
      return;
    }

    Modal.confirm({
      title: 'Remove Cost',
      content: `Are you sure you want to remove "${costTypes[index]}"?`,
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setCostTypes(prev => prev.filter((_, i) => i !== index));
        setCostLabels(prev => prev.filter((_, i) => i !== index));

        // Remove this cost from all options
        const updatedOptions = { ...options };
        Object.keys(updatedOptions).forEach(option => {
          updatedOptions[option] = updatedOptions[option].filter((_, i) => i !== index);
        });
        setOptions(updatedOptions);
      },
    });
  };

  // Option (column) management functions
  const handleAddOption = () => {
    setNewOptionName('');
    setUseDefaultOptionName(true);
    setIsAddOptionModalVisible(true);
  };

  const handleAddOptionConfirm = () => {
    const optionName = useDefaultOptionName
      ? `Option ${Object.keys(options).length + 1}`
      : newOptionName || `Option ${Object.keys(options).length + 1}`;

    // Add new option with default values (0 for each cost)
    const newOptionValues = Array(costTypes.length).fill(0);

    setOptions({
      ...options,
      [optionName]: newOptionValues
    });
    setIsAddOptionModalVisible(false);
    setNewOptionName('');
  };

  const handleRemoveOption = (optionName) => {
    if (Object.keys(options).length <= 2) {
      message.warning('Minimum 2 options required');
      return;
    }

    Modal.confirm({
      title: 'Remove Option',
      content: `Are you sure you want to remove "${optionName}"?`,
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        const updatedOptions = { ...options };
        delete updatedOptions[optionName];
        setOptions(updatedOptions);
      },
    });
  };

  const renderInputTab = () => (
    <div>
      <Card title="Volume for volume analysis" style={{ marginBottom: 16 }}>
        <InputNumber
          min={0}
          value={volume}
          onChange={setVolume}
          style={{ width: '100%' }}
        />
      </Card>

      <Card
        title="Cost Options"
        extra={
          <Space>
            <Button type="primary" onClick={handleAddCost}>
              Add Cost
            </Button>
            <Button type="primary" onClick={handleAddOption}>
              Add Option
            </Button>
          </Space>
        }
      >
        <Table
          columns={[
            {
              title: 'Cost Name',
              dataIndex: 'costName',
              key: 'costName',
              render: (text, record, index) => (
                <div>
                  {text}
                  <Button
                    danger
                    size="small"
                    style={{ marginLeft: 8 }}
                    onClick={() => handleRemoveCost(index)}
                    disabled={costTypes.length <= 2}
                  >
                    Remove
                  </Button>
                </div>
              ),
              width: '20%'
            },
            {
              title: 'Cost Type',
              dataIndex: 'costLabel',
              key: 'costLabel',
              render: (text, record, index) => (
                <Select
                  style={{ width: '100%' }}
                  value={costLabels[index]}
                  onChange={value => handleCostTypeChange(index, value)}
                >
                  <Option value="fixed">Fixed cost</Option>
                  <Option value="variable">Variable cost</Option>
                </Select>
              ),
              width: '20%'
            },
            ...Object.keys(options).map(option => ({
              title: (
                <div>
                  {option}
                  <Button
                    danger
                    size="small"
                    style={{ marginLeft: 8 }}
                    onClick={() => handleRemoveOption(option)}
                    disabled={Object.keys(options).length <= 2}
                  >
                    Remove
                  </Button>
                </div>
              ),
              dataIndex: option,
              key: option,
              render: (text, record, costIndex) => (
                <InputNumber
                  min={0}
                  value={options[option][costIndex]}
                  onChange={value => handleOptionChange(costIndex, option, value)}
                  style={{ width: '100%' }}
                />
              ),
              width: `${60 / Object.keys(options).length}%`
            }))
          ]}
          dataSource={costTypes.map((type, index) => ({
            key: type,
            costName: type,
            costLabel: costLabels[index],
            ...Object.keys(options).reduce((acc, option) => {
              acc[option] = options[option][index];
              return acc;
            }, {})
          }))}
          pagination={false}
          bordered
          size="middle"
        />
      </Card>

      <Row justify="end" style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={saveData}
          loading={isLoading}
          disabled={costTypes.length === 0}
        >
          {isSaved ? 'Calculate & Update' : 'Calculate & Save'}
        </Button>
      </Row>

      {/* Add Cost Modal */}
      <AddItemModal
        visible={isAddCostModalVisible}
        onConfirm={handleAddCostConfirm}
        onCancel={() => setIsAddCostModalVisible(false)}
        newItemName={newCostName}
        setNewItemName={setNewCostName}
        useDefaultName={useDefaultCostName}
        setUseDefaultName={setUseDefaultCostName}
        defaultNamePrefix={`Cost ${costTypes.length + 1}`}
        customLabel="cost"
      />

      {/* Add Option Modal */}
      <AddItemModal
        visible={isAddOptionModalVisible}
        onConfirm={handleAddOptionConfirm}
        onCancel={() => setIsAddOptionModalVisible(false)}
        newItemName={newOptionName}
        setNewItemName={setNewOptionName}
        useDefaultName={useDefaultOptionName}
        setUseDefaultName={setUseDefaultOptionName}
        defaultNamePrefix={`Option ${Object.keys(options).length + 1}`}
        customLabel="option"
      />
    </div>
  );

  const renderOutputTab = () => {
    if (!results || Object.keys(results).length === 0) {
      return <div>No results available</div>;
    }
    return (
      <div>
        <Card title="Breakeven Points" style={{ marginBottom: 16 }}>
          <Table
            columns={[
              { title: 'Comparison', dataIndex: 'comparison', key: 'comparison' },
              {
                title: 'Breakeven Units',
                dataIndex: 'units',
                key: 'units',
                render: units => typeof units === 'number' ? units.toFixed(2) : units
              },
              {
                title: 'Breakeven Dollars',
                dataIndex: 'dollars',
                key: 'dollars',
                render: dollars => typeof dollars === 'number' ? `$${dollars.toFixed(2)}` : dollars
              }
            ]}
            dataSource={Object.entries(results?.breakeven_points || {}).map(([comparison, data]) => ({
              key: comparison,
              comparison,
              units: data.units,
              dollars: data.dollars
            }))}
            pagination={false}
            bordered
          />
        </Card>

        <Card title="Volume Analysis">
          <Table
            columns={[
              { title: 'Option', dataIndex: 'option', key: 'option' },
              {
                title: 'Fixed Cost',
                dataIndex: 'fixed',
                key: 'fixed',
                render: fixed => typeof fixed === 'number' ? `$${fixed.toFixed(2)}` : fixed
              },
              {
                title: 'Variable Cost',
                dataIndex: 'variable',
                key: 'variable',
                render: variable => typeof variable === 'number' ? `$${variable.toFixed(2)}` : variable
              },
              {
                title: 'Total Cost',
                dataIndex: 'total',
                key: 'total',
                render: total => typeof total === 'number' ? `$${total.toFixed(2)}` : total
              }
            ]}
            dataSource={Object.keys(results.volume_analysis.total_costs).map(option => ({
              key: option,
              option,
              fixed: results.volume_analysis.total_fixed_costs[option],
              variable: results.volume_analysis.total_variable_costs[option],
              total: results.volume_analysis.total_costs[option]
            }))}
            pagination={false}
            bordered
          />
        </Card>
      </div>
    );
  };

  return (
    <Card title={fileName + ' - Crossover Analysis' || 'Crossover Analysis'}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Input Data" key="input">
          {renderInputTab()}
        </TabPane>
        <TabPane tab="Results" key="output">
          {renderOutputTab()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default CrossoverAnalysis;