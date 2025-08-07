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
} from '@ant-design/icons';

const { Header } = Layout;

function AppHeader({ onSidebarToggle }) {
  const {selectedKey, setSelectedKey} = useContext(MyContext);  // Context for managing selected module
  const [isSidebarChecked, setIsSidebarChecked] = useState(true);  // State for sidebar visibility
  const [isToolbarChecked, setIsToolbarChecked] = useState(true);  // State for toolbar visibility
  const [isMyLabChecked, setIsMyLabChecked] = useState(true);
  const [isFormatToolbarChecked, setIsFormatToolbarChecked] = useState(true);
// Retrieve user email from localStorage
const [userInfo, setUserInfo] = useState({ username: '', role: '' });

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
        setUserInfo(response.data);  // Assuming response contains email, role, etc.
        localStorage.setItem('username', response.data.username);  // Store for header display
           // Store role if needed elsewhere
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

// logout option
const handleLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username'); // Also remove email if stored
  window.location.href = '/login'; // Redirect to login after logout
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
    onSidebarToggle(e.target.checked);  // Pass sidebar state to parent (App.js)
  };

  // Handle module selection
  const handleNewDropDown = (key) => {
    setSelectedKey(key);  // Update selected module key in context
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

  // Define menus for the dropdown
  const fileItems = (
    <Menu>
      <Menu.SubMenu title="New" key="new-submenu">
        <Menu.Item key="break-even" onClick={() => handleNewDropDown("break-even")}>Break-even Analysis</Menu.Item>
        <Menu.Item key="forecasting" onClick={() => handleNewDropDown("forecasting")}>Forecasting</Menu.Item>
        <Menu.Item key="inventory" onClick={() => handleNewDropDown("inventory")}>Inventory Management</Menu.Item>
        <Menu.Item key="decision-making" onClick={() => handleNewDropDown("decision-making")}>Decision Making</Menu.Item>
        <Menu.Item key="output-rates" onClick={() => handleNewDropDown("output-rates")}>Measuirng Output Rates</Menu.Item>
      </Menu.SubMenu>
      <Menu.Item key="open">Open</Menu.Item>
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

  // Render module-specific items
  function renderModuleItems() {
    switch (selectedKey) {
      case 'break-even':
        return (
          <>
            <Menu.Item key="1" onClick={() => handleNewDropDown("1")}>Crossover/ Cost-Volume Analysis</Menu.Item>
            <Menu.Item key="2" onClick={() => handleNewDropDown("2")}>Breakeven Analysis (Cost vs. Revenues)</Menu.Item>
            <Menu.Item key="3" onClick={() => handleNewDropDown("3")}>Multiproduct Breakeven Analysis</Menu.Item>
          </>
        );
      case 'forecasting':
        return (
          <>
            <Menu.Item key="4" onClick={() => handleNewDropDown("4")}>Time Series Analysis</Menu.Item>
            <Menu.Item key="5" onClick={() => handleNewDropDown("5")}>Least Squares Regression</Menu.Item>
            <Menu.Item key="6" onClick={() => handleNewDropDown("6")}>Regression Projector</Menu.Item>
            <Menu.Item key="12" onClick={() => handleNewDropDown("12")}>Error Analysis</Menu.Item>
          </>
        );
      case 'inventory':
        return (
          <>
            <Menu.Item key="8" onClick={() => handleNewDropDown("8")}>EOQ Model</Menu.Item>
            <Menu.Item key="9" onClick={() => handleNewDropDown("9")}>ABC Analysis</Menu.Item>
          </>
        );
      case 'decision-making':
        return (
          <>
            <Menu.Item key="11" onClick={() => handleNewDropDown("11")}>Create Preference Matrix</Menu.Item>
          </>
        );
      case 'output-rates':
        return (
          <>
            <Menu.Item key="14" onClick={() => handleNewDropDown("14")}>Time Study</Menu.Item>
            <Menu.Item key="15" onClick={() => handleNewDropDown("15")}>Sample Size for Time Studies</Menu.Item>
            <Menu.Item key="16" onClick={() => handleNewDropDown("16")}>Sample Size for Work Sampling</Menu.Item>
          </>
        );
      default:
        return null; // No module selected
    }
  }

  return (
    <Header style={{ background: '#bcd2e8', padding: '0 10px', height: 'auto' }}>
      <div style={HeadingStyle}>
        <div style={{ display: 'flex' }}>
          {/* File dropdown */}
          <Dropdown overlay={fileItems} trigger={['click']}>
            <Button type="text" style={{ marginRight: 8 }}>File</Button>
          </Dropdown>

          {/* Edit dropdown */}
          <Dropdown overlay={editItems} trigger={['click']}>
            <Button type="text" style={{ marginRight: 8 }}>Edit</Button>
          </Dropdown>

          {/* View dropdown */}
          <Dropdown overlay={viewItems} trigger={['click']}>
            <Button type="text" style={{ marginRight: 8 }}>View</Button>
          </Dropdown>

          {/* Module dropdown */}
          <Dropdown overlay={<Menu>{renderModuleItems()}</Menu>} trigger={['click']}>
            <Button type="text" style={{ marginRight: 8 }}>Module</Button>
          </Dropdown>

          {/* Other buttons */}
          <Button type="text" style={{ marginRight: 8 }}>My Lab</Button>
          <Button type="text" style={{ marginRight: 8 }}>Format</Button>
          <Button type="text" style={{ marginRight: 8 }}>Tools</Button>
          <Button type="text" style={{ marginRight: 8 }}>Help</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
  <Avatar icon={<UserOutlined />} style={{ marginRight: 8, backgroundColor: '#87d068' }} /> {/* Dummy profile picture */}
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
            <VerticalButton icon={FileOutlined} text="New" />
            <VerticalButton icon={FolderOpenOutlined} text="Open" />
            <VerticalButton icon={SaveOutlined} text="Save" />
            <VerticalButton icon={PrinterOutlined} text="Print" />
          </div>
          <div style={subHeadingStyle}>
            <VerticalButton icon={SolutionOutlined} text="Solve" />
          </div>
          <div style={subHeadingStyle}>
            <VerticalButton icon={CopyOutlined} text="Copy" />
            <VerticalButton icon={SnippetsOutlined} text="Paste" />
          </div>
          <div style={subHeadingStyle}>
            <VerticalButton icon={CompressOutlined} text="Autofit Columns" />
            <VerticalButton icon={ExpandOutlined} text="Widen Columns" />
            <VerticalButton icon={FullscreenOutlined} text="Full Screen" />
          </div>
        </div>
      )}

      {/* My Lab Toolbar */}
      {isMyLabChecked && (
        <div style={HeadingStyle}>
          <VerticalButton icon={SnippetsFilled} text="Paste From" />
          <VerticalButton icon={CopyFilled} text="Copy Cell" />
        </div>
      )}

      {/* Format Toolbar */}
      {isFormatToolbarChecked && (
        <div style={HeadingStyle}>
          <Toolbar />  {/* Custom Toolbar component */}
        </div>
      )}
{/*       // logout btn code */}

    </Header>
  );
}

export default AppHeader;
