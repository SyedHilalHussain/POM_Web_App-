import React, { useState, useContext, useEffect } from 'react';
import MyContext from './MyContext';
import VerticalButton from './Vertical_button';
import Toolbar from './Toolbar';
import {  Layout, Button, Dropdown, Menu, Checkbox, Avatar, Typography } from 'antd';
import { UserOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import {
  FileOutlined,
  FolderOpenOutlined,
  SaveOutlined,
  PrinterOutlined,
  SolutionOutlined,
  CopyOutlined,
  SnippetsOutlined,
  CompressOutlined,
  ExpandOutlined,
  FullscreenOutlined,
  InsertRowBelowOutlined,
  InsertRowRightOutlined,
  BlockOutlined,
  CalculatorOutlined,
  LineChartOutlined,
  CommentOutlined,
  ScissorOutlined,
  CalendarOutlined,
  QuestionCircleOutlined,
  SnippetsFilled,
  CopyFilled,
  QuestionCircleFilled,
  GlobalOutlined,
  CaretLeftFilled,
  CaretRightFilled,
  PieChartOutlined,
  DatabaseOutlined,
  TableOutlined,
  FundOutlined,
} from '@ant-design/icons';

const { Header } = Layout;

function AppHeader({ onSidebarToggle }) {
  const {
    selectedKey, 
    setSelectedKey, 
    isModalVisible, 
    setIsModalVisible,
    selectedModule,      // NEW: Use selectedModule from context
    setSelectedModule,   // NEW: Use setSelectedModule from context
    selectedFile,        // NEW: Add selectedFile from context
    setSelectedFile      // NEW: Add setSelectedFile from context
  } = useContext(MyContext);
  
  const [isSidebarChecked, setIsSidebarChecked] = useState(true);
  const [isToolbarChecked, setIsToolbarChecked] = useState(true);
  const [isMyLabChecked, setIsMyLabChecked] = useState(true);
  const [isFormatToolbarChecked, setIsFormatToolbarChecked] = useState(true);
  const [userInfo, setUserInfo] = useState({ username: '', role: '' });

  // Add these new state variables
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [newDropdownPosition, setNewDropdownPosition] = useState({ x: 0, y: 0 });
  const [showOpenDropdown, setShowOpenDropdown] = useState(false);
  const [openDropdownPosition, setOpenDropdownPosition] = useState({ x: 0, y: 0 });
  const [openFiles, setOpenFiles] = useState([]);
  const [openDropdownStep, setOpenDropdownStep] = useState('modules'); // 'modules', 'submodules', 'files'
  const [selectedOpenModule, setSelectedOpenModule] = useState(null);

  // Module-Submodule mapping
  const MODULE_SUBMODULES = {
    'break-even': [
      { key: '1', name: 'Crossover/ Cost-Volume Analysis' },
      { key: '2', name: 'Breakeven Analysis (Cost vs. Revenues)' },
      { key: '3', name: 'Multiproduct Breakeven Analysis' }
    ],
    'forecasting': [
      { key: '4', name: 'Time Series Analysis' },
      { key: '5', name: 'Least Squares Regression' },
      { key: '6', name: 'Regression Projector' },
      { key: '12', name: 'Error Analysis' }
    ],
    'inventory': [
      { key: '8', name: 'Economic Order Quantity (EOQ) Model' },
      { key: '13', name: 'Economic Production Lot Size Model' },
      { key: '23', name: 'Quality Discount(EOQ) Model' },
      { key: '9', name: 'ABC Analysis' },
      { key: '19', name: 'Reorder Point / Safety Stock (Discrete Distribution)' },
      { key: '20', name: 'Reorder Point / Safety Stock (Normal Distribution)' },
      { key: '10', name: 'Kanban Computation' },
      { key: '17', name: 'Single Period Inventory (Discrete Distribution)' },
      { key: '18', name: 'Single Period Inventory (Normal Distribution)' }
    ],
    'decision-making': [
      { key: '21', name: 'Decision Table' },
      { key: '22', name: 'Decision Trees' },
      { key: '11', name: 'Create Preference Matrix' }
    ],
    'output-rates': [
      { key: '14', name: 'Time Study' },
      { key: '15', name: 'Sample Size for Time Studies' },
      { key: '16', name: 'Sample Size for Work Sampling' }
    ]
  };

  // Define module configuration for API endpoints (same as FileManager)
  const moduleConfig = {
    "1": {
      endpoint: "/api/list_crossover/",
      type: "crossover",
      title: "Crossover Analysis File Manager"
    },
    "2": {
      endpoint: "/api/list-files/",
      type: "direct",
      title: "Breakeven File Manager"
    },
    "3": {
      endpoint: "/api/list_multiproduct/",
      type: "multiproduct",
      title: "Multiproduct BreakEven File Manager"
    },
    "6": {
      endpoint: "/api/list_regressions_projector/", 
      type: "regressionprojector",
      title: "Regression Projector File Manager"
    },
    "8": {
      endpoint: "/api/list_eoq/",
      type: "EOQ",
      title: "EOQ Model File Manager"
    },
    "9": {
      endpoint: "/api/list_abc_analyses/",
      type: "abc",
      title: "ABC Analysis File Manager"
    },
    "10": {
      endpoint: "/api/list_kanban_computations/",
      type: "kanban",
      title: "Kanban Computation File Manager"
    },
    "11": {
      endpoint: "/api/list_preferencematrix/",
      type: "config",
      title: "Preference Matrix File Manager"
    },
    "12": {
      endpoint: "/api/list_error_analysis/", 
      type: "erroranalysis",
      title: "Error Analysis File Manager"
    },
    "13": {
      endpoint: "/api/list_economic_production_lotsize/", 
      type: "productionlotsize",
      title: "Economic Production Lot Size File Manager"
    },
    "14": {
      endpoint: "/api/list_time_studies/", 
      type: "timestudy",
      title: "Time Study File Manager"
    },
    "15": {
      endpoint: "/api/list_sample_size_for_ts/", 
      type: "samplesize_timestudy",
      title: "Sample Size for Time Studies File Manager"
    },
    "20": {
      endpoint: "/api/list_reorder_normal_dist/", 
      type: "reorderpoint_normaldist",
      title: "Reorder Point/Safety Stock (Normal Distribution) File Manager"
    },
    "21": {
      endpoint: "/api/list_decision_tables/", 
      type: "decision_table",
      title: "Decision Table File Manager"
    }
  };

  // Main modules definition
  const MAIN_MODULES = {
    'break-even': { name: 'Break Even Analysis', icon: LineChartOutlined },
    'forecasting': { name: 'Forecasting', icon: PieChartOutlined },
    'inventory': { name: 'Inventory Management', icon: DatabaseOutlined },
    'decision-making': { name: 'Decision Making', icon: TableOutlined },
    'output-rates': { name: 'Measuring Output Rates', icon: FundOutlined }
  };

  // UPDATED: Helper functions - Now primarily use selectedModule
  const getCurrentModule = () => {
    // First check if we have selectedModule (main module selected from sidebar)
    if (selectedModule && ['break-even', 'forecasting', 'inventory', 'decision-making', 'output-rates'].includes(selectedModule)) {
      return selectedModule;
    }
    
    // ONLY use selectedKey as fallback - If selectedKey is a submodule, find its parent module
    for (const [moduleKey, submodules] of Object.entries(MODULE_SUBMODULES)) {
      if (submodules.some(sub => sub.key === selectedKey)) {
        return moduleKey;
      }
    }
    
    return null;
  };

  const getCurrentSubmodules = () => {
    const currentModule = getCurrentModule();
    return currentModule ? MODULE_SUBMODULES[currentModule] || [] : [];
  };

  // Check if selectedKey is a valid submodule (not just a main module)
  const isValidSubmodule = () => {
    return selectedKey && moduleConfig[selectedKey] && 
           !['break-even', 'forecasting', 'inventory', 'decision-making', 'output-rates'].includes(selectedKey);
  };

  // Get submodules for a specific module
  const getSubmodulesForModule = (moduleKey) => {
    return MODULE_SUBMODULES[moduleKey] || [];
  };

  // Fetch files for Open dropdown
  const fetchOpenFiles = async (submoduleKey) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(moduleConfig[submoduleKey].endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenFiles(response.data || []);
    } catch (error) {
      console.error("Error fetching files for Open:", error);
      setOpenFiles([]);
    }
  };

  const handleNewClick = (event, source = 'toolbar') => {
    const currentModule = getCurrentModule();
    
    if (!currentModule) {
      alert('Please select a module first from the sidebar or Module menu.');
      return;
    }
    
    const rect = event.target.getBoundingClientRect();
    setNewDropdownPosition({
      x: rect.left,
      y: rect.bottom
    });
    
    setShowNewDropdown(true);
  };

  // NEW: Handle Open button click - Start with module selection
  const handleOpenClick = async (event, source = 'toolbar') => {
    const rect = event.target.getBoundingClientRect();
    setOpenDropdownPosition({
      x: rect.left,
      y: rect.bottom
    });
    
    // Reset to module selection step
    setOpenDropdownStep('modules');
    setSelectedOpenModule(null);
    setOpenFiles([]);
    setShowOpenDropdown(true);
  };

  // NEW: Handle module selection in Open dropdown
  const handleOpenModuleSelect = (moduleKey) => {
    setSelectedOpenModule(moduleKey);
    setOpenDropdownStep('submodules');
  };

  // NEW: Handle submodule selection in Open dropdown
  const handleOpenSubmoduleSelect = async (submoduleKey) => {
    // Check if this submodule has API endpoint configured
    if (!moduleConfig[submoduleKey]) {
      alert('This submodule is not yet supported for file operations.');
      return;
    }
    
    // Fetch files from database
    await fetchOpenFiles(submoduleKey);
    setOpenDropdownStep('files');
    
    // Also set the selected submodule for consistency
    setSelectedKey(submoduleKey);
    setSelectedModule(selectedOpenModule);
  };

  // NEW: Handle file selection from Open dropdown
  const handleOpenFileSelect = (file) => {
    setSelectedFile({
      ...file,
      module: selectedKey,
      type: moduleConfig[selectedKey].type
    });
    
    setShowOpenDropdown(false);
    // Reset for next time
    setOpenDropdownStep('modules');
    setSelectedOpenModule(null);
  };

  // NEW: Handle back navigation in Open dropdown
  const handleOpenBackClick = () => {
    if (openDropdownStep === 'files') {
      setOpenDropdownStep('submodules');
      setOpenFiles([]);
    } else if (openDropdownStep === 'submodules') {
      setOpenDropdownStep('modules');
      setSelectedOpenModule(null);
    }
  };

  const handleSubmoduleSelect = (submoduleKey) => {
    setSelectedKey(submoduleKey);
    setIsModalVisible(true);
    setShowNewDropdown(false);
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('/api/profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(response.data);
        localStorage.setItem('username', response.data.username);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  // User Profile dropdown menu
  const userMenu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogout}>
        <LogoutOutlined /> Logout
      </Menu.Item>
    </Menu>
  );

  // Handle sidebar toggle
  const handleSidebarCheckboxChange = (e) => {
    setIsSidebarChecked(e.target.checked);
    onSidebarToggle(e.target.checked);
  };

  // NEW: Handle main module selection from Module dropdown
  const handleMainModuleSelection = (moduleKey) => {
    console.log("Main module selected from header:", moduleKey);
    setSelectedModule(moduleKey);  // Set the main module
    setSelectedKey(moduleKey);     // Also set selectedKey for consistency
    
    // The sidebar should automatically expand this module since selectedKey is updated
    console.log("Module name:", MAIN_MODULES[moduleKey]?.name);
  };

  // UPDATED: Handle module selection - Now sets selectedModule for main modules
  const handleModuleSelection = (key) => {
    // If it's a main module, set selectedModule
    if (['break-even', 'forecasting', 'inventory', 'decision-making', 'output-rates'].includes(key)) {
      handleMainModuleSelection(key);
    } else {
      // If it's a submodule, set selectedKey and open File Manager
      setSelectedKey(key);
      setIsModalVisible(true);
    }
  };

  const HeadingStyle = {
    height: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    borderBottom: '1px solid #fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '2px 10px',
    margin: '5px 0',
  };

  const subHeadingStyle = {
    display: 'flex',
    borderRight: '1px solid #fff',
    maxHeight: '60px',
  };

  // File menu items
  const fileItems = (
    <Menu>
      <Menu.SubMenu title="New" key="new-submenu">
        {getCurrentSubmodules().length > 0 ? (
          getCurrentSubmodules().map(submodule => (
            <Menu.Item 
              key={submodule.key} 
              onClick={() => handleSubmoduleSelect(submodule.key)}
            >
              {submodule.name}
            </Menu.Item>
          ))
        ) : (
          <Menu.Item 
            key="no-module" 
            onClick={() => alert('Please select a module first from the sidebar or Module menu.')}
          >
            No module selected
          </Menu.Item>
        )}
      </Menu.SubMenu>
      <Menu.Item key="open" onClick={(e) => handleOpenClick(e.domEvent || e)}>Open</Menu.Item>
      <Menu.Item key="close">Close</Menu.Item>
      <Menu.Item key="save">Save</Menu.Item>
      <Menu.Item key="save-as">Save As...</Menu.Item>
      <Menu.Item key="save-as-excel">Save As Excel</Menu.Item>
      <Menu.Item key="print">Print</Menu.Item>
      <Menu.Item key="exit">Exit</Menu.Item>
    </Menu>
  );

  const editItems = (
    <Menu>
      <Menu.Item key="insert row">Insert Row(s)</Menu.Item>
      <Menu.Item key="insert column">Insert Column(s)</Menu.Item>
      <Menu.Item key="delete row">Delete Row(s)</Menu.Item>
      <Menu.Item key="delete column">Delete Column(s)</Menu.Item>
      <Menu.Item key="copy">Copy</Menu.Item>
      <Menu.Item key="copy table with header">Copy Table with Headers</Menu.Item>
      <Menu.Item key="paste">Paste</Menu.Item>
      <Menu.Item key="copy down">Copy Down</Menu.Item>
    </Menu>
  );

  const viewItems = (
    <Menu>
      <Menu.Item key="module tree">
        <Checkbox onChange={handleSidebarCheckboxChange} checked={isSidebarChecked}>Module Tree</Checkbox>
      </Menu.Item>
      <Menu.Item key="mylab toolbar and menu">
        <Checkbox onChange={() => setIsMyLabChecked(!isMyLabChecked)} checked={isMyLabChecked}>Mylab Toolbar</Checkbox>
      </Menu.Item>
      <Menu.Item key="toolbar">
        <Checkbox onChange={() => setIsToolbarChecked(!isToolbarChecked)} checked={isToolbarChecked}>Toolbar</Checkbox>
      </Menu.Item>
      <Menu.Item key="format toolbar">
        <Checkbox onChange={() => setIsFormatToolbarChecked(!isFormatToolbarChecked)} checked={isFormatToolbarChecked}>Format Toolbar</Checkbox>
      </Menu.Item>
      <Menu.Item key="full screen">Full Screen</Menu.Item>
    </Menu>
  );

  // NEW: Module dropdown items - Shows all main modules
  const moduleItems = (
    <Menu>
      {Object.entries(MAIN_MODULES).map(([key, module]) => {
        const IconComponent = module.icon;
        return (
          <Menu.Item 
            key={key} 
            onClick={() => handleMainModuleSelection(key)}
            icon={<IconComponent />}
          >
            {module.name}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <>
      <Header style={{ background: '#bcd2e8', padding: '0 10px', height: 'auto' }}>
        <div style={HeadingStyle}>
          <div style={{ display: 'flex' }}>
            {/* File dropdown */}
            <Dropdown overlay={fileItems} trigger={['click']}>
              <Button type="text" style={{ marginRight: 8 }}>File</Button>
            </Dropdown>

            {/* Edit dropdown */}
            <Dropdown overlay={editItems} trigger={['click']}>
              <Button type="text" style={{ marginRight: 8 }} disabled>Edit</Button>
            </Dropdown>

            {/* View dropdown */}
            <Dropdown overlay={viewItems} trigger={['click']}>
              <Button type="text" style={{ marginRight: 8 }}>View</Button>
            </Dropdown>

            {/* UPDATED: Module dropdown - Now shows all main modules */}
            <Dropdown overlay={moduleItems} trigger={['click']}>
              <Button type="text" style={{ marginRight: 8 }}>Module</Button>
            </Dropdown>

            {/* Other buttons */}
            <Button type="text" style={{ marginRight: 8 }} disabled>My Lab</Button>
            <Button type="text" style={{ marginRight: 8 }} disabled>Format</Button>
            <Button type="text" style={{ marginRight: 8 }} disabled>Tools</Button>
            <Button type="text" style={{ marginRight: 8 }}>Help</Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            <Avatar icon={<UserOutlined />} style={{ marginRight: 8, backgroundColor: '#87d068' }} />
            <Dropdown overlay={userMenu} trigger={['click']}>
              <Button type="text" style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                {userInfo.username ? `Welcome, ${userInfo.username}` : "Welcome"} <DownOutlined style={{ marginLeft: 4 }} />
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Toolbar section */}
        {isToolbarChecked && (
          <div style={HeadingStyle}>
            <div style={subHeadingStyle}>
              <VerticalButton icon={FileOutlined} text="New" onClick={(e) => handleNewClick(e, 'toolbar')} />
              <VerticalButton icon={FolderOpenOutlined} text="Open" onClick={(e) => handleOpenClick(e, 'toolbar')} />
              <VerticalButton icon={SaveOutlined} text="Save" />
              <VerticalButton icon={PrinterOutlined} text="Print" />
            </div>
            <div style={subHeadingStyle}>
              <VerticalButton icon={SolutionOutlined} text="Solve" disabled />
            </div>
            <div style={subHeadingStyle}>
              <VerticalButton icon={CopyOutlined} text="Copy" disabled />
              <VerticalButton icon={SnippetsOutlined} text="Paste" disabled />
            </div>
            <div style={subHeadingStyle}>
              <VerticalButton icon={CompressOutlined} text="Autofit Columns" disabled />
              <VerticalButton icon={ExpandOutlined} text="Widen Columns" disabled />
              <VerticalButton icon={FullscreenOutlined} text="Full Screen" disabled />
            </div>
            <div style={subHeadingStyle}>
              <VerticalButton icon={SnippetsFilled} text="Paste From" disabled />
              <VerticalButton icon={CopyFilled} text="Copy Cell" disabled />
            </div>
          </div>
        )}

        {/* Format Toolbar */}
        {isFormatToolbarChecked && (
          <div style={HeadingStyle}>
            <Toolbar />
          </div>
        )}
      </Header>

      {/* Custom New Dropdown */}
      {showNewDropdown && (
        <div
          style={{
            position: 'fixed',
            top: newDropdownPosition.y,
            left: newDropdownPosition.x,
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: '200px'
          }}
        >
          <div style={{ padding: '8px 0' }}>
            {getCurrentSubmodules().map(submodule => (
              <div
                key={submodule.key}
                onClick={() => handleSubmoduleSelect(submodule.key)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                {submodule.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Open Dropdown */}
      {showOpenDropdown && (
        <div
          style={{
            position: 'fixed',
            top: openDropdownPosition.y,
            left: openDropdownPosition.x,
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: '250px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          <div style={{ padding: '8px 0' }}>
            {/* Header with back button */}
            <div style={{ 
              padding: '8px 16px', 
              fontSize: '12px', 
              color: '#666', 
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>
                {openDropdownStep === 'modules' && 'Select Module'}
                {openDropdownStep === 'submodules' && `${MAIN_MODULES[selectedOpenModule]?.name} - Select Submodule`}
                {openDropdownStep === 'files' && `${moduleConfig[selectedKey]?.title || 'Files'}`}
              </span>
              {openDropdownStep !== 'modules' && (
                <span 
                  onClick={handleOpenBackClick}
                  style={{ 
                    cursor: 'pointer', 
                    color: '#1890ff', 
                    fontSize: '12px',
                    padding: '2px 6px',
                    borderRadius: '3px'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  ← Back
                </span>
              )}
            </div>

            {/* Step 1: Show all main modules */}
            {openDropdownStep === 'modules' && (
              <>
                {Object.entries(MAIN_MODULES).map(([key, module]) => {
                  const IconComponent = module.icon;
                  return (
                    <div
                      key={key}
                      onClick={() => handleOpenModuleSelect(key)}
                      style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderBottom: '1px solid #f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      <IconComponent style={{ fontSize: '16px' }} />
                      {module.name}
                    </div>
                  );
                })}
              </>
            )}

            {/* Step 2: Show submodules for selected module */}
            {openDropdownStep === 'submodules' && (
              <>
                {getSubmodulesForModule(selectedOpenModule).map(submodule => (
                  <div
                    key={submodule.key}
                    onClick={() => handleOpenSubmoduleSelect(submodule.key)}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderBottom: '1px solid #f5f5f5'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    {submodule.name}
                    {!moduleConfig[submodule.key] && (
                      <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                        (Not supported)
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Step 3: Show files for selected submodule */}
            {openDropdownStep === 'files' && (
              <>
                {openFiles.length > 0 ? (
                  openFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => handleOpenFileSelect(file)}
                      style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderBottom: '1px solid #f5f5f5'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      {file.name}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '8px 16px', fontSize: '14px', color: '#999', fontStyle: 'italic' }}>
                    No files found
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdowns */}
      {(showNewDropdown || showOpenDropdown) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => {
            setShowNewDropdown(false);
            setShowOpenDropdown(false);
          }}
        />
      )}
    </>
  );
}

export default AppHeader;