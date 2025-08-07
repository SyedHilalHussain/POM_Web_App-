// PreferenceMatrixModal.js    it is for selecting rows and column for preference matrix table
import React, { useState } from 'react';
import { Modal, Input, Button,Radio, Select, InputNumber } from 'antd';

const { Option } = Select;

function PreferenceMatrixModal({ isVisible, onClose, onConfirm }) {
    const [numFactors, setNumFactors] = useState(3);
    const [numOptions, setNumOptions] = useState(3);
    const [rowSequence, setRowSequence] = useState("option");
    const [columnSequence, setColumnSequence] = useState("option");
    const [customRows, setCustomRows] = useState(["Factor 1", "Factor 2", "Factor 3"]);
    const [customColumns, setCustomColumns] = useState(["Option A", "Option B", "Option C"]);

    const predefinedSequences = {
        option: (count) => Array.from({ length: count }, (_, i) => `Option ${i + 1}`),
        alphabetLower: (count) => Array.from({ length: count }, (_, i) => String.fromCharCode(97 + i)),
        alphabetUpper: (count) => Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i)),
        numbers: (count) => Array.from({ length: count }, (_, i) => (i + 1).toString()),
        months: (count) => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].slice(0, count)
    };

    const handleConfirm = () => {
        const rows = rowSequence === "custom" ? customRows : predefinedSequences[rowSequence](numFactors);
        const columns = columnSequence === "custom" ? customColumns : predefinedSequences[columnSequence](numOptions);
        onConfirm({ rows, columns, numFactors, numOptions });
        onClose();
    };

    return (
        <Modal title="Configure Preference Matrix" visible={isVisible} onCancel={onClose} footer={null}>
            <h3>Number of Factors</h3>
            <InputNumber min={1} value={numFactors} onChange={setNumFactors} style={{ width: '100%', marginBottom: 10 }} />

            <h3>Number of Options</h3>
            <InputNumber min={1} value={numOptions} onChange={setNumOptions} style={{ width: '100%', marginBottom: 10 }} />

            <h3>Row Names</h3>
            <Radio.Group onChange={(e) => setRowSequence(e.target.value)} value={rowSequence}>
                <Radio value="option">Option 1, Option 2, ...</Radio>
                <Radio value="alphabetLower">a, b, c, ...</Radio>
                <Radio value="alphabetUpper">A, B, C, ...</Radio>
                <Radio value="numbers">1, 2, 3, ...</Radio>
                <Radio value="months">January, February, ...</Radio>
                <Radio value="custom">Other</Radio>
            </Radio.Group>
            {rowSequence === "custom" && customRows.map((name, index) => (
                <Input key={index} value={name} onChange={(e) => {
                    const newNames = [...customRows];
                    newNames[index] = e.target.value;
                    setCustomRows(newNames);
                }} style={{ marginBottom: 5 }} />
            ))}

            <h3>Column Names</h3>
            <Radio.Group onChange={(e) => setColumnSequence(e.target.value)} value={columnSequence}>
                <Radio value="option">Option 1, Option 2, ...</Radio>
                <Radio value="alphabetLower">a, b, c, ...</Radio>
                <Radio value="alphabetUpper">A, B, C, ...</Radio>
                <Radio value="numbers">1, 2, 3, ...</Radio>
                <Radio value="months">January, February, ...</Radio>
                <Radio value="custom">Other</Radio>
            </Radio.Group>
            {columnSequence === "custom" && customColumns.map((name, index) => (
                <Input key={index} value={name} onChange={(e) => {
                    const newNames = [...customColumns];
                    newNames[index] = e.target.value;
                    setCustomColumns(newNames);
                }} style={{ marginBottom: 5 }} />
            ))}

            <div style={{ textAlign: 'right', marginTop: 10 }}>
                <Button onClick={onClose} style={{ marginRight: 10 }}>Cancel</Button>
                <Button type="primary" onClick={handleConfirm}>OK</Button>
            </div>
        </Modal>
    );
}


export default PreferenceMatrixModal;