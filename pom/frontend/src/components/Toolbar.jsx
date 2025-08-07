import React from 'react';
import { Tooltip, Input} from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  FontSizeOutlined,
  FontColorsOutlined,
} from '@ant-design/icons';

const TableFormattingToolbar = () => {

  const subHeadingStyle = { display: 'flex', alignItems: 'center', borderRight: '1px solid #fff', maxHeight: '40px'};
  const iconStyle = {margin: '0 8px', lineHeight: '2', fontSize: '18px', fontWeight: 'bold'}

  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      
        <div style={{...subHeadingStyle, maxWidth: '130px', color: 'darkblue',  paddingRight: '5px', fontWeight: 'bold' }}>
            Table Formatting
        </div>

        <Input placeholder="Bell MT" style={{ width: '200px', margin: '0 8px' }} />

        <Input placeholder="10" style={{ width: '50px', marginRight: '8px' }} />

        <div style={{...subHeadingStyle, maxWidth: '180px', color: 'darkblue',  paddingRight: '5px', fontWeight: 'bold', borderRight: '1px solid transparent' }}>
            Selected Cells Formatting
        </div>

        <div  style={{...subHeadingStyle, borderRight: '1px solid transparent'}}>
          <Tooltip placement="bottom" title="Font Size">
            <FontSizeOutlined style={iconStyle} />
          </Tooltip>

          <Tooltip placement="bottom" title="Bold" >
            <BoldOutlined style={iconStyle} />
          </Tooltip>

          <Tooltip placement="bottom" title="Italic" >
            <ItalicOutlined style={iconStyle} />
          </Tooltip>

          <Tooltip placement="bottom" title="Underline" >
            <UnderlineOutlined style={iconStyle} />
          </Tooltip>

          <Tooltip placement="bottom" title="Align Left" >
            <AlignLeftOutlined style={iconStyle} />
          </Tooltip>

          <Tooltip placement="bottom" title="Align Center" >
            <AlignCenterOutlined style={iconStyle} />
          </Tooltip>

          <Tooltip placement="bottom" title="Align Right" >
            <AlignRightOutlined style={iconStyle} />
          </Tooltip>

          <Tooltip placement="bottom" title="Text Color">
            <FontColorsOutlined style={iconStyle} />
          </Tooltip>
        </div>
    </div>
  );
};

export default TableFormattingToolbar;
