import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tabs,
  InputNumber,
  Button,
  Typography,
  Alert,
  Modal,
  message,
} from "antd";
import axios from "axios";

const { TabPane } = Tabs;
const { Title } = Typography;

const ReorderPointNormalDist = ({
  fileId,
  fileName,
  setSelectedFile,
  isSaved,
  setIsSaved,
}) => {
  const [formData, setFormData] = useState({
    daily_demand: 0,
    daily_std_dev: 0,
    service_level: 0,
    lead_time: 0,
    lead_time_std_dev: 0,
  });

  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("input");

  const getAuthToken = () => localStorage.getItem("access_token");

  useEffect(() => {
    if (fileId) {
      const fetchSavedData = async () => {
        try {
          const token = getAuthToken();
          const response = await axios.get(
            `/api/retrieve_reorder_normal_dist/${fileId}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const input = response.data.input_data;
          const output = response.data.output_data;

          setFormData({ ...input });
          setResults(output);
          setActiveTab("results");
        } catch (error) {
          console.error("Error loading saved data:", error);
        }
      };

      fetchSavedData();
    } else {
      setFormData({
        daily_demand: 0,
        daily_std_dev: 0,
        service_level: 0,
        lead_time: 0,
        lead_time_std_dev: 0,
      });
      setResults(null);
      setActiveTab("input");
    }
  }, [fileId]);

  const handleSave = async () => {
    try {
      const token = getAuthToken();
      const url = fileId
        ? `/api/update_reorder_normal_dist/${fileId}/`
        : `/api/save_reorder_normal_dist/`;

      const response = await axios({
        method: fileId ? "put" : "post",
        url,
        data: { name: fileName, input_data: formData },
        headers: { Authorization: `Bearer ${token}` },
      });

      setResults(response.data.output_data);
      setIsSaved(true);
      setActiveTab("results");
      message.success(fileId ? "Analysis updated!" : "Analysis saved!");
    } catch (error) {
      const err = error.response?.data?.error;
      if (Array.isArray(err)) {
        Modal.error({ title: "Validation Error", content: err.join(" ") });
      } else {
        Modal.error({ title: "Error", content: err || "Calculation failed" });
      }
    }
  };

  const inputColumns = [
    { title: "Parameter", dataIndex: "param", key: "param" },
    { title: "Value", dataIndex: "input", key: "input" },
  ];

  const inputData = [
    {
      key: "1",
      param: "Daily Demand (d-bar)",
      input: (
        <InputNumber
          value={formData.daily_demand}
          onChange={(v) =>
            setFormData({ ...formData, daily_demand: v })
          }
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "2",
      param: "Daily Demand Std Dev (σd)",
      input: (
        <InputNumber
          value={formData.daily_std_dev}
          onChange={(v) =>
            setFormData({ ...formData, daily_std_dev: v })
          }
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "3",
      param: "Service Level (%)",
      input: (
        <InputNumber
          value={formData.service_level}
          onChange={(v) =>
            setFormData({ ...formData, service_level: v })
          }
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "4",
      param: "Lead Time (L in days)",
      input: (
        <InputNumber
          value={formData.lead_time}
          onChange={(v) => setFormData({ ...formData, lead_time: v })}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "5",
      param: "Lead Time Std Dev (σL)",
      input: (
        <InputNumber
          value={formData.lead_time_std_dev}
          onChange={(v) =>
            setFormData({ ...formData, lead_time_std_dev: v })
          }
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  const resultTable = results && (
    <Table
      columns={[
        { title: "Parameter", dataIndex: "parameter", key: "parameter" },
        { title: "Value", dataIndex: "value", key: "value", align: "right" },
      ]}
      dataSource={[
        { key: "1", parameter: "Z value", value: results["Z value"] },
        {
          key: "2",
          parameter: "Expected demand during lead time",
          value: results["Expected demand during lead time"],
        },
        {
          key: "3",
          parameter: "Safety Stock",
          value: results["Safety Stock"],
        },
        {
          key: "4",
          parameter: "Reorder point",
          value: results["Reorder point"],
        },
      ]}
      pagination={false}
      bordered
    />
  );

  return (
    <Card title={fileName + " Reorder Point/ Safety Stock (Normal Distribution)" || "Reorder Point/ Safety Stock (Normal Distribution)"}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Input Parameters" key="input">
          <Table
            columns={inputColumns}
            dataSource={inputData}
            pagination={false}
            showHeader={false}
            bordered
          />
          <Button
            type="primary"
            onClick={handleSave}
            style={{ marginTop: 16 }}
          >
            {isSaved ? "Update Analysis" : "Save & Calculate"}
          </Button>
        </TabPane>

        <TabPane tab="Analysis Results" key="results" disabled={!results}>
          {!results ? (
            <Alert
              message="Results not calculated"
              description="Please enter the inputs and press 'Calculate' to generate results."
              type="info"
              showIcon
            />
          ) : (
            <Card>
              <Title level={5}>Calculated Outputs</Title>
              {resultTable}
            </Card>
          )}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default ReorderPointNormalDist;
