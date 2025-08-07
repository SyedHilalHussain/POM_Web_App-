import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, Form, Input, InputNumber, Button, Table,
  Card, Tabs, Row, Col, Divider, message, Select,
  Radio, Space
} from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;
const { Option } = Select;
const AddItemModal = React.memo(({
  visible,
  onConfirm,
  onCancel,
  newItemName,
  setNewItemName,
  useDefaultName,
  setUseDefaultName
}) => {

  const handleChange = useCallback((e) => {
    setNewItemName(e.target.value);
  }, [setNewItemName]);

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
          <Radio value={true}>Use default name (Item)</Radio>
          <Radio value={false}>Provide custom name</Radio>
        </Space>
      </Radio.Group>

      {!useDefaultName && (
        <Input
          placeholder="Enter item name"
          value={newItemName}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      )}
    </Modal>
  );
});

const MultiproductBreakEven = ({ fileId, fileName, setSelectedFile, initialConfig }) => {
  // State variables
  const [form] = Form.useForm();
  const [setupForm] = Form.useForm();



  const [activeTab, setActiveTab] = useState('input');
  const [itemCount, setItemCount] = useState(2);
  const [fixedCost, setFixedCost] = useState(0);
  const [items, setItems] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

 // Add/Remove item states
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [useDefaultName, setUseDefaultName] = useState(true);
  const [itemToRemove, setItemToRemove] = useState(null);
  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };
// Add items work
//const AddItemModal = React.memo(() => {
//  const handleChange = useCallback((e) => {
//    setNewItemName(e.target.value);
//  }, []);
//  return (
//    <Modal
//      title="Add New Item"
//      visible={isAddItemModalVisible}
//      onOk={handleAddItemConfirm}
//      onCancel={() => setIsAddItemModalVisible(false)}
//      okText="Add Item"
//      cancelText="Cancel"
//    >
//      <Radio.Group
//        onChange={(e) => setUseDefaultName(e.target.value)}
//        value={useDefaultName}
//        style={{ marginBottom: 16 }}
//      >
//        <Space direction="vertical">
//          <Radio value={true}>Use default name (Item {items.length + 1})</Radio>
//          <Radio value={false}>Provide custom name</Radio>
//        </Space>
//      </Radio.Group>
//
//      {!useDefaultName && (
//         <Input
//          placeholder="Enter item name"
//          value={newItemName}
//          onChange={handleChange}
//          style={{ width: '100%' }}
//        />
//      )}
//    </Modal>
//  );
//});

//Remove Items work
  // Handle Remove Item
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
// Update the handleAddItem function to show the modal
const handleAddItem = useCallback(() => {

    setNewItemName('');
    setUseDefaultName(true);
    setIsAddItemModalVisible(true);
  }, [items.length]);
//Add the confirmation handler
// Handle Add Item Confirmation
  const handleAddItemConfirm = useCallback(() => {
    const itemName = useDefaultName
      ? `Item ${items.length + 1}`
      : newItemName || `Item ${items.length + 1}`;

    const newItem = {
      key: Date.now(), // Using timestamp for unique key
      name: itemName,
      price: 0,
      cost: 0,
      forecast: 0
    };

    setItems(prevItems => [...prevItems, newItem]);
    setIsAddItemModalVisible(false);
    setNewItemName('');
  }, [useDefaultName, newItemName, items.length]);


  // Effect to initialize items when itemCount changes
  useEffect(() => {
  if (fileId) {
    loadFileData(fileId);

  } else if (initialConfig) {
    const initialItems = initialConfig.itemNames.map((name, index) => ({
      key: index,
      name: initialConfig.itemNames[index],
      price: items[index]?.price || 0,  // Preserve existing value if available
      cost: items[index]?.cost || 0,    // Preserve existing value if available
      forecast: items[index]?.forecast || 0  // Preserve existing value if available
    }));
    setItems(initialItems);
    setItemCount(initialConfig.itemCount);
  }
}, [itemCount, fileId, initialConfig]);


  // Load existing file data
  const loadFileData = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("User is not authenticated.");
        return;
      }

      setIsLoading(true);
      const response = await axios.get(`/api/retrieve_multiproduct/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { input_data, output_data } = response.data;

      setFixedCost(input_data.fixed_cost);
      setItems(input_data.items.map((item, index) => ({
        key: index,
        ...item
      })));

      if (output_data) {
        setResults(output_data.data);
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



  // Save data to the server
  const saveData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("User is not authenticated.");
        return;
      }

      setIsLoading(true);

      const payload = {
        name: fileName || 'Multiproduct Break-Even Analysis',
        input_data: {
          fixed_cost: fixedCost,
          items: items.map(({ key, ...rest }) => rest)
        }
      };

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let response;
      if (fileId ) {
        // Create new file
        console.log(payload);
         response = await axios.put(`/api/update_multiproduct/${fileId}/`, payload, config);
//        response = await axios.post('/api/save_multiproduct/', payload, config);

      } else {
        // Update existing file
                response = await axios.post('/api/save_multiproduct/', payload, config);

//        response = await axios.put(`/api/update_multiproduct/${fileId}/`, payload, config);
      }

      // Update state with the response data without clearing inputs
      setResults(response.data.output_data.data);
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

  // Handle input table changes
  const handleItemChange = useCallback((index, field, value) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index][field] = value;
      return newItems;
    });
  }, []);

  // Input table columns
  const inputColumns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (text, record, index) => (
//        <Input
          text
//          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
//        />
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
      title: 'Unit Cost ($)',
      dataIndex: 'cost',
      key: 'cost',
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handleItemChange(index, 'cost', value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Forecast (Units)',
      dataIndex: 'forecast',
      key: 'forecast',
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handleItemChange(index, 'forecast', value)}
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

  // Output table columns
  const outputColumns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: value => `$${value.toFixed(2)}`
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: value => `$${value.toFixed(2)}`
    },
    {
      title: 'Forecast',
      dataIndex: 'forecast',
      key: 'forecast',
    },
    {
      title: 'V/P',
      dataIndex: 'vp',
      key: 'vp',
      render: value => value.toFixed(2)
    },
    {
      title: '1-(V/P)',
      dataIndex: 'one_minus_vp',
      key: 'one_minus_vp',
      render: value => value.toFixed(2)
    },
    {
      title: 'Forecast Sales $',
      dataIndex: 'forecast_sales_dollars',
      key: 'forecast_sales_dollars',
      render: value => `$${value.toFixed(2)}`
    },
    {
      title: '% of sales',
      dataIndex: 'sales_percentage',
      key: 'sales_percentage',
      render: value => `${(value * 100).toFixed(2)}%`
    },
    {
      title: 'Wtd Contribution',
      dataIndex: 'weighted_contribution',
      key: 'weighted_contribution',
      render: value => value.toFixed(4)
    }
  ];

  // Render input tab
  const renderInputTab = () => (
    <div>
      <Card title= "Fixed Costs" style={{ marginBottom: 16 }}>
        <InputNumber
          addonBefore="$"
          style={{ width: '100%' }}
          min={0}
          value={fixedCost}
          onChange={value => {
            setFixedCost(value);

          }}
        />
      </Card>

      <Card title="Product Data">
        <Table
          columns={inputColumns}
          dataSource={items}
          pagination={false}
          rowKey="key"
          bordered
        />

        <Row justify="end" style={{ marginTop: 16 }}>
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
    </div>
  );

  // Render output tab
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
        <Card title="Break-Even Analysis Results">
          <Table
            columns={outputColumns}
            dataSource={results.items}
            pagination={false}
            bordered
            rowKey="name"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={9}>
                    <strong>Break-even Point: ${results.breakeven_point.toFixed(2)}</strong>
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
    <div>


      {/* Main Content */}
    <Card
  title={fileName || 'Multiproduct Break-Even Analysis'}
  extra={
    <Space>
      <Button
        type="primary"
        onClick={handleAddItem}

      >
        Add Item
      </Button>

    </Space>
  }
>
 <AddItemModal
  visible={isAddItemModalVisible}
  onConfirm={handleAddItemConfirm}
  onCancel={() => setIsAddItemModalVisible(false)}
  newItemName={newItemName}
  setNewItemName={setNewItemName}
  useDefaultName={useDefaultName}
  setUseDefaultName={setUseDefaultName}
/>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Input Data" key="input">
            {renderInputTab()}
          </TabPane>
          <TabPane tab="Results" key="output">
            {renderOutputTab()}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default MultiproductBreakEven;