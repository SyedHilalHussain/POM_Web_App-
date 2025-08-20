import React, { useState, useContext } from 'react';
import MyContext from './MyContext';  // Import the context provider to share the selectedKey across components
import { Layout, Menu } from 'antd';
import {
  LineChartOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  MinusSquareOutlined,
  TableOutlined,
  FundOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { SubMenu } = Menu;

function Sidebar() {
  const {selectedKey, setSelectedKey, setIsModalVisible, selectedModule, setSelectedModule} = useContext(MyContext); // Use the context to track selected menu key
  const [collapsed, setCollapsed] = useState(false);  // State for sidebar collapse

  // This handles the click on menu items and updates the selected key in the context
  const handleMenuClick = (e) => {
  console.log("Sidebar selected key:", e.key);
    setSelectedKey(e.key);  // Set the selected key when a menu item is clicked
     if (e.key === "1" || e.key === "2" || e.key === "11" || e.key === "3" || e.key === "8" || e.key === "9" || e.key === "10" || e.key === "12" || e.key === "6"|| e.key === "13"|| e.key === "14" || e.key === "15" || e.key === "20" || e.key === "21" || e.key === "23") {
      setIsModalVisible(true);
    }
  };

    // Define main modules for easy reference
  const MAIN_MODULES = {
    'break-even': 'Break Even Analysis',
    'forecasting': 'Forecasting', 
    'inventory': 'Inventory Management',
    'decision-making': 'Decision Making',
    'output-rates': 'Measuring Output Rates'
  };

  // NEW: Handle main module (SubMenu) click
  const handleSubMenuClick = (key) => {
    console.log("Main module selected:", key);
    setSelectedModule(key);  // Save the main module key (e.g., 'break-even')
    setSelectedKey(key);     // Also update selectedKey for consistency
    
    // Optional: Log the full module name
    console.log("Module name:", MAIN_MODULES[key]);
  };

  // NEW: You can also create a function to get current module info
  const getCurrentModuleInfo = () => {
    return {
      key: selectedModule,
      name: MAIN_MODULES[selectedModule] || 'No module selected'
    };
  };


  return (
    <Sider
      collapsible 
      collapsed={collapsed}
      onCollapse={setCollapsed}
      theme="light"
      width={300}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}  // Highlight the selected item based on selectedKey
        onClick={handleMenuClick}  // Handle menu item clicks
        style={{ height: '100%', borderRight: 0 }}
      >
        {/* Title section */}
        <Menu.Item key="title" icon={<MinusSquareOutlined />}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', height: '50px' }}>
              <p style={{ fontWeight: 'bold', color: 'darkblue', fontSize: '14px' }}>
                Module Tree
              </p>
            </div>
          )}
        </Menu.Item>

        {/* Break Even Analysis submenu */}
        <SubMenu
          key="break-even"
          title="Break Even Analysis"
          icon={<LineChartOutlined />}
          onTitleClick={() => handleSubMenuClick('break-even')}  // NEW: Handle main module click
        >
          <Menu.Item key="1">Crosver/ Cost-Volume Analysis</Menu.Item>  {/* Clicking this sets selectedKey to '1' */}
          <Menu.Item key="2">Breakeven Analysis (Cost)</Menu.Item>
          <Menu.Item key="3">Multiproduct Breakeven Analysis</Menu.Item>
        </SubMenu>

        {/* Forecasting submenu */}
        <SubMenu
          key="forecasting"
          title="Forecasting"
          icon={<PieChartOutlined />}
          onTitleClick={() => handleSubMenuClick('forecasting')}  // NEW: Handle main module click
        >
          <Menu.Item key="4">Time Series Analysis</Menu.Item>
          <Menu.Item key="5">Least Squares Simple and Multiple Regression</Menu.Item>
          <Menu.Item key="6">Regression Projector</Menu.Item>
          <Menu.Item key="12">Error Analysis</Menu.Item>
        </SubMenu>

        {/* Inventory Management submenu */}
        <SubMenu
          key="inventory"
          title="Inventory Management"
          icon={<DatabaseOutlined />}
          onTitleClick={() => handleSubMenuClick('inventory')}  // NEW: Handle main module click
        >
          <Menu.Item key="8">Economic Order Quantity (EOQ) Model</Menu.Item>
          <Menu.Item key="13">Economic Production Lot Size Model</Menu.Item>
          <Menu.Item key="23">Quality Discount(EOQ) Model</Menu.Item>
          <Menu.Item key="9">ABC Analysis</Menu.Item>
          <Menu.Item key="19">Reorder Point / Safety Stock (Discrete Distribution)</Menu.Item>
          <Menu.Item key="20">Reorder Point / Safety Stock  (Normal Distribution)</Menu.Item>
          <Menu.Item key="10">Kanban Computation</Menu.Item>
          <Menu.Item key="17">Single Period Inventory (Discrete Distribution)</Menu.Item>
          <Menu.Item key="18">Single Period Inventory (Normal Distribution)</Menu.Item>
        </SubMenu>
         <SubMenu key="decision-making" title="Decision Making" icon={<TableOutlined />} onTitleClick={() => handleSubMenuClick('decision-making')}>
          <Menu.Item key="21">Decision Table</Menu.Item>
          <Menu.Item key="22">Decision Trees</Menu.Item>
          <Menu.Item key="11">Create Preference Matrix</Menu.Item>
        </SubMenu>
         <SubMenu key="output-rates" title="Measuring Output Rates" icon={<FundOutlined />} onTitleClick={() => handleSubMenuClick('output-rates')} >
          <Menu.Item key="14">Time Study</Menu.Item>
          <Menu.Item key="15">Sample Size for Time Studies</Menu.Item>
          <Menu.Item key="16">Sample Size for Work Sampling</Menu.Item>
        </SubMenu>
      </Menu>

        {/* NEW: Optional - Display current selected module (for debugging) */}
      {!collapsed && selectedModule && (
        <div style={{ padding: '10px', borderTop: '1px solid #f0f0f0', fontSize: '12px', color: '#666' }}>
          Selected Module: {MAIN_MODULES[selectedModule]}
        </div>
      )}
    </Sider>
  );
}

export default Sidebar;
