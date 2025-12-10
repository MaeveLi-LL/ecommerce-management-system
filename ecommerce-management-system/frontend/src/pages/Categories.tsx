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

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  // 从后端获取分类列表
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error: any) {
      message.error('获取分类列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 打开添加或编辑分类的弹窗
  const handleOpenModal = (category?: Category) => {
    if (category) {
      // 编辑模式
      setEditingCategory(category);
      form.setFieldsValue({
        name: category.name,
        parentId: category.parentId,
      });
    } else {
      // 新建模式
      setEditingCategory(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 保存分类（新建或更新）
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 如果父分类是undefined（清空了），改成null
      const submitData = {
        ...values,
        parentId: values.parentId === undefined ? null : values.parentId,
      };
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, submitData);
        message.success('分类更新成功');
      } else {
        await api.post('/categories', submitData);
        message.success('分类创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchCategories(); // 刷新列表
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  // 删除分类
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      message.success('分类删除成功');
      fetchCategories(); // 刷新列表
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  // 根据父分类ID找父分类名称，用于显示
  const getParentName = (parentId: number | null) => {
    if (!parentId) return '-';
    const parent = categories.find((cat) => cat.id === parentId);
    return parent?.name || '-';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '父分类',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId: number | null) => getParentName(parentId),
    },
    {
      title: '商品数量',
      dataIndex: '_count',
      key: '_count',
      render: (_count: any) => _count?.products || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            className="action-button"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} className="action-button">
              删除
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
          <h2 className="page-title">分类管理</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
            className="add-button"
            size="large"
          >
            创建分类
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="categories-table"
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '创建分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={500}
        className="category-modal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item name="parentId" label="父分类">
            <Select placeholder="请选择父分类（可选）" allowClear>
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
