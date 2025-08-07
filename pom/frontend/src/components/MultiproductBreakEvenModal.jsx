import React, { useState } from 'react';
import { Modal, Form, Input, Select, Radio, Space,InputNumber } from 'antd';

const { Option } = Select;

const MultiproductBreakEvenModal = ({ isVisible, onClose, onConfirm }) => {
  const [form] = Form.useForm();
  const [namingConvention, setNamingConvention] = useState('default');

  const handleOk = () => {
    form.validateFields().then(values => {
      // Generate item names based on the selected naming convention
      let itemNames = [];
      if (namingConvention === 'default') {
        itemNames = Array(values.itemCount).fill().map((_, i) => `Item ${i + 1}`);
      } else if (namingConvention === 'abc') {
        itemNames = Array(values.itemCount).fill().map((_, i) =>
          String.fromCharCode(97 + i));
      } else if (namingConvention === 'ABC') {
        itemNames = Array(values.itemCount).fill().map((_, i) =>
          String.fromCharCode(65 + i));
      } else if (namingConvention === '123') {
        itemNames = Array(values.itemCount).fill().map((_, i) => `${i + 1}`);
      }
console.log("MultiproductBreakEvenModal received onConfirm:", typeof onConfirm);

      onConfirm({

        itemCount: values.itemCount,
        itemNames
      });
    });
  };

  return (
    <Modal
      title="Create data set for Break-even Analysis"
      visible={isVisible}
      onOk={handleOk}
      onCancel={onClose}
      width={550}
    >
      <Form
        form={form}
        layout="vertical"

      >


        <Form.Item
          name="itemCount"
          label="Number of Items"
          rules={[{ required: true, message: 'Please select number of items' }]}
        >
         <InputNumber
    min={2}

    style={{ width: 200 }}
    placeholder="Enter Number of Items"
  />
        </Form.Item>

        <Form.Item label="Row Names" name="namingConvention">
          <Radio.Group
            onChange={(e) => setNamingConvention(e.target.value)}
            value={namingConvention}
          >
            <Space direction="vertical">
              <Radio value="default">Item 1, Item 2, Item 3...</Radio>

              <Radio value="ABC">A, B, C, D, E...</Radio>
              <Radio value="123">1, 2, 3, 4, 5...</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MultiproductBreakEvenModal;