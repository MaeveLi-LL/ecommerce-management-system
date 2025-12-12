import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../utils/api';
import type { Category } from '../types';
import './Categories.css';

const { Search } = Input;

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeSearchKeyword, setActiveSearchKeyword] = useState('');
  const [form] = Form.useForm();

  // Fetch categories from backend
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error: any) {
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Open modal for adding or editing category
  const handleOpenModal = (category?: Category) => {
    if (category) {
      // Edit mode
      setEditingCategory(category);
      form.setFieldsValue({
        name: category.name,
        parentId: category.parentId,
      });
    } else {
      // Create mode
      setEditingCategory(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Save category (create or update)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // If parentId is undefined (cleared), set to null
      const submitData = {
        ...values,
        parentId: values.parentId === undefined ? null : values.parentId,
      };
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, submitData);
        message.success('Category updated successfully');
      } else {
        await api.post('/categories', submitData);
        message.success('Category created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchCategories(); // Refresh list
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Delete category
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      message.success('Category deleted successfully');
      fetchCategories(); // Refresh list
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Delete failed');
    }
  };

  // Find parent category name by parentId for display
  const getParentName = (parentId: number | null) => {
    if (!parentId) return '-';
    const parent = categories.find((cat) => cat.id === parentId);
    return parent?.name || '-';
  };

  // Handle search - only filter when search button is clicked
  const handleSearch = (value: string) => {
    setActiveSearchKeyword(value);
  };

  // Filter categories based on active search keyword (only after clicking search button)
  const filteredCategories = categories.filter((category) => {
    if (!activeSearchKeyword) return true;
    const keyword = activeSearchKeyword.toLowerCase();
    const categoryName = category.name.toLowerCase();
    const parentName = getParentName(category.parentId).toLowerCase();
    const categoryId = category.id.toString();
    const productCount = (category._count?.products || 0).toString();
    
    return (
      categoryName.includes(keyword) ||
      parentName.includes(keyword) ||
      categoryId.includes(keyword) ||
      productCount.includes(keyword)
    );
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Parent Category',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId: number | null) => getParentName(parentId),
    },
    {
      title: 'Product Count',
      dataIndex: '_count',
      key: '_count',
      render: (_count: any) => _count?.products || 0,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('en-US'),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            className="action-button"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Confirm"
            cancelText="Cancel"
          >
            <Button type="link" danger icon={<DeleteOutlined />} className="action-button">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="categories-page">
      <Card className="categories-card">
        <div className="page-header">
          <h2 className="page-title">Category Management</h2>
          <Space>
            <Search
              placeholder="Search categories by name, parent, ID, or product count"
              allowClear
              enterButton
              size="large"
              style={{ width: 400 }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              onClear={() => {
                setSearchKeyword('');
                setActiveSearchKeyword('');
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
              className="add-button"
              size="large"
            >
              Create Category
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="categories-table"
          locale={{ emptyText: 'No Data' }}
        />
      </Card>

      <Modal
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={500}
        className="category-modal"
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item name="parentId" label="Parent Category">
            <Select placeholder="Select parent category (optional)" allowClear>
              {categories
                .filter((cat) => cat.id !== editingCategory?.id)
                .map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
