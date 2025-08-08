// TimeStudy.js
import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tabs,
  Button,
  InputNumber,
  message,
  Row,
  Col,
} from "antd";
import axios from "axios";

const { TabPane } = Tabs;

const TimeStudy = ({ fileId, fileName, setSelectedFile, initialConfig }) => {
  const [activeTab, setActiveTab] = useState("input");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [inputData, setInputData] = useState([]);
  const [outputData, setOutputData] = useState(null);
  const [allowancePercent, setAllowancePercent] = useState(10);
  const [numObservations, setNumObservations] = useState(0);

  const getAuthToken = () => localStorage.getItem("access_token");

  const loadData = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) return message.error("Not authenticated.");
      setIsLoading(true);
      const res = await axios.get(`/api/retrieve_time_study/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { input_data, output_data } = res.data;
      setAllowancePercent(input_data.allowance_percent);
      setInputData(input_data.data);
      setNumObservations(input_data.num_observations);
      setOutputData(output_data?.table || null);
      setIsSaved(true);
    } catch (err) {
      message.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fileId) {
      setInputData([]);
      setOutputData(null);
      setIsSaved(false);
      setActiveTab("input");
      loadData(fileId);
    } else if (initialConfig) {
      const rows = initialConfig.rowNames.map((label) => ({
        performance_rate: null,
        observations: Array(initialConfig.numCols).fill(null),
      }));
      setInputData(rows);
      setNumObservations(initialConfig.numCols);
      setOutputData(null);
      setIsSaved(false);
      setActiveTab("input");
    }
  }, [fileId, initialConfig]);

  const handleObservationChange = (elIdx, obsIdx, value) => {
    setInputData((prev) => {
      const updated = [...prev];
      updated[elIdx].observations[obsIdx] = value;
      return updated;
    });
  };

  const handlePerformanceChange = (elIdx, value) => {
    setInputData((prev) => {
      const updated = [...prev];
      updated[elIdx].performance_rate = value;
      return updated;
    });
  };

  const saveData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return message.error("Not authenticated.");
      setIsLoading(true);
      const payload = {
        name: fileName || "Simple Test",
        input_data: {
          num_elements: inputData.length,
          num_observations: inputData[0]?.observations?.length || numObservations,
          allowance_percent: allowancePercent,
          data: inputData,
        },
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };
      let res;
      if (fileId) {
        res = await axios.put(`/api/update_time_study/${fileId}/`, payload, config);
      } else {
        res = await axios.post("/api/save_time_study/", payload, config);
      }

      setOutputData(res.data.output_data?.table || null);
      setIsSaved(true);
      setActiveTab("output");
      message.success(fileId ? "Updated successfully" : "Saved successfully");
    } catch (err) {
      message.error("Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputTable = () => {
    const columns = [
      {
        title: "Element",
        dataIndex: "element",
        render: (_, record, index) => initialConfig?.rowNames?.[index] || `Element ${index + 1}`,
      },
      {
        title: "Perform rate %",
        dataIndex: "performance_rate",
        render: (val, record, rowIdx) => (
          <InputNumber
            value={val}
            onChange={(value) => handlePerformanceChange(rowIdx, value)}
          />
        ),
      },
      ...Array.from({ length: numObservations }, (_, i) => ({
        title: initialConfig?.colNames?.[i] || `Obs ${i + 1}`,
        dataIndex: `obs${i}`,
        render: (_, record, rowIdx) => (
          <InputNumber
            value={record.observations[i]}
            onChange={(value) => handleObservationChange(rowIdx, i, value)}
          />
        ),
      })),
    ];

    const dataSource = inputData.map((item, idx) => ({
      key: idx,
      performance_rate: item.performance_rate,
      observations: item.observations,
    }));

    return (
      <Card title="Input Data">
        <Row style={{ marginBottom: 12 }}>
          <Col span={6}><b>Allowance factor percentage (0–99):</b></Col>
          <Col span={6}>
            <InputNumber
              min={0}
              max={99}
              value={allowancePercent}
              onChange={setAllowancePercent}
            />
          </Col>
        </Row>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          bordered
        />
        <Button
          type="primary"
          onClick={saveData}
          loading={isLoading}
          style={{ marginTop: 16 }}
        >
          {isSaved ? "Update Study" : "Save Study"}
        </Button>
      </Card>
    );
  };

  const renderOutputTable = () => {
    if (!outputData || !isSaved) {
      return <p style={{ textAlign: "center" }}>No results yet. Please save first.</p>;
    }

    const nonEmptyColumns = Object.keys(outputData).filter((key) => {
      const col = outputData[key];
      return col && Object.values(col).some((val) => val !== "" && val !== null && val !== undefined);
    });

    const rowNames = nonEmptyColumns.length
      ? Object.keys(outputData[nonEmptyColumns[0]])
      : [];

    const columns = [
      {
        title: "",
        dataIndex: "rowName",
      },
      ...nonEmptyColumns.map((key) => ({
        title: key,
        dataIndex: key,
      })),
    ];

    const dataSource = rowNames.map((row) => {
      const rowData = { rowName: row };
      for (let col of nonEmptyColumns) {
        rowData[col] = outputData[col][row];
      }
      return rowData;
    });

    return (
      <Card title="Time Study Output">
        <Table columns={columns} dataSource={dataSource} pagination={false} bordered />
      </Card>
    );
  };

  return (
    <Card title={fileName + " - Time Study"|| "Time Study"}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} destroyInactiveTabPane>
        <TabPane tab="Input" key="input">
          {renderInputTable()}
        </TabPane>
        <TabPane tab="Output" key="output" disabled={!isSaved || !outputData}>
          {renderOutputTable()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default TimeStudy;
