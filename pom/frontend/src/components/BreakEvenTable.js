import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Image } from 'antd';
import axios from 'axios';

function BreakEvenTable({ fileId = null, fileName, isSaved, setIsSaved }) {
    const [formData, setFormData] = useState({
        fixedCosts: '',
        variableCosts: '',
        revenuePerUnit: '',
        volume: '',
    });
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (fileId) {
            const fetchData = async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await axios.get(`/api/retrieve-file/${fileId}/`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setFormData(response.data.input_data);
                    setResult(response.data.output_data);
                    setIsSaved(true); // Set button to "Update"
                } catch (error) {
                    console.error('Error loading file data', error);
                }
            };
            fetchData();
        } else {
            setIsSaved(false); // Reset button to "Save" for new files
        }
    }, [fileId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('access_token');
        const url = fileId ? `/api/update-file/${fileId}/` : '/api/save-file/';
        const data = {
            file_id: fileId,
            name: fileName,
            input_data: formData
        };

        try {
            const response = await axios({
                method: fileId ? 'put' : 'post',
                url: url,
                data: data,
                headers: { Authorization: `Bearer ${token}` },
            });
            setResult(response.data.output_data);
            setIsSaved(true); // Change button text to "Update"
        } catch (error) {
            console.error('Error saving file:', error);
        }
    };

    return (
        <div>
            <h3>{fileName} - Breakeven Analysis</h3>
            <label>Volume for Analysis:</label>
            <Input
                name="volume"
                value={formData.volume}
                onChange={handleChange}
                placeholder="Enter Volume"
            />
            <Table
                columns={[
                    { title: 'Cost Type', dataIndex: 'costType', key: 'costType' },
                    { title: 'Costs', dataIndex: 'costs', key: 'costs' },
                    { title: 'Revenues', dataIndex: 'revenues', key: 'revenues' },
                ]}
                dataSource={[
                    { key: '1', costType: 'Fixed Costs', costs: <Input name="fixedCosts" value={formData.fixedCosts} onChange={handleChange} />, revenues: 'xxxxxx' },
                    { key: '2', costType: 'Variable Costs', costs: <Input name="variableCosts" value={formData.variableCosts} onChange={handleChange} />, revenues: 'xxxxxx' },
                    { key: '3', costType: 'Revenue per Unit', costs: 'xxxxxx', revenues: <Input name="revenuePerUnit" value={formData.revenuePerUnit} onChange={handleChange} /> },
                ]}
                pagination={false}
                bordered
            />
            <Button type="primary" onClick={handleSave} style={{ marginTop: '16px' }}>
                {isSaved ? 'Update' : 'Save'}
            </Button>
            {result && (
                <div style={{ marginTop: '24px' }}>
                    <h4>Break-Even Results</h4>
                    <Table
                        columns={[
                            { title: 'Cost Type', dataIndex: 'costType', key: 'costType' },
                            { title: 'Costs', dataIndex: 'costs', key: 'costs' },
                            { title: 'Revenues', dataIndex: 'revenues', key: 'revenues' },
                        ]}
                        dataSource={[
                            { key: '1', costType: 'Fixed Costs', costs: formData.fixedCosts, revenues: 'xxxxxx' },
                            { key: '2', costType: 'Variable Costs', costs: formData.variableCosts, revenues: 'xxxxxx' },
                            { key: '3', costType: 'Revenue per Unit', costs: 'xxxxxx', revenues: formData.revenuePerUnit },
                            { key: '4', costType: 'Break-even Units', costs: result?.break_even_units ?? 'N/A', revenues: result?.break_even_revenue ?? 'N/A' },
                            { key: '5', costType: 'Total Variable Costs', costs: result?.total_variable_costs ?? 'N/A', revenues: result?.total_revenue ?? 'N/A' },
                            { key: '6', costType: 'Total Costs', costs: result?.total_costs ?? 'N/A', revenues: '0' },
                            { key: '7', costType: 'Net Profit', costs: result?.net_profit ?? 'N/A', revenues: 'xxxxxx' }
                        ]}
                        pagination={false}
                        bordered
                    />
                    <h4>Break-Even Chart</h4>
                    {result?.chart_url && <Image src={result.chart_url} alt="Break-even Chart" />}
                </div>
            )}
        </div>
    );
}

export default BreakEvenTable;
