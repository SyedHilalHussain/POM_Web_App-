import React, { createContext, useState } from 'react';

// Create context
const MyContext = createContext();

// Context provider component
export const MyContextProvider = ({ children }) => {
  const [selectedKey, setSelectedKey] = useState(null);  // Manages selected sidebar key
  const [isModalVisible, setIsModalVisible] = useState(false);  // Controls file manager modal visibility
  const [selectedFile, setSelectedFile] = useState(null);  // Tracks selected file
  const [showMultiProductModal, setShowMultiProductModal] = useState(false);
  const [showCrossoverModal, setShowCrossoverModal] = useState(false);
  return (
    <MyContext.Provider value={{
      selectedKey,
      setSelectedKey,
      isModalVisible,
      setIsModalVisible,
      selectedFile,
      setSelectedFile,
      showMultiProductModal,
      setShowMultiProductModal,
        showCrossoverModal,
      setShowCrossoverModal
    }}>
      {children}
    </MyContext.Provider>
  );
};

export default MyContext;