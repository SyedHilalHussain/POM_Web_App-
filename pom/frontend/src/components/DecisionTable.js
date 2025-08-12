// DecisionTable.js (fixed)
import React, { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  Row,
  Col,
  InputNumber,
  Table,
  Button,
  Select,
  Input,
  message,
} from "antd";
import axios from "axios";

const { TabPane } = Tabs;
const { Option } = Select;

const DecisionTable = ({ fileId, fileName, setSelectedFile, initialConfig }) => {
  const [activeTab, setActiveTab] = useState("input");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [numScenarios, setNumScenarios] = useState(initialConfig?.num_scenarios || 3);
  const [numOptions, setNumOptions] = useState(initialConfig?.num_options || 2);
  const [rowNames, setRowNames] = useState(initialConfig?.row_names || Array.from({ length: 2 }, (_, i) => `Option ${i + 1}`));
  const [colNames, setColNames] = useState(initialConfig?.column_names || Array.from({ length: 3 }, (_, i) => `S${i + 1}`));
  const [objective, setObjective] = useState(initialConfig?.objective || "Profits (maximize)");
  const [probabilities, setProbabilities] = useState(initialConfig?.probabilities || Array(numScenarios).fill(0));
  const [payoffs, setPayoffs] = useState(initialConfig?.payoffs || Array.from({ length: numOptions }, () => Array(numScenarios).fill(0)));

  const [outputData, setOutputData] = useState(null);

  const getAuthToken = () => localStorage.getItem("access_token");

  useEffect(() => {
    setRowNames(prev => Array.from({ length: numOptions }, (_, i) => prev[i] ?? `Option ${i + 1}`));
    setColNames(prev => Array.from({ length: numScenarios }, (_, i) => prev[i] ?? `S${i + 1}`));
    setProbabilities(prev => Array.from({ length: numScenarios }, (_, i) => prev[i] ?? 0));
    setPayoffs(prev => Array.from({ length: numOptions }, (_, r) => Array.from({ length: numScenarios }, (_, c) => prev?.[r]?.[c] ?? 0)));
  }, [numScenarios, numOptions]);

  useEffect(() => {
    if (fileId) {
      loadData(fileId);
    } else if (initialConfig) {
      setNumScenarios(initialConfig.num_scenarios || numScenarios);
      setNumOptions(initialConfig.num_options || numOptions);
      setRowNames(initialConfig.row_names || rowNames);
      setColNames(initialConfig.column_names || colNames);
      setObjective(initialConfig.objective || objective);
      setProbabilities(initialConfig.probabilities || probabilities);
      setPayoffs(initialConfig.payoffs || payoffs);
      setOutputData(null);
      setIsSaved(false);
      setActiveTab("input");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, initialConfig]);

  // --- API load ---
  const loadData = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) return message.error("Not authenticated.");
      setIsLoading(true);
      const res = await axios.get(`/api/retrieve_decision_table/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data;
      const input = payload.input_data || {};
      setNumScenarios(input.num_scenarios || input.probabilities?.length || 0);
      setNumOptions(input.num_options || input.payoffs?.length || 0);
      setRowNames(input.row_names || rowNames);
      setColNames(input.column_names || colNames);
      setObjective(input.objective || objective);
      setProbabilities(input.probabilities || probabilities);
      setPayoffs(input.payoffs || payoffs);
      setOutputData(payload.output_data || null);
      setIsSaved(true);
      setActiveTab("output");
    } catch (err) {
      console.error("loadData error:", err?.response || err);
      message.error("Failed to retrieve data");
    } finally {
      setIsLoading(false);
    }
  };

  // --- compute outputs locally (fixed variable names) ---
  const computeOutputLocally = (input) => {
    const { objective: obj, probabilities: probs, payoffs: pf, row_names, column_names } = input;
    const isMaximize = (obj || objective).toLowerCase().includes("profit") || (obj || objective).toLowerCase().includes("maximize");
    const probsNormalized = probs || Array((column_names || colNames).length).fill(0);
    const allZeroProbs = probsNormalized.every((p) => p === 0);

    // matrix of probability * payoff values (evMultMatrix)
    const evMultMatrix = pf.map((row) => row.map((cell, colIdx) => (allZeroProbs ? 0 : cell * probsNormalized[colIdx])));

    // Expected Values (row sums)
    const expectedValues = evMultMatrix.map((row) => row.reduce((s, v) => s + (typeof v === "number" ? v : 0), 0));

    // Row mins and maxes
    const rowMins = pf.map((row) => Math.min(...row));
    const rowMaxes = pf.map((row) => Math.max(...row));

    // Decision Table data
    const decisionData = pf.map((row, rIdx) => {
      const objRow = { Option: row_names?.[rIdx] ?? `Option ${rIdx + 1}` };
      (column_names || colNames).forEach((cName, cIdx) => {
        objRow[cName] = row[cIdx];
      });
      objRow["Expected Value"] = allZeroProbs ? 0 : roundTo(expectedValues[rIdx], 4);
      objRow["Row Min"] = rowMins[rIdx];
      objRow["Row Max"] = rowMaxes[rIdx];
      return objRow;
    });

    // Summary: Best EV and maxima/minima
    const bestEV = isMaximize ? Math.max(...expectedValues) : Math.min(...expectedValues);
    const maximumEV = Math.max(...expectedValues);
    const maximin = isMaximize ? Math.max(...rowMins) : Math.min(...rowMins);
    const maximax = Math.max(...rowMaxes);

    const decisionSummary = {
      maximum: roundTo(maximumEV, 4),
      BestEV: roundTo(bestEV, 4),
      maximin,
      maximax,
    };

    // Regret table: per scenario best payoff depending on objective
    const perScenarioBest = [];
    for (let c = 0; c < (column_names || colNames).length; c++) {
      const vals = pf.map((r) => r[c]);
      perScenarioBest[c] = isMaximize ? Math.max(...vals) : Math.min(...vals);
    }

    const regretData = pf.map((row, rIdx) => {
      const objRow = { Option: row_names?.[rIdx] ?? `Option ${rIdx + 1}` };
      let maxRegret = -Infinity;
      for (let c = 0; c < row.length; c++) {
        const best = perScenarioBest[c];
        const regret = isMaximize ? best - row[c] : row[c] - best;
        objRow[`${(column_names || colNames)[c]} Regret`] = roundTo(regret, 4);
        if (regret > maxRegret) maxRegret = regret;
      }
      objRow["Maximum Regret"] = roundTo(maxRegret, 4);
      return objRow;
    });

    const minimaxRegret = Math.min(...regretData.map((r) => r["Maximum Regret"]));
    const minimaxOption = regretData.find((r) => r["Maximum Regret"] === minimaxRegret)?.Option;

    const regretSummary = {
      "Minimax regret": roundTo(minimaxRegret, 4),
      Option: minimaxOption,
    };

    // Build the EV Multiplications object (evMultiplicationsObj)
    const evMultRows = pf.map((row, rIdx) => {
      const objRow = { Option: row_names?.[rIdx] ?? `Option ${rIdx + 1}` };
      let rowSum = 0;
      for (let c = 0; c < row.length; c++) {
        const mult = allZeroProbs ? 0 : row[c] * probsNormalized[c];
        objRow[(column_names || colNames)[c]] = roundTo(mult, 4);
        rowSum += mult;
      }
      objRow["Row sum (Exp Val)"] = roundTo(allZeroProbs ? 0 : rowSum, 4);
      return objRow;
    });

    const evMultiplicationsObj = {
      probabilities: (column_names || colNames).reduce((acc, cName, idx) => {
        acc[cName] = probsNormalized[idx];
        return acc;
      }, {}),
      data: evMultRows,
      allZeroProbs,
    };

    return {
      "Decision Table": { data: decisionData, summary: decisionSummary },
      "Regret Table": { data: regretData, summary: regretSummary },
      "Expected Value Multiplications": evMultiplicationsObj,
    };
  };

  const roundTo = (n, digits = 2) => {
    if (typeof n !== "number" || !isFinite(n)) return n;
    const mult = Math.pow(10, digits);
    return Math.round(n * mult) / mult;
  };

  // --- save/update ---
  const saveData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return message.error("Not authenticated.");
      setIsLoading(true);

      const payload = {
        name: fileName || "Decision Table",
        input_data: {
          num_scenarios: numScenarios,
          num_options: numOptions,
          row_names: rowNames,
          column_names: colNames,
          objective,
          probabilities,
          payoffs,
        },
      };

      // debug: show payload in console before sending
      console.log("Saving payload:", payload);

      // compute locally for instant view
      const localOutput = computeOutputLocally(payload.input_data);
      setOutputData(localOutput);

      const url = fileId ? `/api/update_decision_table/${fileId}/` : "/api/save_decision_table/";
      const method = fileId ? axios.put : axios.post;

      const res = await method(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // prefer server output if provided
      setOutputData(res.data.output_data || localOutput);
      setIsSaved(true);
      setActiveTab("output");
      message.success(fileId ? "Updated successfully" : "Saved successfully");
      console.log("Server response:", res.data);
    } catch (err) {
      console.error("saveData error:", err?.response || err);
      const serverMsg = err?.response?.data || err?.response?.statusText || err?.message;
      message.error("Failed to save/update: " + JSON.stringify(serverMsg));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render helpers (unchanged UI from your version) ---
  const renderInput = () => {
    return (
      <>
        <Row gutter={[12, 12]}>
          <Col span={6}>
            <b>Objective</b>
            <Select value={objective} onChange={setObjective} style={{ width: "100%" }}>
              <Option value="Profits (maximize)">Profits (maximize)</Option>
              <Option value="Costs (minimize)">Costs (minimize)</Option>
            </Select>
          </Col>
        </Row>

        <br />

        <Card title="Decision Table Input">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: 6 }}>Option / Scenario</th>
                {Array.from({ length: numScenarios }).map((_, cIdx) => (
                  <th key={cIdx} style={{ border: "1px solid #ccc", padding: 6 }}>
                    <Input
                      value={colNames[cIdx]}
                      placeholder={`Scenario ${cIdx}`}
                      onChange={(e) =>
                        setColNames((prev) => {
                          const copy = [...prev];
                          copy[cIdx] = e.target.value;
                          return copy;
                        })
                      }
                    />
                  </th>
                ))}
              </tr>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: 6 }}>Probability</th>
                {Array.from({ length: numScenarios }).map((_, cIdx) => (
                  <td key={cIdx} style={{ border: "1px solid #ccc", padding: 6 }}>
                    <InputNumber
                      min={0}
                      max={1}
                      step={0.01}
                      style={{ width: "100%" }}
                      value={probabilities[cIdx]}
                      onChange={(val) =>
                        setProbabilities((prev) => {
                          const copy = [...prev];
                          copy[cIdx] = val === undefined ? 0 : val;
                          return copy;
                        })
                      }
                    />
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numOptions }).map((_, rIdx) => (
                <tr key={rIdx}>
                  <td style={{ border: "1px solid #ccc", padding: 6 }}>
                    <Input
                      value={rowNames[rIdx]}
                      placeholder={`Option ${rIdx + 1}`}
                      onChange={(e) =>
                        setRowNames((prev) => {
                          const copy = [...prev];
                          copy[rIdx] = e.target.value;
                          return copy;
                        })
                      }
                    />
                  </td>
                  {Array.from({ length: numScenarios }).map((_, cIdx) => (
                    <td key={cIdx} style={{ border: "1px solid #ccc", padding: 6 }}>
                      <InputNumber
                        style={{ width: "100%" }}
                        value={payoffs[rIdx]?.[cIdx]}
                        onChange={(val) =>
                          setPayoffs((prev) => {
                            const copy = prev.map((row) => [...row]);
                            copy[rIdx][cIdx] = val === undefined ? 0 : val;
                            return copy;
                          })
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{ marginTop: 12 }}>
          <Button type="primary" onClick={saveData} loading={isLoading}>
            {isSaved ? "Update Decision Table" : "Save and Calculate"}
          </Button>
        </div>
      </>
    );
  };

  const renderDecisionTable = (decisionTable) => {
    if (!decisionTable) return <p>No results yet.</p>;
    const columns = [
      { title: "Option", dataIndex: "Option", key: "Option" },
      ...(colNames || []).map((c) => ({ title: c, dataIndex: c, key: c })),
      { title: "Expected Value", dataIndex: "Expected Value", key: "Expected Value" },
      { title: "Row Min", dataIndex: "Row Min", key: "Row Min" },
      { title: "Row Max", dataIndex: "Row Max", key: "Row Max" },
    ];
    return (
      <Card title="Decision Table" style={{ marginBottom: 12 }}>
        <Table columns={columns} dataSource={(decisionTable.data || []).map((d, idx) => ({ key: idx, ...d }))} pagination={false} bordered />
        <div style={{ marginTop: 8 }}>
          <b>Summary:</b>
          <div>Maximum EV: {decisionTable.summary?.maximum}</div>
          <div>Best EV: {decisionTable.summary?.BestEV ?? decisionTable.summary?.["Best EV"]}</div>
          {/* <div>Best EV: {decisionTable.summary?.BestEV}</div> */}
          <div>Maximin: {decisionTable.summary?.maximin}</div>
          <div>Maximax: {decisionTable.summary?.maximax}</div>
        </div>
      </Card>
    );
  };

  const renderEVMultiplications = (evMult) => {
    if (!evMult) return null;
    const allZero = evMult.allZeroProbs;
    if (allZero) {
      return (
        <Card title="Expected Value Multiplications" style={{ marginBottom: 12 }}>
          <p>All probabilities are zero — Expected Value Multiplications skipped.</p>
        </Card>
      );
    }
    const columns = [{ title: "Option", dataIndex: "Option", key: "Option" }, ...(colNames || []).map((c) => ({ title: c, dataIndex: c, key: c })), { title: "Row sum (Exp Val)", dataIndex: "Row sum (Exp Val)", key: "Row sum (Exp Val)" }];
    return (
      <Card title="Expected Value Multiplications" style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <b>Probabilities:</b>{" "}
          {Object.entries(evMult.probabilities).map(([k, v]) => (
            <span key={k} style={{ marginRight: 10 }}>
              {k}: {v}
            </span>
          ))}
        </div>
        <Table columns={columns} dataSource={(evMult.data || []).map((d, idx) => ({ key: idx, ...d }))} pagination={false} bordered />
      </Card>
    );
  };

  const renderRegretTable = (regretTable) => {
    if (!regretTable) return null;
    const columns = [{ title: "Option", dataIndex: "Option", key: "Option" }, ...(colNames || []).map((c) => ({ title: `${c} Regret`, dataIndex: `${c} Regret`, key: `${c} Regret` })), { title: "Maximum Regret", dataIndex: "Maximum Regret", key: "Maximum Regret" }];
    return (
      <Card title="Regret or Opportunity Loss" style={{ marginBottom: 12 }}>
        <Table columns={columns} dataSource={(regretTable.data || []).map((d, idx) => ({ key: idx, ...d }))} pagination={false} bordered />
        <div style={{ marginTop: 8 }}>
          <b>Summary:</b>
          <div>Minimax regret: {regretTable.summary?.["Minimax regret"]}</div>
          <div>Option: {regretTable.summary?.Option}</div>
        </div>
      </Card>
    );
  };

  return (
    <Card title={(fileName || "Decision Table") + " - Decision Table Module"}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} destroyInactiveTabPane>
        <TabPane tab="Input" key="input">
          {renderInput()}
        </TabPane>

        <TabPane tab="Output" key="output" disabled={!isSaved && !outputData}>
          {!outputData ? <p style={{ textAlign: "center" }}>No results yet. Save first.</p> : (
            <>
              {renderDecisionTable(outputData["Decision Table"])}
              {renderEVMultiplications(outputData["Expected Value Multiplications"])}
              {renderRegretTable(outputData["Regret Table"])}
            </>
          )}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default DecisionTable;
