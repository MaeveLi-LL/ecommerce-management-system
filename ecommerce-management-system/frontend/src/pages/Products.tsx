import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../utils/api';
import type { Product, Category } from '../types';
import './Products.css';

const { TextArea } = Input;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // 从后端获取商品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error: any) {
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取分类列表，用于下拉选择
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error: any) {
      message.error('获取分类列表失败');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // 打开添加或编辑商品的弹窗
  const handleOpenModal = (product?: Product) => {
    if (product) {
      // 编辑模式，把商品信息填到表单里
      setEditingProduct(product);
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
      });
    } else {
      // 新建模式，清空表单
      setEditingProduct(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 保存商品（新建或更新）
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        // 更新已有商品
        await api.patch(`/products/${editingProduct.id}`, values);
        message.success('商品更新成功');
      } else {
        // 创建新商品
        await api.post('/products', values);
        message.success('商品创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchProducts(); // 刷新列表
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  // 删除商品
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('商品删除成功');
      fetchProducts(); // 刷新列表
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <span className="price-text">¥{price.toFixed(2)}</span>,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>{stock}</Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: Category | null) => category?.name || '-',
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
      render: (_: any, record: Product) => (
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
            title="确定要删除这个商品吗？"
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
    <div className="products-page">
      <Card className="products-card">
        <div className="page-header">
          <h2 className="page-title">商品管理</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
            className="add-button"
            size="large"
          >
            创建商品
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="products-table"
        />
      </Card>

      <Modal
        title={editingProduct ? '编辑商品' : '创建商品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
        className="product-modal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>

          <Form.Item name="description" label="商品描述">
            <TextArea rows={4} placeholder="请输入商品描述" />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
            rules={[
              { required: true, message: '请输入价格' },
              { type: 'number', min: 0, message: '价格必须大于0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入价格"
              prefix="¥"
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="库存"
            rules={[
              { required: true, message: '请输入库存' },
              { type: 'number', min: 0, message: '库存必须大于等于0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入库存"
              min={0}
            />
          </Form.Item>

          <Form.Item name="categoryId" label="分类">
            <Select placeholder="请选择分类" allowClear>
              {categories.map((category) => (
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

export default Products;
