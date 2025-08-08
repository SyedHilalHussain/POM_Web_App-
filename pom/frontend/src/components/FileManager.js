import React, { useState, useEffect, useContext } from 'react';
import { Modal, Input, Button, List } from 'antd';
import axios from 'axios';
import MyContext from './MyContext';

function FileManager() {
    const [fileName, setFileName] = useState("");
    const [savedFiles, setSavedFiles] = useState([]);
    const {
        selectedKey,
        setSelectedKey,
        isModalVisible,
        setIsModalVisible,
        selectedFile,
        setSelectedFile
    } = useContext(MyContext);

    // Define module information with API endpoints and types
    const moduleConfig = {
     "1": {
    endpoint: "/api/list_crossover/",
    type: "crossover",
    title: "Crossover Analysis File Manager"
  },
        "2": {
            endpoint: "/api/list-files/",
            type: "direct", // Goes directly to main table
            title: "Breakeven File Manager"
        },
  "3": {  // Add this configuration
    endpoint: "/api/list_multiproduct/",
    type: "multiproduct",
    title: "Multiproduct BreakEven File Manager"
  },
    "10": {  // Add this configuration for Kanban Computation
    endpoint: "/api/list_kanban_computations/",
    type: "kanban",
    title: "Kanban Computation File Manager"
  },
        "11": {
            endpoint: "/api/list_preferencematrix/",
            type: "config", // Requires additional configuration
            title: "Preference Matrix File Manager"
        },
         "8": {
            endpoint: "/api/list_eoq/",
            type: "EOQ", // Requires additional configuration
            title: "EOQ Model File Manager"
        },
         "9": {  // Add this configuration for ABC Analysis
    endpoint: "/api/list_abc_analyses/",
    type: "abc",
    title: "ABC Analysis File Manager"
  },
    "12": {  // Add this configuration for Error Analysis
    endpoint: "/api/list_error_analysis/", 
    type: "erroranalysis",
    title: "Error Analysis File Manager"
  },
    "6": {  // Add this configuration for Regression Projector
    endpoint: "/api/list_regressions_projector/", 
    type: "regressionprojector",
    title: "Regression Projector File Manager"
  },
    "13": {  // Add this configuration for Economic Production Lot Size
    endpoint: "/api/list_economic_production_lotsize/", 
    type: "productionlotsize",
    title: "Economic Production Lot Size File Manager"
  },
    "14": {  // Add this configuration for Time Study
    endpoint: "/api/list_time_studies/", 
    type: "timestudy",
    title: "Time Study File Manager"
  },
    "15": {  // Add this configuration for Sample Size Time Study
    endpoint: "/api/list_sample_size_for_ts/", 
    type: "samplesize_timestudy",
    title: "Sample Size for Time Studies File Manager"
  },
    "20": {  // Add this configuration for Reorder Point/Safety Stock (Normal Dist)
    endpoint: "/api/list_reorder_normal_dist/", 
    type: "reorderpoint_normaldist",
    title: "Reorder Point/Safety Stock (Normal Distribution) File Manager"
  },
    };

    useEffect(() => {
        if (isModalVisible && moduleConfig[selectedKey]) {
            fetchSavedFiles();
            setFileName("");
        }
    }, [isModalVisible, selectedKey]);

    const fetchSavedFiles = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.get(moduleConfig[selectedKey].endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedFiles(response.data);
        } catch (error) {
            console.error("Error fetching saved files:", error);
        }
    };

    const handleCreateNewFile = () => {
        if (!fileName) return;
  let fileType;
  if (selectedKey === "1") fileType = "crossover";
  else if (selectedKey === "2") fileType = "direct";
  else if (selectedKey === "3") fileType = "multiproduct";
  else if (selectedKey === "8") fileType = "EOQ";
  else if (selectedKey === "9") fileType = "abc";
  else if (selectedKey === "10") fileType = "kanban";
  else if (selectedKey === "12") fileType = "erroranalysis";
  else if (selectedKey === "6") fileType = "regressionprojector";
  else if (selectedKey === "13") fileType = "productionlotsize";
  else if (selectedKey === "14") fileType = "timestudy";
  else if (selectedKey === "15") fileType = "samplesize_timestudy";
  else if (selectedKey === "20") fileType = "reorderpoint_normaldist";
  else fileType = "config"; // direct = BreakEven, config = PreferenceMatrix

        // Set selected file with the appropriate workflow type
        setSelectedFile({
            id: null,
            name: fileName,
            module: selectedKey,
            type: fileType
        });

        setIsModalVisible(false);
    };

    const handleOpenFile = (file) => {
        setSelectedFile({
            ...file,
            module: selectedKey,
            type: moduleConfig[selectedKey].type
        });

        setIsModalVisible(false);
    };

    return (
        <Modal
            title={moduleConfig[selectedKey]?.title || "File Manager"}
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
        >
            <Input
                placeholder="Enter new file name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                style={{ marginBottom: '10px' }}
            />
            <Button type="primary" onClick={handleCreateNewFile} disabled={!fileName}>
                Create New File
            </Button>
            <h4>Open Existing File</h4>
            <List
                bordered
                dataSource={savedFiles}
                renderItem={(file) => (
                    <List.Item onClick={() => handleOpenFile(file)} style={{ cursor: 'pointer' }}>
                        {file.name}
                    </List.Item>
                )}
            />
        </Modal>
    );
}

export default FileManager;