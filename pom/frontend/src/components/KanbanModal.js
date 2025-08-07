// KanbanModal.js
import React, { useState } from 'react';
import { Modal, Form, InputNumber, Radio } from 'antd';

const KanbanModal = ({ isVisible, onClose, onConfirm }) => {
  const [form] = Form.useForm();
  const [computationType, setComputationType] = useState('size');

  const handleOk = () => {
    form.validateFields().then(values => {
      onConfirm({
        computationType,
        parameters: values
      });
    });
  };

  return (
    <Modal
      title="Kanban Computation Setup"
      visible={isVisible}
      onOk={handleOk}
      onCancel={onClose}
      width={550}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="What to compute?" name="computationType">
          <Radio.Group
            onChange={(e) => setComputationType(e.target.value)}
            value={computationType}
          >
            <Radio value="size">Kanban Size</Radio>
            <Radio value="number">Number of Kanbans</Radio>
          </Radio.Group>
        </Form.Item>

        {computationType === 'size' && (
          <>
            <Form.Item
              name="dailyDemand"
              label="Daily Expected Demand"
              rules={[{ required: true, message: 'Please enter daily demand' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="leadTime"
              label="Lead time (Wait + process)"
              rules={[{ required: true, message: 'Please enter lead time' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="safetyStockPercent"
              label="Safety stock %"
              rules={[{ required: true, message: 'Please enter safety stock %' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}

        {computationType === 'number' && (
          <>
            <Form.Item
              name="dailyDemand"
              label="Daily Expected Demand"
              rules={[{ required: true, message: 'Please enter daily demand' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="leadTime"
              label="Lead time (Wait + process)"
              rules={[{ required: true, message: 'Please enter lead time' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="safetyStock"
              label="Safety stock"
              rules={[{ required: true, message: 'Please enter safety stock' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="kanbanSize"
              label="Kanban size"
              rules={[{ required: true, message: 'Please enter kanban size' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default KanbanModal;