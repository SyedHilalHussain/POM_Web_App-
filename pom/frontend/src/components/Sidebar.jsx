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
  const {selectedKey, setSelectedKey, setIsModalVisible, setShowMultiProductModal} = useContext(MyContext); // Use the context to track selected menu key
  const [collapsed, setCollapsed] = useState(false);  // State for sidebar collapse

  // This handles the click on menu items and updates the selected key in the context
  const handleMenuClick = (e) => {
  console.log("Sidebar selected key:", e.key);
    setSelectedKey(e.key);  // Set the selected key when a menu item is clicked
     if (e.key === "1" || e.key === "2" || e.key === "11" || e.key === "3" || e.key === "8" || e.key === "9" || e.key === "10" || e.key === "12" || e.key === "6"|| e.key === "13"|| e.key === "14" || e.key === "15") {
      setIsModalVisible(true);
    }
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
        >
          <Menu.Item key="8">Economic Order Quantity (EOQ) Model</Menu.Item>
          <Menu.Item key="13">Economic Production Lot Size Model</Menu.Item>
          <Menu.Item key="9">ABC Analysis</Menu.Item>
          <Menu.Item key="10">Kanban Computation</Menu.Item>
          <Menu.Item key="17">Single Period Inventory (Discrete Distribution)</Menu.Item>
          <Menu.Item key="18">Single Period Inventory (Normal Distribution)</Menu.Item>
        </SubMenu>
         <SubMenu key="decision-making" title="Decision Making" icon={<TableOutlined />}>
          <Menu.Item key="11">Create Preference Matrix</Menu.Item>
        </SubMenu>
         <SubMenu key="output-rates" title="Measuring Output Rates" icon={<FundOutlined />}>
          <Menu.Item key="14">Time Study</Menu.Item>
          <Menu.Item key="15">Sample Size for Time Studies</Menu.Item>
          <Menu.Item key="16">Sample Size for Work Sampling</Menu.Item>
        </SubMenu>
      </Menu>
    </Sider>
  );
}

export default Sidebar;
