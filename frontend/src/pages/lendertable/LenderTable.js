import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Popconfirm, Form } from 'antd';

import EditableCell from '../../components/table/EditableCell';
import { StyledDiv } from './LenderTable.styles';
import COLUMNS from './LenderTable.columns';

const { REACT_APP_API } = process.env;

const LenderTable = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${REACT_APP_API}/api/lender/`);
      const { results } = res.data;
      setData(results);
    };
    fetchData();
  }, []);

  const isEditing = (record) => record.permanent_name === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.permanent_name);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (permanent_name) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => permanent_name === item.permanent_name);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    ...COLUMNS,
    {
      title: 'Actions',
      dataIndex: 'action',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a
              href="javascript:;"
              onClick={() => save(record.permanent_name)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </a>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <a disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </a>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <StyledDiv>
      <Form form={form} component={false}>
        <Table
          scroll={{ x: 1900 }}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: false,
          }}
        />
      </Form>
    </StyledDiv>
  );
};

export default LenderTable;
