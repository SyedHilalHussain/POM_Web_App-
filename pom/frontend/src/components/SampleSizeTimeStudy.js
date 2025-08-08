// SampleSizeTimeStudy.js
import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tabs,
  Button,
  InputNumber,
  Input,
  Select,
  message,
  Row,
  Col,
} from "antd";
import axios from "axios";

const { TabPane } = Tabs;
const { Option } = Select;

const SampleSizeTimeStudy = ({
  fileId,
  fileName,
  setSelectedFile,
  initialConfig,
}) => {
  const [activeTab, setActiveTab] = useState("input");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [inputData, setInputData] = useState([]);
  const [outputData, setOutputData] = useState(null);
  const [confidenceLevel, setConfidenceLevel] = useState("95% (1.96 sigma)");
  const [inputType, setInputType] = useState(initialConfig?.inputType || "raw");

  const [numCols, setNumCols] = useState(initialConfig?.numCols || 0);

  const getAuthToken = () => localStorage.getItem("access_token");

  const confidenceOptions = [
    "1 sigma (68.27%)",
    "2 sigma (95.45%)",
    "3 sigma (99.73%)",
    "4 sigma (9999.37%)",
    "90% (1.65 sigma)",
    "95% (1.96 sigma)",
    "98% (2.33 sigma)",
    "99% (2.58 sigma)",
  ];

  const loadData = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) return message.error("Not authenticated.");
      setIsLoading(true);
      const res = await axios.get(`/api/retrieve_sample_size_for_ts/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { input_data, output_data } = res.data;
      setInputType(input_data.objective === "Raw data" ? "raw" : "mean");
      setConfidenceLevel(input_data.confidence_level);
      setInputData(input_data.elements);

      setNumCols(input_data.elements?.[0]?.raw_data?.length || 0);


      setOutputData(output_data);
      setIsSaved(true);
      setActiveTab("input");
    } catch (err) {
      message.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   if (fileId) {
  //     setInputData([]);
  //     setOutputData(null);
  //     setIsSaved(false);
  //     setActiveTab("input");
  //     loadData(fileId);
  //   } else if (initialConfig) {
  //     const emptyElements = Array.from({ length: initialConfig.numRows }, () =>
  //       inputType === "mean"
  //         ? { accuracy: null, mean: null, std_dev: null }
  //         : {
  //             accuracy: null,
  //             raw_data: Array(initialConfig.numCols).fill(null),
  //           }
  //     );

  //     setInputData(emptyElements);
  //     setOutputData(null);
  //     setIsSaved(false);
  //     setActiveTab("input");
  //   }
  // }, [fileId, initialConfig]);

  useEffect(() => {
    const initializeNewFile = () => {
      const isMean = initialConfig?.inputType === "mean";
      const emptyElements = Array.from({ length: initialConfig.numRows }, () =>
        isMean
          ? { accuracy: null, mean: null, std_dev: null }
          : {
              accuracy: null,
              raw_data: Array(initialConfig.numCols).fill(null),
            }
      );

      setInputData(emptyElements);
      setInputType(initialConfig.inputType || "raw");
      setConfidenceLevel("95% (1.96 sigma)");
      setOutputData(null);
      setIsSaved(false);
      setActiveTab("input");
    };

    if (fileId) {
      // OPEN EXISTING FILE → Fetch from API
      setInputData([]);
      setOutputData(null);
      setIsSaved(false);
      setActiveTab("input");
      loadData(fileId);
    } else if (initialConfig) {
      // NEW FILE → Use modal config
      initializeNewFile();
    }
  }, [fileId, initialConfig]);

  const handleInputChange = (idx, field, value, subIdx = null) => {
    setInputData((prev) => {
      const updated = [...prev];
      if (inputType === "mean") {
        updated[idx][field] = value;
      } else {
        if (field === "accuracy") {
          updated[idx][field] = value;
        } else {
          updated[idx].raw_data[subIdx] = value;
        }
      }
      return updated;
    });
  };

  const saveData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return message.error("Not authenticated.");
      setIsLoading(true);

      const payload = {
        name: fileName || "Sample Study",
        input_data: {
          num_elements: inputData.length,
          objective:
            inputType === "mean" ? "Mean, Standard deviation" : "Raw data",
          confidence_level: confidenceLevel,
          elements: inputData,
        },
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const url = fileId
        ? `/api/update_sample_size_for_ts/${fileId}/`
        : "/api/save_sample_size_for_ts/";
      const method = fileId ? axios.put : axios.post;

      const res = await method(url, payload, config);
      setOutputData(res.data.output_data);
      setIsSaved(true);
      setActiveTab("output");
      message.success(fileId ? "Updated successfully" : "Saved successfully");
    } catch (err) {
      message.error("Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMeanInputTable = () => {
    const columns = [
      {
        title: "Element",
        dataIndex: "element",
        render: (_, __, idx) =>
          initialConfig?.rowNames?.[idx] || `Element ${idx + 1}`,
      },
      {
        title: "Accuracy %",
        render: (_, __, idx) => (
          <InputNumber
            value={inputData[idx].accuracy}
            onChange={(val) => handleInputChange(idx, "accuracy", val)}
          />
        ),
      },
      {
        title: "Mean",
        render: (_, __, idx) => (
          <InputNumber
            value={inputData[idx].mean}
            onChange={(val) => handleInputChange(idx, "mean", val)}
          />
        ),
      },
      {
        title: "Standard Deviation",
        render: (_, __, idx) => (
          <InputNumber
            value={inputData[idx].std_dev}
            onChange={(val) => handleInputChange(idx, "std_dev", val)}
          />
        ),
      },
    ];

    return (
      <Table
        dataSource={inputData}
        columns={columns}
        pagination={false}
        rowKey={(record, idx) => idx}
        bordered
      />
    );
  };

  const renderRawInputTable = () => {
    const columns = [
      {
        title: "Element",
        render: (_, __, idx) =>
          initialConfig?.rowNames?.[idx] || `Element ${idx + 1}`,
      },
      {
        title: "Accuracy %",
        render: (_, __, idx) => (
          <InputNumber
            value={inputData[idx].accuracy}
            onChange={(val) => handleInputChange(idx, "accuracy", val)}
          />
        ),
      },
      ...Array(numCols)
        .fill(null)
        .map((_, obsIdx) => ({
          title: initialConfig?.colNames?.[obsIdx] || `Obs ${obsIdx + 1}`,
          render: (_, __, idx) => (
            <InputNumber
              value={inputData[idx].raw_data?.[obsIdx]}
              onChange={(val) =>
                handleInputChange(idx, "raw_data", val, obsIdx)
              }
            />
          ),
        })),
    ];

    return (
      <Table
        dataSource={inputData}
        columns={columns}
        pagination={false}
        rowKey={(record, idx) => idx}
        bordered
      />
    );
  };

  const renderOutputTable = () => {
    if (!outputData)
      return (
        <p style={{ textAlign: "center" }}>
          No results yet. Please save first.
        </p>
      );

    const data = outputData.map((row, idx) => ({
      key: idx,
      Element: initialConfig?.rowNames?.[idx] || `Element ${idx + 1}`,
      ...row,
    }));

    const columns = [
      {
        title: "Element",
        dataIndex: "Element",
      },
      ...Object.keys(outputData[0] || {}).map((key) => ({
        title: key,
        dataIndex: key,
      })),
    ];

    return (
      <Card title="Output">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
        />
      </Card>
    );
  };

  return (
    <Card
      title={fileName || "Sample Size Time Study"}
      style={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        destroyInactiveTabPane
      >
        <TabPane tab="Input" key="input">
          <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
            <Col span={8}>
              <b>Confidence Level:</b>
              <Select
                value={confidenceLevel}
                onChange={setConfidenceLevel}
                style={{ width: "100%" }}
              >
                {confidenceOptions.map((c) => (
                  <Option key={c} value={c}>
                    {c}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          {inputType === "mean"
            ? renderMeanInputTable()
            : renderRawInputTable()}
          <Button
            type="primary"
            onClick={saveData}
            loading={isLoading}
            style={{ marginTop: 16 }}
          >
            {isSaved ? "Update Study" : "Save and Calculate"}
          </Button>
        </TabPane>
        <TabPane tab="Output" key="output" disabled={!isSaved || !outputData}>
          {renderOutputTable()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default SampleSizeTimeStudy;
