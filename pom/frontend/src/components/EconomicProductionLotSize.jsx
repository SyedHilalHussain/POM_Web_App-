import React, { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  Table,
  InputNumber,
  Button,
  Typography,
  Alert,
  Divider,
  Modal,
  message,
} from "antd";
import axios from "axios";

const { TabPane } = Tabs;
const { Title } = Typography;

const EconomicProductionLotSize = ({
  fileId,
  fileName,
  setSelectedFile,
  isSaved,
  setIsSaved,
}) => {
  const [formData, setFormData] = useState({
    D: 0,
    S: 0,
    unit_cost: 0,
    H: "",
    p: 0,
    d: 0,
    days_per_year: 0,
    order_quantity: 0,
  });

  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("input");

  const getAuthToken = () => localStorage.getItem("access_token");

  // useEffect(() => {
  //   if (fileId) {
  //     const fetchSavedData = async () => {
  //       try {
  //         const token = getAuthToken();
  //         const response = await axios.get(
  //           `/api/retrieve_economic_production_lotsize/${fileId}/`,
  //           {
  //             headers: { Authorization: `Bearer ${token}` },
  //           }
  //         );

  //         const input = response.data.input_data;
  //         const output = response.data.output_data;

  //         setFormData({
  //           D: input.D,
  //           S: input.S,
  //           unit_cost: input.unit_cost,
  //           H: input.H,
  //           p: input.p,
  //           d: input.d,
  //           days_per_year: input.days_per_year,
  //           order_quantity: input.order_quantity,
  //         });

  //         setResults({
  //           ...output,
  //           chart_url: response.data.chart_url,
  //         });

  //         setActiveTab("results");
  //       } catch (error) {
  //         console.error("Error loading saved data:", error);
  //       }
  //     };

  //     fetchSavedData();
  //   }
  // }, [fileId]);

  useEffect(() => {
    if (fileId) {
      // OLD FILE: Load from DB
      const fetchSavedData = async () => {
        try {
          const token = localStorage.getItem("access_token");
          const response = await axios.get(
            `/api/retrieve_economic_production_lotsize/${fileId}/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const input = response.data.input_data;
          const output = response.data.output_data;

          setFormData({
            D: input.D,
            S: input.S,
            unit_cost: input.unit_cost,
            H: input.H,
            p: input.p,
            d: input.d,
            days_per_year: input.days_per_year,
            order_quantity: input.order_quantity,
          });

          setResults({
            ...output,
            chart_url: response.data.chart_url,
          });

          setActiveTab("results");
        } catch (error) {
          console.error("Error loading saved data:", error);
        }
      };

      fetchSavedData();
    } else {
      // NEW FILE: Clear everything
      setFormData({
        D: 0,
        S: 0,
        unit_cost: 0,
        H: "",
        p: 0,
        d: 0,
        days_per_year: 0,
        order_quantity: 0,
      });
      setResults(null);
      setActiveTab("input");
    }
  }, [fileId]);

  const handleSave = async () => {
    try {
      const token = getAuthToken();
      const url = fileId
        ? `/api/update_economic_production_lotsize/${fileId}/`
        : "/api/save_economic_production_lotsize/";

      const response = await axios({
        method: fileId ? "put" : "post",
        url,
        data: { name: fileName, input_data: formData },
        headers: { Authorization: `Bearer ${token}` },
      });

      // setResults(response.data.output_data);
      setResults({
        ...response.data.output_data,
        chart_url: response.data.chart_url,
      });

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
      param: "Annual Demand (D)",
      input: (
        <InputNumber
          value={formData.D}
          onChange={(v) => setFormData({ ...formData, D: v })}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "2",
      param: "Setup/Ordering Cost (S)",
      input: (
        <InputNumber
          value={formData.S}
          onChange={(v) => setFormData({ ...formData, S: v })}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "3",
      param: "Holding Cost (%)",
      input: (
        <InputNumber
          value={parseFloat(formData.H)}
          onChange={(v) => setFormData({ ...formData, H: v + "%" })}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "4",
      param: "Daily Production Rate (p)",
      input: (
        <InputNumber
          value={formData.p}
          onChange={(v) => setFormData({ ...formData, p: v })}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "5",
      param: "Days per Year",
      input: (
        <InputNumber
          value={formData.days_per_year}
          onChange={(v) => setFormData({ ...formData, days_per_year: v })}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "6",
      param: "Daily Demand Rate (d)",
      input: (
        <InputNumber
          value={formData.d}
          onChange={(v) => setFormData({ ...formData, d: v })}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "7",
      param: "Unit Cost",
      input: (
        <InputNumber
          value={formData.unit_cost}
          onChange={(v) => setFormData({ ...formData, unit_cost: v })}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      key: "8",
      param: "Fixed Quantity",
      input: (
        <InputNumber
          value={formData.order_quantity}
          onChange={(v) => setFormData({ ...formData, order_quantity: v })}
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  const renderResultTable = () => {
    if (!results) return null;
    const isFixedZero = formData.order_quantity === 0;

    const data = [
      { parameter: "Annual Demand (D)", input: formData.D },
      { parameter: "Setup/Ordering Cost (S)", input: formData.S },
      { parameter: "Unit Cost", input: formData.unit_cost },
      { parameter: "Holding Cost (H)", input: formData.H },
      { parameter: "Daily Production Rate (p)", input: formData.p },
      { parameter: "Daily Demand Rate (d)", input: formData.d },
      { parameter: "Days per Year", input: results.days_per_year },
    ];

    const outputRows = isFixedZero
      ? [
          { parameter: "EPQ (Q*)", output: results.epq },
          { parameter: "Max Inventory Level", output: results.max_inventory },
          { parameter: "Average Inventory", output: results.average_inventory },
          {
            parameter: "Production Runs per Year",
            output: results.production_runs_per_year,
          },
          { parameter: "Annual Setup Cost", output: results.annual_setup_cost },
          {
            parameter: "Annual Holding Cost",
            output: results.annual_holding_cost,
          },
          {
            parameter: "Total Inventory Cost",
            output: results.total_inventory_cost,
          },
          { parameter: "Unit Costs (PD)", output: results.unit_costs_pd },
          {
            parameter: "Total Cost (Including Units)",
            output: results.total_cost_including_units,
          },
        ]
      : [
          {
            parameter: "EPQ (Q*)",
            output: results.epq,
            fixed: formData.order_quantity,
          },
          {
            parameter: "Max Inventory Level",
            output: results.max_inventory,
            fixed: results.custom_max_inventory,
          },
          {
            parameter: "Average Inventory",
            output: results.average_inventory,
            fixed: results.custom_average_inventory,
          },
          {
            parameter: "Production Runs per Year",
            output: results.production_runs_per_year,
            fixed: results.custom_production_runs_per_year,
          },
          {
            parameter: "Annual Setup Cost",
            output: results.annual_setup_cost,
            fixed: results.custom_annual_setup_cost,
          },
          {
            parameter: "Annual Holding Cost",
            output: results.annual_holding_cost,
            fixed: results.custom_annual_holding_cost,
          },
          {
            parameter: "Total Inventory Cost",
            output: results.total_inventory_cost,
            fixed: results.custom_total_inventory_cost,
          },
          {
            parameter: "Unit Costs (PD)",
            output: results.unit_costs_pd,
            fixed: results.unit_costs_pd,
          },
          {
            parameter: "Total Cost (Including Units)",
            output: results.total_cost_including_units,
            fixed: results.custom_total_cost_including_units,
          },
        ];

    // const columns = isFixedZero? [
    //       { title: "Parameter", dataIndex: "parameter" },
    //       { title: "Input", dataIndex: "input" },
    //       { title: "Output", dataIndex: "output", align: "right" },
    //     ] : [
    //       { title: "Parameter", dataIndex: "parameter" },
    //       { title: "Input", dataIndex: "input" },
    //       { title: "Results using EPQ", dataIndex: "output", align: "right" },
    //       {
    //         title: `Results using ${formData.order_quantity}`,
    //         dataIndex: "fixed",
    //         align: "right",
    //       },
    //     ];

    const columns = isFixedZero
      ? [
          { title: "Parameter", dataIndex: "parameter" },
          { title: "Results using EPQ", dataIndex: "output", align: "right" },
        ]
      : [
          { title: "Parameter", dataIndex: "parameter" },
          { title: "Results using EPQ", dataIndex: "output", align: "right" },
          {
            title: `Results using ${formData.order_quantity}`,
            dataIndex: "fixed",
            align: "right",
          },
        ];

    // const fullData = outputRows.map((row) => {
    //   const match = data.find((d) => d.parameter === row.parameter);
    //   return { key: row.parameter, input: match?.input || "", ...row };
    // });

    const fullData = outputRows.map((row) => ({
      key: row.parameter,
      ...row,
    }));

    return (
      <Table
        columns={columns}
        dataSource={fullData}
        pagination={false}
        bordered
      />
    );
  };

  return (
    <Card title={fileName + " - Economic Production Lot Size" || "Economic Production Lot Size"}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Input Parameters" key="input">
          <Table
            columns={inputColumns}
            dataSource={inputData}
            pagination={false}
            showHeader={false}
            bordered
          />
          <Button type="primary" onClick={handleSave} style={{ marginTop: 16 }}>
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
              {results?.chart_url && (
                <>
                  <Divider />
                  <Title level={5}>Graph</Title>
                  <img
                    src={results.chart_url}
                    alt="EPQ Graph"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </>
              )}
              {renderResultTable()}
            </Card>
          )}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default EconomicProductionLotSize;
