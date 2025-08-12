// MainContent.js      here we will display all our modules input and output

import React, { useContext, useState, useEffect } from "react";
import { Layout } from "antd";
import MyContext from "./MyContext";
import BreakEvenTable from "./BreakEvenTable";
import PreferenceMatrixModal from "./PreferenceMatrixModal";
import PreferenceMatrix from "./PreferenceMatrix";
import FileManager from "./FileManager";
import MultiproductBreakEven from "./MultiproductBreakEven";
import MultiproductBreakEvenModal from "./MultiproductBreakEvenModal";
import CrossoverAnalysis from "./CrossoverAnalysis";
import CrossoverModal from "./CrossoverModal";
import EOQAnalysis from "./EOQAnalysis";
import ABCAnalysis from "./ABCAnalysis";
import ABCModal from "./ABCModal";
import KanbanComputation from "./KanbanComputation";
import KanbanModal from "./KanbanModal";

import ErrorAnalysis from "./ErrorAnalysis";
import ErrorAnalysisModal from "./ErrorAnalysisModal";
import RegressionProjector from "./RegressionProjector";
import RegressionProjectorModal from "./RegressionProjectorModal";
import EconomicProductionLotSize from "./EconomicProductionLotSize";
import TimeStudy from "./TimeStudy";
import TimeStudyModal from "./TimeStudyModal";
import SampleSizeTimeStudy from "./SampleSizeTimeStudy";
import SampleSizeTimeStudyModal from "./SampleSizeTimeStudyModal";
import DecisionTable from "./DecisionTable";
import DecisionTableModal from "./DecisionTableModal";

import ReorderPointNormalDist from "./ReorderPointNormalDist";

const { Content } = Layout;

function MainContent() {
  const {
    selectedKey,
    setSelectedKey,
    isModalVisible,
    setIsModalVisible,
    selectedFile,
    setSelectedFile,
    setShowMultiProductModal,
    showMultiProductModal,
    showCrossoverModal,
    setShowCrossoverModal,
  } = useContext(MyContext);

  const [matrixConfig, setMatrixConfig] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [crossoverConfig, setCrossoverConfig] = useState(null);
  const [multiProductConfig, setMultiProductConfig] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showABCModal, setShowABCModal] = useState(false);
  const [abcConfig, setABCConfig] = useState(null);
  const [showErrorAnalysisModal, setShowErrorAnalysisModal] = useState(false);
  const [errorAnalysisConfig, setErrorAnalysisConfig] = useState(null);

  const [showRegressionProjectorModal, setShowRegressionProjectorModal] = useState(false);
  const [regressionProjectorConfig, setRegressionProjectorConfig] = useState(null); //Data handling modal and file

  const [showTimeStudyModal, setShowTimeStudyModal] = useState(false);
  const [timeStudyConfig, setTimeStudyConfig] = useState(null); 

  const [showSampleSizeTimeStudyModal, setShowSampleSizeTimeStudyModal] = useState(false);
  const [sampleSizaTimeStudyConfig, setSampleSizaTimeStudyConfig] = useState(null);

  const [showDecisionTableModal, setShowDecisionTableModal] = useState(false);
  const [decisionTableConfig, setDecisionTableConfig] = useState(null);

  const [showKanbanModal, setShowKanbanModal] = useState(false);
  const [kanbanConfig, setKanbanConfig] = useState(null);
  
  // When selectedFile changes, reset config and show setup modal if needed
  useEffect(() => {
    if (selectedFile) {
      if (selectedFile.type === "config") {
        // Reset config when a new file is selected
        setMatrixConfig(null);
        setShowSetupModal(true);
      } else if (selectedFile.type === "multiproduct") {
        // Show multiproduct setup when a new file is created
        setMultiProductConfig(null);
        if (!selectedFile.id) {
          setShowMultiProductModal(true);
        }
      } else if (selectedFile.type === "crossover") {
        setCrossoverConfig(null);
        if (!selectedFile.id) {
          setShowCrossoverModal(true);
        }
      } else if (selectedFile.type === "abc") {
        setABCConfig(null);
        if (!selectedFile.id) {
          setShowABCModal(true);
        }
      } else if (selectedFile.type === "erroranalysis") {
        setErrorAnalysisConfig(null);
        if (!selectedFile.id) {
          setShowErrorAnalysisModal(true);
        }
      } else if (selectedFile.type === "regressionprojector") {
        setRegressionProjectorConfig(null);
        if (!selectedFile.id) {
          setShowRegressionProjectorModal(true);
        }
      }
       else if (selectedFile.type === "timestudy") {
        setTimeStudyConfig(null)
        if (!selectedFile.id) {
          setShowTimeStudyModal(true);
        }
      }
       else if (selectedFile.type === "samplesize_timestudy") {
        setSampleSizaTimeStudyConfig(null)
        if (!selectedFile.id) {
          setShowSampleSizeTimeStudyModal(true)
        }
      }
       else if (selectedFile.type === "decision_table") {
        setDecisionTableConfig(null)
        if (!selectedFile.id) {
          setShowDecisionTableModal(true)
        }
      }
  

      //     else if (selectedFile.type === "kanban") {
      //       setKanbanConfig(null);
      //       if (!selectedFile.id) {
      //         setShowKanbanModal(true);
      //       }
      //     }
    }
  }, [selectedFile]);

  // Add Kanban handler
  // const handleKanbanSetup = (config) => {
  //   setKanbanConfig(config);
  //   setShowKanbanModal(false);
  // };
  //
  // // Add Kanban Modal close handler
  // const handleKanbanModalClose = () => {
  //   if (!kanbanConfig && selectedKey === "10") {
  //     setSelectedKey(null);
  //   }
  //   setShowKanbanModal(false);
  // };

  // Add ABC Analysis handler
  const handleABCSetup = (config) => {
    setABCConfig(config);
    setShowABCModal(false);
  };

    // Add ABC Modal close handler
  const handleABCModalClose = () => {
    if (!abcConfig && selectedKey === "9") {
      setSelectedKey(null);
    }
    setShowABCModal(false);
  };

  // Add Error Analysis handler
  const handleErrorAnalysisSetup = (config) => {
    setErrorAnalysisConfig(config);
    setShowErrorAnalysisModal(false);
  };

    // Add Error Analysis Modal close handler
  const handleErrorAnalysisModalClose = () => {
    if (!errorAnalysisConfig && selectedKey === "12") {
      setSelectedKey(null);
    }
    setShowErrorAnalysisModal(false);
  };

  // Add Regression Projector handler
  const handleRegressionProjectorSetup = (config) => {
    setRegressionProjectorConfig(config);
    setShowRegressionProjectorModal(false);
  };

    // Add Regression Projector Modal close handler
  const handleRegressionProjectorModalClose = () => {
    if (!regressionProjectorConfig && selectedKey === "6") {
      setSelectedKey(null);
    }
    setShowRegressionProjectorModal(false);
  };

  // Add Time Study handler
  const handleTimeStudySetup = (config) => {
    setTimeStudyConfig(config);
    setShowTimeStudyModal(false);
  };

    // Add Regression Projector Modal close handler
  const handleTimeStudyModalClose = () => {
    if (!timeStudyConfig && selectedKey === "14") {
      setSelectedKey(null);
    }
    setShowTimeStudyModal(false);
  };

  // Add Sample Size Time Study handler
  const handleSampleSizeTimeStudySetup = (config) => {
    setSampleSizaTimeStudyConfig(config);
    setShowSampleSizeTimeStudyModal(false);
  };

    // Add Regression Projector Modal close handler
  const handleSampleSizeTimeStudyModalClose = () => {
    if (!sampleSizaTimeStudyConfig && selectedKey === "15") {
      setSelectedKey(null);
    }
    setShowSampleSizeTimeStudyModal(false);
  };

  // Add Decision Table Study handler
  const handleDecisionTableSetup = (config) => {
    // setDecisionTableConfig(config);
    setDecisionTableConfig({
      num_options: config.numRows,
      num_scenarios: config.numCols,
      row_names: config.rowNames,
      column_names: config.colNames
  });
    setShowDecisionTableModal(false);
  };

    // Add Regression Projector Modal close handler
  const handleDecisionTableModalClose = () => {
    if (!decisionTableConfig && selectedKey === "21") {
      setSelectedKey(null);
    }
    setShowDecisionTableModal(false);
  };

  const handleCrossoverSetup = (config) => {
    setCrossoverConfig(config);
    setShowCrossoverModal(false);
  };
  //    // Enhanced menu selection handling
  //     useEffect(() => {
  //         console.log("Selected key changed:", selectedKey);
  //         if (selectedKey === "3") { // Multiproduct Breakeven Analysis
  // //             setShowMultiProductModal(true);
  //             // Ensure a temporary file is created if no file exists
  //             if (!selectedFile) {
  //                 setSelectedFile({
  //
  //                     type: "multiproduct"
  //                 });
  //             }
  //         }
  //     }, [selectedKey]);

  // Handle preference matrix setup completion
  const handleMatrixSetup = (config) => {
    console.log("Matrix configuration received:", config);
    setMatrixConfig(config);
    // Ensure selectedFile is not null
    if (!selectedFile) {
      console.error("Error: selectedFile is null during setup.");
      return;
    }

    //     setSelectedFile({ ...selectedFile, type: "config" });
    console.log("After setting config, selectedFile is:", selectedFile); // Add this line
    setShowSetupModal(false);
  };

  // Handle multiproduct setup completion
  const handleMultiProductSetup = (config) => {
    console.log("Multiproduct configuration received:", config);

    console.log("setSelectedFile type:", typeof setSelectedFile);
    console.log(
      "setShowMultiProductModal type:",
      typeof setShowMultiProductModal
    );

    setMultiProductConfig(config);

    // Check before calling setSelectedFile
    if (!selectedFile) {
      console.error("Error: selectedFile is null during setup.");
      return;
    }

    // Check before calling setShowMultiProductModal
    if (typeof setShowMultiProductModal === "function") {
      console.log("Closing modal...");
      setShowMultiProductModal(false);
    } else {
      console.error(
        "setShowMultiProductModal is not a function",
        setShowMultiProductModal
      );
    }
  };

  // Handle modal close without configuration
  const handleSetupModalClose = () => {
    setShowSetupModal(false);
  };

  // Handle multiproduct modal close without configuration
  const handleMultiProductModalClose = () => {
    if (!multiProductConfig && selectedKey === "3") {
      setSelectedKey(null);
    }
    setShowMultiProductModal(false);
  };

  // Debug logging
  // useEffect(() => {
  //   console.log("Current state:", {
  //     selectedKey,
  //     selectedFile,
  //     matrixConfig,
  //     showSetupModal,
  //     multiProductConfig,
  //     showMultiProductModal,
  //   });
  // }, [
  //   selectedKey,
  //   selectedFile,
  //   matrixConfig,
  //   showSetupModal,
  //   multiProductConfig,
  //   showMultiProductModal,
  // ]);

  if (!selectedFile) {
    return (
      <Layout style={{ padding: "16px" }}>
        <Content
          style={{
            maxHeight: "calc(100vh - 64px)",
            overflowY: "auto",
            padding: "16px",
            backgroundColor: "#fff",
          }}
        >
          <FileManager />
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h3>Select or create a file from the sidebar</h3>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: "16px" }}>
      <Content
        style={{
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
          padding: "16px",
          backgroundColor: "#fff",
        }}
      >
        <FileManager />

        {/* Render different content based on file type */}
        {selectedFile.type === "direct" && (
          <BreakEvenTable
            fileId={selectedFile.id}
            fileName={selectedFile.name}
            isSaved={isSaved}
            setIsSaved={setIsSaved}
          />
        )}

        {selectedFile.type === "config" && (
          <>
            {/* Show setup modal when needed */}
            {showSetupModal && (
              <PreferenceMatrixModal
                isVisible={true}
                onClose={handleSetupModalClose}
                onConfirm={handleMatrixSetup}
              />
            )}

            {/* Show matrix component when config is available */}
            {!showSetupModal && matrixConfig && (
              <PreferenceMatrix
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                matrixConfig={matrixConfig}
                setSelectedFile={setSelectedFile}
              />
            )}
          </>
        )}
        {selectedFile.type === "multiproduct" && (
          <>
            {/* Show multiproduct setup modal when needed */}
            {showMultiProductModal && (
              <MultiproductBreakEvenModal
                isVisible={true}
                onClose={handleMultiProductModalClose}
                onConfirm={handleMultiProductSetup}
              />
            )}

            {/* Show multiproduct component */}
            {!showMultiProductModal && (
              <MultiproductBreakEven
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                setSelectedFile={setSelectedFile}
                initialConfig={multiProductConfig}
              />
            )}
          </>
        )}
        {selectedFile?.type === "crossover" && (
          <>
            {showCrossoverModal && (
              <CrossoverModal
                isVisible={true}
                onClose={() => setShowCrossoverModal(false)}
                onConfirm={handleCrossoverSetup}
              />
            )}

            {!showCrossoverModal && (
              <CrossoverAnalysis
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                setSelectedFile={setSelectedFile}
                initialConfig={crossoverConfig}
              />
            )}
          </>
        )}
        {selectedFile.type === "EOQ" && (
          <EOQAnalysis
            fileId={selectedFile.id}
            fileName={selectedFile.name}
            isSaved={isSaved}
            setIsSaved={setIsSaved}
          />
        )}

        {selectedFile?.type === "abc" && (
          <>
            {showABCModal && (
              <ABCModal
                isVisible={true}
                onClose={handleABCModalClose}
                onConfirm={handleABCSetup}
              />
            )}

            {!showABCModal && (
              <ABCAnalysis
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                setSelectedFile={setSelectedFile}
                initialConfig={abcConfig}
              />
            )}
          </>
        )}

        {selectedFile?.type === "erroranalysis" && (
          <>
            {showErrorAnalysisModal && (
              <ErrorAnalysisModal
                isVisible={true}
                onClose={handleErrorAnalysisModalClose}
                onConfirm={handleErrorAnalysisSetup}
              />
            )}

            {!showErrorAnalysisModal && (
              <ErrorAnalysis
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                setSelectedFile={setSelectedFile}
                initialConfig={errorAnalysisConfig}
              />
            )}
          </>
        )}

        {selectedFile?.type === "regressionprojector" && (
          <>
            {showRegressionProjectorModal && (
              <RegressionProjectorModal
                isVisible={true}
                onClose={handleRegressionProjectorModalClose}
                onConfirm={handleRegressionProjectorSetup}
              />
            )}

            {!showRegressionProjectorModal && (
              <RegressionProjector
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                setSelectedFile={setSelectedFile}
                initialConfig={regressionProjectorConfig}
              />
            )}
          </>
        )}
    
        {selectedFile?.type === "timestudy" && (
          <>
            {showTimeStudyModal && (
              <TimeStudyModal
                isVisible={true}
                onClose={handleTimeStudyModalClose}
                onConfirm={handleTimeStudySetup}
              />
            )}

            {!showTimeStudyModal && (
              <TimeStudy
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                setSelectedFile={setSelectedFile}
                initialConfig={timeStudyConfig}
              />
            )}
          </>
        )}
    
        {selectedFile?.type === "samplesize_timestudy" && (
          <>
            {showSampleSizeTimeStudyModal && (
              <SampleSizeTimeStudyModal
                isVisible={true}
                onClose={handleSampleSizeTimeStudyModalClose}
                onConfirm={handleSampleSizeTimeStudySetup}
              />
            )}

            {!showSampleSizeTimeStudyModal && (
              <SampleSizeTimeStudy
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                setSelectedFile={setSelectedFile}
                initialConfig={sampleSizaTimeStudyConfig}
              />
            )}
          </>
        )}

        {selectedFile?.type === "decision_table" && (
          <>
            {showDecisionTableModal && (
              <DecisionTableModal
                isVisible={true}
                onClose={handleDecisionTableModalClose}
                onConfirm={handleDecisionTableSetup}
              />
            )}

            {!showDecisionTableModal && (
              <DecisionTable
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                setSelectedFile={setSelectedFile}
                initialConfig={decisionTableConfig}
              />
            )}
          </>
        )}
    
        {selectedFile.type === "productionlotsize" && (
          <EconomicProductionLotSize
            fileId={selectedFile.id}
            fileName={selectedFile.name}
            isSaved={isSaved}
            setIsSaved={setIsSaved}
          />
        )}

        {selectedFile?.type === "kanban" && (
          <KanbanComputation
            key={selectedFile.id}
            fileId={selectedFile.id}
            fileName={selectedFile.name}
            setSelectedFile={setSelectedFile}
            initialConfig={kanbanConfig}
          />
        )}

        {selectedFile.type === "reorderpoint_normaldist" && (
          <ReorderPointNormalDist
            fileId={selectedFile.id}
            fileName={selectedFile.name}
            isSaved={isSaved}
            setIsSaved={setIsSaved}
          />
        )}
      </Content>
    </Layout>
  );
}

export default MainContent;
