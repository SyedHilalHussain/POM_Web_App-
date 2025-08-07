import React, { useState } from "react";
import { Modal, Form, Input, Select, Radio, Space, InputNumber } from "antd";

const { Option } = Select;

const SampleSizeTimeStudyModal = ({ isVisible, onClose, onConfirm }) => {
  const [form] = Form.useForm();
  // const [namingConvention, setNamingConvention] = useState("default");
  const [rowNaming, setRowNaming] = useState("Element");
  const [colNaming, setColNaming] = useState("Observation");

  const [inputType, setInputType] = useState("mean"); // default is mean

  const handleOk = () => {
    form.validateFields().then((values) => {
      const rowCount = values.numRows;
      const colCount = values.numCols;

      // Generate Row Names
      let rowNames = [];
      if (rowNaming === "Element") {
        rowNames = Array(rowCount)
          .fill()
          .map((_, i) => `Element${i + 1}`);
      } else if (rowNaming === "abc") {
        rowNames = Array(rowCount)
          .fill()
          .map((_, i) => String.fromCharCode(97 + i)); // a, b, c...
      } else if (rowNaming === "ABC") {
        rowNames = Array(rowCount)
          .fill()
          .map((_, i) => String.fromCharCode(65 + i)); // A, B, C...
      } else if (rowNaming === "123") {
        rowNames = Array(rowCount)
          .fill()
          .map((_, i) => `${i + 1}`);
      } else if (rowNaming === "months") {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        rowNames = Array(rowCount)
          .fill()
          .map((_, i) => months[i % 12]);
      } else {
        rowNames = Array(rowCount).fill("Custom");
      }

      // Generate Column Names
      let colNames = [];
      if (colNaming === "Observation") {
        colNames = Array(colCount)
          .fill()
          .map((_, i) => `Observation ${i + 1}`);
      } else if (colNaming === "abc") {
        colNames = Array(colCount)
          .fill()
          .map((_, i) => String.fromCharCode(97 + i)); // a, b, c...
      } else if (colNaming === "ABC") {
        colNames = Array(colCount)
          .fill()
          .map((_, i) => String.fromCharCode(65 + i)); // A, B, C...
      } else if (colNaming === "123") {
        colNames = Array(colCount)
          .fill()
          .map((_, i) => `${i + 1}`);
      } else if (colNaming === "months") {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        colNames = Array(colCount)
          .fill()
          .map((_, i) => months[i % 12]);
      } else {
        colNames = Array(colCount).fill("Custom");
      }

      // Final output
      onConfirm({
        numRows: rowCount,
        numCols: colCount,
        rowNaming,
        colNaming,
        rowNames,
        colNames,
        inputType
      });
    });
  };

  return (
    <Modal
      title="Create data set for Sample Size Time Study"
      visible={isVisible}
      onOk={handleOk}
      onCancel={onClose}
      width={550}
      bodyStyle={{
        maxHeight: "60vh", // Limit height of the content
        overflowY: "auto", // Enable vertical scroll if needed
      }}
      style={{
        top: 20, // Keeps the modal away from top edge
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Choose Input Method">
          <Radio.Group
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
          >
            <Radio value="mean">Mean & Standard Deviation</Radio>
            <Radio value="raw">Raw Data</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="numRows"
          label="Number of Elements"
          rules={[{ required: true, message: "Please enter number of rows" }]}
        >
          <InputNumber min={1} style={{ width: 250 }} />
        </Form.Item>

        {inputType === "raw" && (
          <>
            <Form.Item
              name="numCols"
              label="Sample Size"
              rules={[
                { required: true, message: "Please enter number of columns" },
              ]}
            >
              <InputNumber min={2} style={{ width: 250 }} />
            </Form.Item>
          </>
        )}

        <Form.Item label="Row Names">
          <Radio.Group
            onChange={(e) => setRowNaming(e.target.value)}
            value={rowNaming}
          >
            <Space direction="vertical">
              <Radio value="Element">Element1, Element2, Element3,...</Radio>
              <Radio value="abc">a, b, c, d, e,...</Radio>
              <Radio value="ABC">A, B, C, D, E,...</Radio>
              <Radio value="123">1, 2, 3, 4, 5,...</Radio>
              <Radio value="months">January, February, March,...</Radio>
              <Radio value="other">Other</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {inputType === "raw" && (
          <Form.Item label="Column Names">
            <Radio.Group
              onChange={(e) => setColNaming(e.target.value)}
              value={colNaming}
            >
              <Space direction="vertical">
                <Radio value="Observation">
                  Observation1, Observation2,...
                </Radio>
                <Radio value="abc">a, b, c, d,...</Radio>
                <Radio value="ABC">A, B, C, D,...</Radio>
                <Radio value="123">1, 2, 3, 4,...</Radio>
                <Radio value="months">January, February,...</Radio>
                <Radio value="other">Other</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default SampleSizeTimeStudyModal;
