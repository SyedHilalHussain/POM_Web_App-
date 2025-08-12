import React from 'react'
import { useState } from 'react';

// function Vertical_button(props) {

//   const [isHovered, setIsHovered] = useState(false);
//   const [isActive, setIsActive] = useState(false);

//     const ButtonStyle = {
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         lineHeight: '1.2',
//         margin: '0 5px',
//         width: '50px',
//         maxHeight: '55px',
//         padding: '5px 10px',
//         cursor: 'pointer',
//         backgroundColor:  isActive 
//         ? 'rgba(0, 0, 0, 0.2)'  // Active state (darker)
//         : isHovered 
//         ? 'rgba(0, 0, 0, 0.1)'  // Hover state (lighter)
//         : 'transparent',         // Default state
//         borderRadius: '4px',
//         transition: 'background-color 0.3s ease', // Smooth transition effect
//       };

//       const TextStyle = { fontSize: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', padding: '0', marginTop: '2px' };

//   return (
//       <div style={ButtonStyle} onClick={props.onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} 
//       onMouseDown={() => setIsActive(true)}
//       onMouseUp={() => setIsActive(false)}>
//         <props.icon style={{ fontSize: '22px' }} />
//         <span style={TextStyle}>{props.text}</span>
//       </div>    
//   )
// }

// export default Vertical_button


function Vertical_button(props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const disabledStyle = {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: 'transparent',
  };

  const ButtonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    lineHeight: '1.2',
    margin: '0 5px',
    width: '50px',
    maxHeight: '55px',
    padding: '5px 10px',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    backgroundColor: props.disabled
      ? 'transparent'
      : isActive
      ? 'rgba(0, 0, 0, 0.2)'
      : isHovered
      ? 'rgba(0, 0, 0, 0.1)'
      : 'transparent',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease',
    ...(props.disabled && disabledStyle),
  };

  const TextStyle = {
    fontSize: '12px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    marginTop: '2px',
  };

  return (
    <div
      style={ButtonStyle}
      onClick={props.disabled ? undefined : props.onClick}
      onMouseEnter={() => !props.disabled && setIsHovered(true)}
      onMouseLeave={() => !props.disabled && setIsHovered(false)}
      onMouseDown={() => !props.disabled && setIsActive(true)}
      onMouseUp={() => !props.disabled && setIsActive(false)}
    >
      <props.icon style={{ fontSize: '22px' }} />
      <span style={TextStyle}>{props.text}</span>
    </div>
  );
}

export default Vertical_button;
