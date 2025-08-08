// ABCAnalysis.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, Form, Input, InputNumber, Button, Table,
  Card, Tabs, Row, Col, Divider, message, Radio, Space
} from 'antd';
import axios from 'axios';

const { TabPane } = Tabs;

const ABCAnalysis = ({ fileId, fileName, setSelectedFile, initialConfig }) => {
  const [activeTab, setActiveTab] = useState('input');
  const [items, setItems] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [aPercent, setAPercent] = useState(20);
  const [bPercent, setBPercent] = useState(30);
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [useDefaultName, setUseDefaultName] = useState(true);
  const [itemToRemove, setItemToRemove] = useState(null);

  const getAuthToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    if (fileId) {
      loadFileData(fileId);
    } else if (initialConfig) {
      const initialItems = initialConfig.itemNames.map((name, index) => ({
        key: index,
        name: initialConfig.itemNames[index],
        demand: items[index]?.demand || 0,
        price: items[index]?.price || 0,
      }));
      setItems(initialItems);
      setAPercent(initialConfig.aPercent || 20);
      setBPercent(initialConfig.bPercent || 30);
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
      const response = await axios.get(`/api/retrieve_abc_analysis/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { input_data, output_data } = response.data;

      setItems(input_data.items.map((item, index) => ({
        key: index,
        ...item
      })));
      setAPercent(input_data.a_percent);
      setBPercent(input_data.b_percent);

      if (output_data) {
        setResults(output_data);
        setActiveTab('output');
      }

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
      name: fileName || 'ABC Analysis',
      a_percent: aPercent,  // Move to root level
      b_percent: bPercent,  // Move to root level
      items: items.map(({ key, ...rest }) => rest)  // Move to root level
    };

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let response;
      if (fileId) {
        response = await axios.put(`/api/update_abc_analysis/${fileId}/`, payload, config);
      } else {
        response = await axios.post('/api/save_abc_analysis/', payload, config);
      }

      setResults(response.data.output_data);
      setActiveTab('output');
      setIsSaved(true);
      message.success(isSaved ? 'Analysis updated successfully' : 'Analysis saved successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving data:', error);
      message.error('Failed to save analysis');
      setIsLoading(false);
    }
  };

  const handleItemChange = useCallback((index, field, value) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index][field] = value;
      return newItems;
    });
  }, []);

  const handleRemoveItem = useCallback((index) => {
    if (items.length <= 2) {
      message.warning('Minimum 2 items required');
      return;
    }

    setItemToRemove(index);

    Modal.confirm({
      title: 'Remove Item',
      content: `Are you sure you want to remove "${items[index].name}"?`,
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setItems(prevItems => prevItems.filter((_, i) => i !== index));
      },
    });
  }, [items]);

  const handleAddItem = useCallback(() => {
    setNewItemName('');
    setUseDefaultName(true);
    setIsAddItemModalVisible(true);
  }, [items.length]);

  const handleAddItemConfirm = useCallback(() => {
    const itemName = useDefaultName
      ? `Item ${items.length + 1}`
      : newItemName || `Item ${items.length + 1}`;

    const newItem = {
      key: Date.now(),
      name: itemName,
      demand: 0,
      price: 0
    };

    setItems(prevItems => [...prevItems, newItem]);
    setIsAddItemModalVisible(false);
    setNewItemName('');
  }, [useDefaultName, newItemName, items.length]);

  const inputColumns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (text) => text
    },
    {
      title: 'Demand',
      dataIndex: 'demand',
      key: 'demand',
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handleItemChange(index, 'demand', value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Price ($)',
      dataIndex: 'price',
      key: 'price',
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handleItemChange(index, 'price', value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Button
          danger
          onClick={() => handleRemoveItem(index)}
          disabled={items.length <= 2}
        >
          Remove
        </Button>
      )
    }
  ];

  const outputColumns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Demand',
      dataIndex: 'demand',
      key: 'demand',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: value => `$${value?.toFixed(2) || '0.00'}`
    },
    {
      title: 'Dollar Volume',
      dataIndex: 'dollar_volume',
      key: 'dollar_volume',
      render: value => `$${value?.toFixed(2) || '0.00'}`
    },
    {
      title: '% of $-Vol',
      dataIndex: 'percent_of_vol',
      key: 'percent_of_vol',
      render: value => value ? `${value.toFixed(2)}%` : '-'
    },
    {
      title: 'Cumulative $-vol %',
      dataIndex: 'cumulative_vol_percent',
      key: 'cumulative_vol_percent',
      render: value => value ? `${value.toFixed(2)}%` : '-'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    }
  ];

  const renderInputTab = () => (
    <div>
      <Card title="ABC Parameters" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="A Items Percentage">
              <InputNumber
                min={0}
                max={100}
                value={aPercent}
                onChange={setAPercent}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="B Items Percentage">
              <InputNumber
                min={0}
                max={100}
                value={bPercent}
                onChange={setBPercent}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="Item Data">
        <Table
          columns={inputColumns}
          dataSource={items}
          pagination={false}
          rowKey="key"
          bordered
        />

        <Row justify="space-between" style={{ marginTop: 16 }}>
          <Button type="primary" onClick={handleAddItem}>
            Add Item
          </Button>
          <Button
            type="primary"
            onClick={saveData}
            loading={isLoading}
            disabled={items.length === 0}
          >
            {isSaved ? 'Calculate & Update' : 'Calculate & Save'}
          </Button>
        </Row>
      </Card>

      <Modal
        title="Add New Item"
        visible={isAddItemModalVisible}
        onOk={handleAddItemConfirm}
        onCancel={() => setIsAddItemModalVisible(false)}
        okText="Add Item"
        cancelText="Cancel"
      >
        <Radio.Group
          onChange={(e) => setUseDefaultName(e.target.value)}
          value={useDefaultName}
          style={{ marginBottom: 16 }}
        >
          <Space direction="vertical">
            <Radio value={true}>Use default name (Item {items.length + 1})</Radio>
            <Radio value={false}>Provide custom name</Radio>
          </Space>
        </Radio.Group>

        {!useDefaultName && (
          <Input
            placeholder="Enter item name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            style={{ width: '100%' }}
          />
        )}
      </Modal>
    </div>
  );

  const renderOutputTab = () => {
    if (!results) {
      return (
        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <p>No results available. Please save your data first.</p>
          <Button type="primary" onClick={() => setActiveTab('input')}>
            Go to Input
          </Button>
        </div>
      );
    }

    return (
      <div>
        <Card title="ABC Analysis Results">
          <Table
            columns={outputColumns}
            dataSource={results.items}
            pagination={false}
            bordered
            rowKey="name"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={7}>
                    <strong>Total Volume: ${results.total_volume?.toFixed(2) || '0.00'}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>
      </div>
    );
  };

  return (
    <Card
      title={fileName + ' - ABC Analysis' || 'ABC Analysis'}
      extra={
        <Button type="primary" onClick={handleAddItem}>
          Add Item
        </Button>
      }
    >
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

export default ABCAnalysis;