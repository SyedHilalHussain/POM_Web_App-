import React, { useState } from "react";
import { Modal, Form, Input, Select, Radio, Space, InputNumber } from "antd";

const { Option } = Select;

const QuantityDiscountEOQModal = ({ isVisible, onClose, onConfirm }) => {
  const [form] = Form.useForm();
  const [namingConvention, setNamingConvention] = useState("default");

  //   const handleOk = () => {
  //   form.validateFields().then((values) => {
  //     let priceRangeNames = [];
  //     if (namingConvention === "default") {
  //       priceRangeNames = Array(values.priceRangeCount)
  //         .fill()
  //         .map((_, i) => `Range ${i + 1}`);
  //     } else if (namingConvention === "abc") {
  //       priceRangeNames = Array(values.priceRangeCount)
  //         .fill()
  //         .map((_, i) => String.fromCharCode(97 + i));
  //     } else if (namingConvention === "ABC") {
  //       priceRangeNames = Array(values.priceRangeCount)
  //         .fill()
  //         .map((_, i) => String.fromCharCode(65 + i));
  //     } else if (namingConvention === "123") {
  //       priceRangeNames = Array(values.priceRangeCount)
  //         .fill()
  //         .map((_, i) => `${i + 1}`);
  //     }

  //     // Build rows for QuantityDiscountEOQ
  //     const ranges = priceRangeNames.map((name) => ({
  //       name,
  //       lower: null,
  //       upper: null,
  //       price: null,
  //     }));

  //     onConfirm({
  //       priceRangeCount: values.priceRangeCount,
  //       priceRangeNames,
  //       ranges,   // 👈 send initial table rows too
  //     });
  //   });
  // };

  const handleOk = () => {
    form.validateFields().then((values) => {
      let priceRangeNames = [];
      if (namingConvention === "default") {
        priceRangeNames = Array(values.priceRangeCount)
          .fill()
          .map((_, i) => `Range ${i + 1}`);
      } else if (namingConvention === "ABC") {
        priceRangeNames = Array(values.priceRangeCount)
          .fill()
          .map((_, i) => String.fromCharCode(65 + i));
      } else if (namingConvention === "123") {
        priceRangeNames = Array(values.priceRangeCount)
          .fill()
          .map((_, i) => `${i + 1}`);
      }

      // Build ranges with placeholders 👇
      const ranges = priceRangeNames.map((name) => ({
        name,
        lower: null,
        upper: null,
        price: null,
      }));

      onConfirm({
        priceRangeCount: values.priceRangeCount,
        priceRangeNames,
        ranges, // ✅ send ranges
      });
    });
  };

  return (
    <Modal
      title="Create data set for Inventory Management"
      visible={isVisible}
      onOk={handleOk}
      onCancel={onClose}
      width={550}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="priceRangeCount"
          label="Number of Price Ranges"
          rules={[
            { required: true, message: "Please select number of Price Ranges" },
          ]}
        >
          <InputNumber
            min={2}
            style={{ width: 200 }}
            placeholder="Enter Number of Price Ranges"
          />
        </Form.Item>

        <Form.Item label="Row Names" name="namingConvention">
          <Radio.Group
            onChange={(e) => setNamingConvention(e.target.value)}
            value={namingConvention}
          >
            <Space direction="vertical">
              <Radio value="default">Range 1, Range 2, Range 3...</Radio>

              <Radio value="ABC">A, B, C, D, E...</Radio>
              <Radio value="123">1, 2, 3, 4, 5...</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuantityDiscountEOQModal;
