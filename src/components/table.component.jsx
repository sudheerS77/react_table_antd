import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Popconfirm, Button, Space, Form, Input } from "antd";
import { filter, isEmpty } from "lodash";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const TableComponent = () => {
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});
  const [editRowKey, setEditRowKey] = useState("");
  const [searchText, setSearchText] = useState("");
  const [serarchColText, setSearchColText] = useState("");
  const [serarchedCol, setSearchedCol] = useState("");
  const [filteredInfo, setFilteredInfo] = useState({});
  let [filteredData] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await axios.get(
      "https://jsonplaceholder.typicode.com/comments"
    );
    setGridData(res.data);
    console.warn(gridData);
    setLoading(false);
  };

  const dataWithAge = gridData?.map((item) => ({
    ...item,
    age: Math.floor(Math.random() * 6) + 20,
  }));

  const modifyData = dataWithAge.map(({ body, ...item }) => ({
    ...item,
    key: item.id,
    message: isEmpty(body) ? item.message : body,
  }));

  //Actions
  //Delete the column
  const handleDelete = (value) => {
    const data = [...modifyData];
    const filterData = data.filter((item) => item.id !== value.id);
    setGridData(filterData);
  };
  const isEditing = (record) => {
    return record.key === editRowKey;
  };

  //Cancel
  const cancel = () => {
    setEditRowKey("");
  };
  //Edit the column data
  const edit = (record) => {
    form.setFieldsValue({
      name: "",
      email: "",
      message: "",
      ...record,
    });
    setEditRowKey(record.key);
  };
  //Edit the column data
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...modifyData];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setGridData(newData);
        setEditRowKey("");
      }
    } catch (error) {
      console.log("Error Message" + error);
    }
  };
  const handleChange = (_, filters, sorter) => {
    const { order, field } = sorter;
    setFilteredInfo(filters);
    setSortedInfo({ columnkey: field, order });
  };

  //Searching on individual colmns
  const getColumnSearchProps = (dataIndex) => ({
    filterDropDown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 20 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
          }}
          onPressEnter={() => handleSearchCol(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBlock: 0, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearchCol(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            type="primary"
            onClick={() => handleResetCol(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "red" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",

    // //     filterIcon: (filtered) => (
    // //         <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }}
    // //     ),
    render: (text) =>
      serarchedCol === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: "0" }}
          searchWords={[serarchColText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleSearchCol = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchColText(selectedKeys[0]);
    setSearchedCol(dataIndex);
  };
  const handleResetCol = (clearFilters) => {
    clearFilters();
    setSearchColText("");
  };
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a, b) => a.id.length - b.id.length,
      sortOrder: sortedInfo.columnkey === "id" && sortedInfo.order,
    },
    {
      title: "Name",
      dataIndex: "name",
      align: "Center",
      editable: true,
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnkey === "name" && sortedInfo.order,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "Center",
      editable: true,
      sorter: (a, b) => a.email.length - b.email.length,
      sortOrder: sortedInfo.columnkey === "email" && sortedInfo.order,
      ...getColumnSearchProps("email"),
    },
    {
      title: "Age",
      dataIndex: "age",
      align: "Center",
      editable: false,
      sorter: (a, b) => a.age.length - b.age.length,
      sortOrder: sortedInfo.columnkey === "age" && sortedInfo.order,
      filters: [
        { text: "20", value: "20" },
        { text: "21", value: "21" },
        { text: "22", value: "22" },
        { text: "23", value: "23" },
        { text: "24", value: "24" },
        { text: "25", value: "25" },
      ],
      filteredData: filteredInfo.age || null,
      onFilter: (value, record) => String(record.age).includes(value),
    },
    {
      title: "Meassage",
      dataIndex: "message",
      align: "Center",
      editable: true,
    },
    {
      title: "Actions",
      dataIndex: "action",
      align: "Center",
      render: (_, record) => {
        const editable = isEditing(record);
        return modifyData.length >= 1 ? (
          <Space>
            {editable ? (
              ""
            ) : (
              <Popconfirm
                title="Are you sure to delete"
                onConfirm={() => handleDelete(record)}
              >
                <Button danger type="primary" disabled={editable}>
                  Delete
                </Button>
              </Popconfirm>
            )}
            {editable ? (
              <span>
                <Space size={"middle"}>
                  <Button onClick={() => save(record.key)} type="primary">
                    Save
                  </Button>
                  <Popconfirm
                    title="Are you sure to cancel ?"
                    onConfirm={cancel}
                  >
                    <Button>Cancel</Button>
                  </Popconfirm>
                </Space>
              </span>
            ) : (
              <Button onClick={() => edit(record)} type="primary">
                Edit
              </Button>
            )}
          </Space>
        ) : null;
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
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  const EditableCell = ({
    editing,
    dataIndex,
    title,
    record,
    children,
    ...restProps
  }) => {
    const input = <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `${title} cant be empty`,
              },
            ]}
          >
            {input}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };
  const reset = () => {
    setSortedInfo({});
    setFilteredInfo({});
    setSearchText("");
    loadData();
  };
  const handleSearch = (e) => {
    setSearchText(e.target.value);
    if (e.target.value === "") {
      loadData();
    }
  };
  const globalSearch = () => {
    filteredData = modifyData.filter((value) => {
      return (
        value.name.toLowerCase().includes(searchText.toLocaleLowerCase()) ||
        value.email.toLowerCase().includes(searchText.toLocaleLowerCase())
      );
    });
    setGridData(filteredData);
  };

  return (
    <div>
      <Space>
        <Input
          placeholder="Enter Search Text"
          onChange={handleSearch}
          type="text"
          allowClear
          value={searchText}
        />
        <Button onClick={globalSearch} type="primary">
          Search
        </Button>
        <Button onClick={reset}>Reset</Button>
      </Space>
      <Form form={form} component={false}>
        <Table
          columns={mergedColumns}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          dataSource={
            filteredData && filteredData.length ? filteredData : modifyData
          }
          bordered
          loading={loading}
          onChange={handleChange}
        />
      </Form>
    </div>
  );
};

export default TableComponent;
