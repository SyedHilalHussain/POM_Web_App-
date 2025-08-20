// QuantityDiscountEOQ.js
import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tabs,
  Button,
  InputNumber,
  Input,
  message,
  Row,
  Col,
} from "antd";
import axios from "axios";

const { TabPane } = Tabs;

const QuantityDiscountEOQ = ({
  fileId,
  fileName,
  setSelectedFile,
  initialConfig,
}) => {
  const [activeTab, setActiveTab] = useState("input");
  const [data, setData] = useState([]);
  const [headerInputs, setHeaderInputs] = useState({
    demand_rate: "",
    setup_cost: "",
    holding_cost: "",
    num_ranges: 0,
  });
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const getAuthToken = () => localStorage.getItem("access_token");

  // Normalize backend "details" keys (setup_cost vs total_setup_cost, etc.)
  const normalizeDetails = (details = []) =>
    details.map((row) => ({
      range: row.range,
      q_star: row.q_star,
      order_quantity: row.order_quantity,
      setup_cost: row.setup_cost ?? row.total_setup_cost,
      holding_cost: row.holding_cost ?? row.total_holding_cost,
      unit_cost: row.unit_cost ?? row.total_unit_cost,
      total_cost: row.total_cost,
    }));

  // Normalize ranges so every row ALWAYS has `row_name`
  const normalizeRows = (ranges = [], rowNames = []) =>
    ranges.map((r, i) => ({
      lower: r.lower ?? null,
      upper: r.upper ?? null,
      price: r.price ?? null,
      // accept any of: existing row_name, "name" from modal, or rowNames[i] from backend; fallback to "Range i"
      row_name: r.row_name ?? r.name ?? rowNames[i] ?? `Range ${i + 1}`,
    }));

  useEffect(() => {
    if (fileId) {
      loadData(fileId);
    } else if (initialConfig) {
      setHeaderInputs({
        demand_rate: initialConfig.demand_rate || "",
        setup_cost: initialConfig.setup_cost || "",
        holding_cost: initialConfig.holding_cost || "",
      });
      // initialConfig.ranges have `name`; initialConfig.priceRangeNames exists
      setData(
        normalizeRows(
          initialConfig.ranges || [],
          initialConfig.priceRangeNames || initialConfig.row_names
        )
      );
    }
  }, [fileId, initialConfig]);

  const loadData = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) return message.error("Not authenticated.");
      setIsLoading(true);

      const res = await axios.get(`/api/retrieve_quantityDiscountEoq/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { input_data, output_data, chart_url } = res.data;

      setHeaderInputs({
        demand_rate: input_data?.demand_rate,
        setup_cost: input_data?.setup_cost,
        holding_cost: input_data?.holding_cost,
      });

      // ✅ ranges + row_names -> rows with row_name
      setData(
        normalizeRows(input_data?.ranges || [], input_data?.row_names || [])
      );

      setResults({
        ...output_data,
        chart_url,
        details: normalizeDetails(output_data?.details),
      });

      setActiveTab("output");
      setIsSaved(true);
    } catch (err) {
      message.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    setData((prev) => {
      const newData = [...prev];
      newData[index][field] = value;
      return newData;
    });
  };

  const saveData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return message.error("Not authenticated.");
      setIsLoading(true);

      const payload = {
        name: fileName + " - Quantity Discount EOQ" || "Quantity Discount EOQ",
        input_data: {
          ...headerInputs,
          num_ranges: data.length,
          ranges: data.map((d) => ({
            lower: Number(d.lower),
            upper: Number(d.upper),
            price: Number(d.price),
          })),
          row_names: data.map((row) => row.row_name), // ✅ critical for retrieve
        },
      };

      let res;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (fileId)
        res = await axios.put(
          `/api/update_quantityDiscountEoq/${fileId}/`,
          payload,
          config
        );
      else
        res = await axios.post(
          "/api/save_quantityDiscountEoq/",
          payload,
          config
        );

      const { output_data, chart_url } = res.data;
      const normalizeDetails = (details) =>
        details.map((row) => ({
          range: row.range,
          q_star: row.q_star,
          order_quantity: row.order_quantity,
          setup_cost: row.setup_cost ?? row.total_setup_cost,
          holding_cost: row.holding_cost ?? row.total_holding_cost,
          unit_cost: row.unit_cost ?? row.total_unit_cost,
          total_cost: row.total_cost,
        }));

      setResults({
        ...output_data,
        chart_url,
        details: normalizeDetails(output_data.details),
      });
      setActiveTab("output");
      setIsSaved(true);
      message.success(fileId ? "Updated successfully" : "Saved successfully");
    } catch (err) {
      message.error("Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const inputColumns = [
    {
      title: "Name",
      dataIndex: "row_name", // ✅ was "name"
      key: "row_name",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(index, "row_name", e.target.value)}
        />
      ),
    },
    {
      title: "Lower",
      dataIndex: "lower",
      key: "lower",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(index, "lower", e.target.value)}
        />
      ),
    },
    {
      title: "Upper",
      dataIndex: "upper",
      key: "upper",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(index, "upper", e.target.value)}
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(index, "price", e.target.value)}
        />
      ),
    },
  ];

  const renderInputTab = () => (
    <Card title="Input Data">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <label>Demand Rate</label>
          <Input
            value={headerInputs.demand_rate}
            onChange={(e) =>
              setHeaderInputs({ ...headerInputs, demand_rate: e.target.value })
            }
          />
        </Col>
        <Col span={6}>
          <label>Setup Cost</label>
          <Input
            value={headerInputs.setup_cost}
            onChange={(e) =>
              setHeaderInputs({ ...headerInputs, setup_cost: e.target.value })
            }
          />
        </Col>
        <Col span={6}>
          <label>Holding Cost</label>
          <Input
            value={headerInputs.holding_cost}
            onChange={(e) =>
              setHeaderInputs({ ...headerInputs, holding_cost: e.target.value })
            }
          />
        </Col>
      </Row>

      <Table
        columns={inputColumns}
        dataSource={data}
        rowKey={(r, i) => i}
        pagination={false}
      />
      <Row justify="space-between" style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={saveData}
          loading={isLoading}
          disabled={!data.length}
        >
          {isSaved ? "Update Analysis" : "Save Analysis"}
        </Button>
      </Row>
    </Card>
  );

  const renderOutputTab = () => {
    if (!results)
      return (
        <p style={{ textAlign: "center" }}>No results. Please save first.</p>
      );

    return (
      <>
        <Card title="Optimal Results">
          <Table
            dataSource={Object.entries(results.result).map(([key, val]) => ({
              key,
              val,
            }))}
            rowKey="key"
            pagination={false}
            columns={[
              { title: "Measure", dataIndex: "key" },
              { title: "Value", dataIndex: "val" },
            ]}
          />
        </Card>

        <Card title="Detailed Table" style={{ marginTop: 24 }}>
          <Table
            dataSource={results.details}
            rowKey="range"
            pagination={false}
            columns={Object.keys(results.details[0] || {}).map((key) => ({
              title: key,
              dataIndex: key,
            }))}
          />
        </Card>

        {results.chart_url && (
          <Card title="EOQ Chart" style={{ marginTop: 24 }}>
            <img
              src={results.chart_url}
              alt="EOQ Chart"
              style={{ width: "100%" }}
            />
          </Card>
        )}
      </>
    );
  };

  return (
    <Card
      title={fileName + " - Quantity Discount EOQ" || "Quantity Discount EOQ"}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Input Data" key="input">
          {renderInputTab()}
        </TabPane>
        <TabPane tab="Output" key="output">
          {renderOutputTab()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default QuantityDiscountEOQ;
