// RegressionProjector.js
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

const RegressionProjector = ({
  fileId,
  fileName,
  setSelectedFile,
  initialConfig,
}) => {
  const [activeTab, setActiveTab] = useState("input");
  const [data, setData] = useState([]);
  const [intercept, setIntercept] = useState(0);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [outputCols, setOutputCols] = useState([]);


  const getAuthToken = () => localStorage.getItem("access_token");

  useEffect(() => {
    if (fileId) loadData(fileId);
    else if (initialConfig) {
      const rows = initialConfig.rowNames.map((label, idx) => ({
        key: `row${idx}`,
        label,
        coefficient: 0,
        values: Array(initialConfig.numCols).fill(null),
      }));
      setData(rows);
    }
  }, [fileId, initialConfig]);

  const loadData = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) return message.error("Not authenticated.");
      setIsLoading(true);
      const res = await axios.get(`/api/retrieve_regression_projector/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { input_data, output_data } = res.data;
      setIntercept(input_data.intercept || 0);
      const numForecasts = input_data.num_forecasts;
      const rows = input_data.coefficients.map((coef, idx) => ({
        key: `row${idx}`,
        label: input_data.row_names[idx],
        coefficient: coef,
        values: input_data.Forecasts[idx] || Array(numForecasts).fill(null),
      }));
      setData(rows);
      setResults(output_data?.table || []);
      setOutputCols(output_data?.col_names || []);
      setIsSaved(true);
      setActiveTab("output");
    } catch (err) {
      message.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    setData((prev) => {
      const newData = [...prev];
      newData[rowIndex].values[colIndex] = value;
      return newData;
    });
  };

  const handleCoefficientChange = (rowIndex, value) => {
    setData((prev) => {
      const newData = [...prev];
      newData[rowIndex].coefficient = value;
      return newData;
    });
  };

  const saveData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return message.error("Not authenticated.");
      setIsLoading(true);

      const payload = {
        name: fileName || "Regression Projector",
        input_data: {
          intercept,
          num_forecasts: data[0]?.values.length || 1,
          num_independent: data.length,
          coefficients: data.map((d) => d.coefficient),
          Forecasts: data.map((d) => d.values),
          row_names: data.map((d) => d.label),
          col_names: initialConfig?.colNames || [`Forecast 1`],
        },
      };

      let res;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (fileId)
        res = await axios.put(
          `/api/update_regression_projector/${fileId}/`,
          payload,
          config
        );
      else
        res = await axios.post(
          "/api/save_regression_projector/",
          payload,
          config
        );

      // setResults(res.data.output_data.table);
      // setActiveTab("output");
      // setIsSaved(true);
      // message.success(fileId ? "Updated successfully" : "Saved successfully");
      setResults(res.data.output_data.table);
      setOutputCols(res.data.output_data.col_names || []);
      setActiveTab("output");
      setIsSaved(true);
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
        title: "Label",
        dataIndex: "label",
        render: (text) => <strong>{text}</strong>,
      },
      {
        title: "Coefficient",
        dataIndex: "coefficient",
        render: (value, record, index) => (
          <InputNumber
            value={value}
            onChange={(val) => handleCoefficientChange(index, val)}
          />
        ),
      },
      ...(initialConfig?.colNames || []).map((colName, colIdx) => ({
        title: colName,
        dataIndex: `forecast_${colIdx}`,
        render: (_, record, rowIdx) => (
          <InputNumber
            value={record.values?.[colIdx]}
            onChange={(val) => handleCellChange(rowIdx, colIdx, val)}
          />
        ),
      })),
    ];

    const dataSource = data.map((row, i) => ({
      key: row.key,
      label: row.label,
      coefficient: row.coefficient,
      ...Object.fromEntries(row.values.map((v, j) => [`forecast_${j}`, v])),
    }));

    return (
      <Card title="Input Data">
        <Row style={{ marginBottom: 12 }}>
          <Col span={6}>
            <b>Intercept:</b>
          </Col>
          <Col span={18}>
            <InputNumber value={intercept} onChange={setIntercept} />
          </Col>
        </Row>
        <Table columns={columns} dataSource={dataSource} pagination={false} />
        <Row justify="space-between" style={{ marginTop: 16 }}>
          <Button
            type="primary"
            onClick={saveData}
            loading={isLoading}
            disabled={!data.length}
          >
            {isSaved ? "Update Forecast" : "Save Forecast"}
          </Button>
        </Row>
      </Card>
    );
  };

  // const renderOutputTable = () => {
  //   if (!Array.isArray(results) || results.length === 0 || !results[0]) {
  //     return (
  //       <p style={{ textAlign: "center" }}>
  //         No results yet. Please save first.
  //       </p>
  //     );
  //   }

  //   return (
  //     <Card title="Regression Output">
  //       <Table
  //         dataSource={results.map((row, idx) => ({ key: idx, ...row }))}
  //         pagination={false}
  //         columns={Object.keys(results[0]).map((key) => ({
  //           title: key,
  //           dataIndex: key,
  //         }))}
  //       />
  //     </Card>
  //   );
  // };

  const renderOutputTable = () => {
    // if (!Array.isArray(results) ||
    //   results.length === 0 || !results[0] || !initialConfig?.colNames
    // ) {
    //   return (
    //     <p style={{ textAlign: "center" }}>
    //       No results yet. Please save first.
    //     </p>
    //   );
    // }

    if (!Array.isArray(results) || results.length === 0 || !results[0] || outputCols.length === 0) {
      return (
        <p style={{ textAlign: "center" }}>
          No results yet. Please save first.
        </p>
      );
    }

    // const columns = [
    //   {
    //     title: "Name",
    //     dataIndex: "name",
    //   },
    //   {
    //     title: "Coefficient",
    //     dataIndex: "coefficient",
    //   },
    //   ...initialConfig.colNames.map((colName, index) => ({
    //     title: colName,
    //     dataIndex: `forecast_${index}`,
    //   })),
    // ];

    const columns = [
      { title: "Name", dataIndex: "name" },
      { title: "Coefficient", dataIndex: "coefficient" },
      ...outputCols.map((colName, index) => ({
        title: colName,
        dataIndex: `forecast_${index}`,
      })),
    ];

    const dataSource = results.map((row, idx) => ({
      key: idx,
      name: row.name,
      coefficient: row.coefficient ?? "",
      ...Object.fromEntries(
        (row.values || []).map((val, j) => [`forecast_${j}`, val])
      ),
    }));

    return (
      <Card title="Regression Output">
        <Table
          dataSource={dataSource}
          pagination={false}
          columns={columns}
          bordered
        />
      </Card>
    );
  };

  return (
    <Card title={fileName + " - Regression Projector" || "Regression Projector"}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Input" key="input">
          {renderInputTable()}
        </TabPane>
        <TabPane tab="Output" key="output">
          {renderOutputTable()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default RegressionProjector;
