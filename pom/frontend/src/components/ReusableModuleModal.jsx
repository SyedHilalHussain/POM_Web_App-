import React, { useState, useEffect } from 'react';
import { Modal, Button, List, Typography, Input } from 'antd';
import axios from 'axios';

const ReusableModuleModal = ({
  visible,
  onClose,
  onCreateNew,
  onOpenFile,
  moduleTitle,
  apiEndpoint
}) => {
  const [savedFiles, setSavedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFileName, setNewFileName] = useState(''); // For entering a new file name

  useEffect(() => {
    const fetchSavedFiles = async () => {
      if (!apiEndpoint) return;
      setLoading(true);  // Set loading true only when modal opens

      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(apiEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedFiles(response.data);
      } catch (error) {
        console.error(`Error fetching saved files for ${moduleTitle}:`, error);
      }
      setLoading(false);
    };

    if (visible) {
      fetchSavedFiles();
    }
  }, [visible, apiEndpoint, moduleTitle]);

  const handleCreateNew = () => {
    if (newFileName.trim()) {
      onCreateNew(newFileName.trim());  // Pass file name to onCreateNew callback
      setNewFileName('');
    }
  };

  return (
    <Modal
      title={moduleTitle}
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      {/* Input for creating a new file */}
      <Input
        placeholder="Enter file name"
        value={newFileName}
        onChange={(e) => setNewFileName(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <Button
        type="primary"
        onClick={handleCreateNew}
        disabled={!newFileName.trim()}  // Disable button if no file name entered
        style={{ marginBottom: '10px' }}
      >
        Create New File
      </Button>

      {/* List of existing files */}
      <Typography.Title level={4}>Open Existing Files</Typography.Title>
      <List
        bordered
        dataSource={savedFiles}
        loading={loading}
        renderItem={(file) => (
          <List.Item onClick={() => onOpenFile(file.id)} style={{ cursor: 'pointer' }}>
            {file.name} - {file.created_at ? new Date(file.created_at).toLocaleString() : 'No Date'}
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default ReusableModuleModal;
