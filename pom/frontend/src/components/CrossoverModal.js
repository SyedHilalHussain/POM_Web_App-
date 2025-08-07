import React, { useState } from 'react';
import { Modal, Form, InputNumber, Radio, Space, Input, Row, Col, Alert } from 'antd';

const CrossoverModal = ({ isVisible, onClose, onConfirm }) => {
  const [form] = Form.useForm();
  const [numCostTypes, setNumCostTypes] = useState(2);
  const [numOptions, setNumOptions] = useState(2);
  const [costNaming, setCostNaming] = useState('default');
  const [optionNaming, setOptionNaming] = useState('default');
  const [customCostNamesInput, setCustomCostNamesInput] = useState('');
  const [customOptionNamesInput, setCustomOptionNamesInput] = useState('');

  const handleOk = () => {
    form.validateFields().then(values => {
      // Generate cost type names
      let costTypes = [];
      if (costNaming === 'default') {
        costTypes = Array(numCostTypes).fill().map((_, i) => `Cost Type ${i+1}`);
      } else if (costNaming === 'abc') {
        costTypes = Array(numCostTypes).fill().map((_, i) =>
          String.fromCharCode(97 + i).toUpperCase());
      } else if (costNaming === '123') {
        costTypes = Array(numCostTypes).fill().map((_, i) => `${i+1}`);
      } else {
        // Handle comma-separated custom names
        const names = customCostNamesInput.split(',').map(name => name.trim()).filter(name => name);
        if (names.length < numCostTypes) {
          // Fill remaining with default names if not enough provided
          costTypes = [...names, ...Array(numCostTypes - names.length).fill().map((_, i) => `Cost Type ${i+1}`)];
        } else {
          costTypes = names.slice(0, numCostTypes);
        }
      }

      // Generate option names
      let options = {};
      if (optionNaming === 'default') {
        Array(numOptions).fill().forEach((_, i) => {
          options[`Option ${i+1}`] = Array(numCostTypes).fill(0);
        });
      } else if (optionNaming === 'abc') {
        Array(numOptions).fill().forEach((_, i) => {
          options[String.fromCharCode(65 + i)] = Array(numCostTypes).fill(0);
        });
      } else if (optionNaming === '123') {
        Array(numOptions).fill().forEach((_, i) => {
          options[`${i+1}`] = Array(numCostTypes).fill(0);
        });
      } else {
        // Handle comma-separated custom names
        const names = customOptionNamesInput.split(',').map(name => name.trim()).filter(name => name);
        if (names.length < numOptions) {
          // Fill remaining with default names if not enough provided
          const allNames = [...names, ...Array(numOptions - names.length).fill().map((_, i) => `Option ${i+1}`)];
          allNames.forEach(name => {
            options[name] = Array(numCostTypes).fill(0);
          });
        } else {
          names.slice(0, numOptions).forEach(name => {
            options[name] = Array(numCostTypes).fill(0);
          });
        }
      }

      onConfirm({
        numCostTypes,
        numOptions,
        costTypes,
        costLabels: [...costTypes], // Using same names for labels initially
        options
      });
    });
  };

  return (
    <Modal
      title="Configure Crossover Analysis"
      visible={isVisible}
      onOk={handleOk}
      onCancel={onClose}
      width={650}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="numCostTypes"
              label="Number of Cost Types"
              initialValue={2}
              rules={[{ required: true }]}
            >
              <InputNumber
                min={1}
                max={10}
                onChange={val => setNumCostTypes(val)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="numOptions"
              label="Number of Options"
              initialValue={2}
              rules={[{ required: true }]}
            >
              <InputNumber
                min={2}
                max={10}
                onChange={val => setNumOptions(val)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Cost Type Naming Convention">
          <Radio.Group
            onChange={e => setCostNaming(e.target.value)}
            value={costNaming}
          >
            <Space direction="vertical">
              <Radio value="default">Default (Cost Type 1, Cost Type 2...)</Radio>
              <Radio value="abc">Alphabetic (A, B, C...)</Radio>
              <Radio value="123">Numeric (1, 2, 3...)</Radio>
              <Radio value="custom">Custom Names (comma separated)</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {costNaming === 'custom' && (
          <Form.Item
            label="Custom Cost Type Names"
            help={`Enter ${numCostTypes} names separated by commas`}
          >
            <Input
              value={customCostNamesInput}
              onChange={e => setCustomCostNamesInput(e.target.value)}
              placeholder="e.g., Labor, Materials, Machine, Overhead"
            />
            {customCostNamesInput && (
              <Alert
                style={{ marginTop: 8 }}
                message={`You've entered ${customCostNamesInput.split(',').filter(name => name.trim()).length} names`}
                type="info"
                showIcon
              />
            )}
          </Form.Item>
        )}

        <Form.Item label="Option Naming Convention">
          <Radio.Group
            onChange={e => setOptionNaming(e.target.value)}
            value={optionNaming}
          >
            <Space direction="vertical">
              <Radio value="default">Default (Option 1, Option 2...)</Radio>
              <Radio value="abc">Alphabetic (A, B, C...)</Radio>
              <Radio value="123">Numeric (1, 2, 3...)</Radio>
              <Radio value="custom">Custom Names (comma separated)</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {optionNaming === 'custom' && (
          <Form.Item
            label="Custom Option Names"
            help={`Enter ${numOptions} names separated by commas`}
          >
            <Input
              value={customOptionNamesInput}
              onChange={e => setCustomOptionNamesInput(e.target.value)}
              placeholder="e.g., Current, New, Alternative, Premium"
            />
            {customOptionNamesInput && (
              <Alert
                style={{ marginTop: 8 }}
                message={`You've entered ${customOptionNamesInput.split(',').filter(name => name.trim()).length} names`}
                type="info"
                showIcon
              />
            )}
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CrossoverModal;