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
  Image,
  Upload,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import api from '../utils/api';
import type { Product, Category } from '../types';
import './Products.css';

const { TextArea } = Input;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  // 从后端获取商品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      console.log('获取到的商品列表:', response.data); // 调试日志
      setProducts(response.data);
    } catch (error: any) {
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取商品详情
  const fetchProductDetail = async (id: number) => {
    try {
      const response = await api.get(`/products/${id}`);
      setDetailProduct(response.data);
      setDetailModalVisible(true);
    } catch (error: any) {
      message.error('获取商品详情失败');
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
        imageUrl: product.imageUrl,
      });
      // 如果有图片，设置文件列表
      if (product.imageUrl) {
        setFileList([
          {
            uid: '-1',
            name: 'image.jpg',
            status: 'done',
            url: product.imageUrl.startsWith('http') 
              ? product.imageUrl 
              : `http://localhost:3000${product.imageUrl}`,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      // 新建模式，清空表单
      setEditingProduct(null);
      form.resetFields();
      setFileList([]);
    }
    setModalVisible(true);
  };

  // 处理图片上传
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    try {
      const fileUid = (file as any).uid || Date.now().toString();
      
      // 先更新文件列表为上传中状态
      const uploadFile: UploadFile = {
        uid: fileUid,
        name: (file as File).name,
        status: 'uploading',
      };
      setFileList([uploadFile]);
      
      const formData = new FormData();
      formData.append('file', file as File);
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('请先登录');
      }
      
      const response = await fetch('http://localhost:3000/upload/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '上传失败');
      }

      const data = await response.json();
      console.log('上传成功，返回数据:', data); // 调试日志
      
      // 更新表单中的 imageUrl 字段（使用相对路径，不带 http://localhost:3000）
      const imageUrlValue = data.url; // 后端返回的是 /uploads/images/xxx.jpg
      form.setFieldsValue({ imageUrl: imageUrlValue });
      console.log('设置 imageUrl 到表单:', imageUrlValue); // 调试日志
      
      // 更新文件列表为成功状态，使用服务器返回的URL
      const imageUrl = `http://localhost:3000${data.url}`;
      const successFile: UploadFile = {
        uid: fileUid,
        name: (file as File).name,
        status: 'done',
        url: imageUrl, // 使用服务器URL，不是本地文件路径
        thumbUrl: imageUrl, // 缩略图也使用服务器URL
      };
      setFileList([successFile]);
      
      message.success('图片上传成功');
      onSuccess?.(data, new XMLHttpRequest());
    } catch (error: any) {
      // 更新文件列表为错误状态
      const errorFile: UploadFile = {
        uid: (file as any).uid || Date.now().toString(),
        name: (file as File).name,
        status: 'error',
      };
      setFileList([errorFile]);
      message.error(error.message || '图片上传失败');
      onError?.(error);
    }
  };

  // 处理图片删除
  const handleRemove = () => {
    setFileList([]);
    form.setFieldsValue({ imageUrl: null });
  };

  // 保存商品（新建或更新）
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 确保 imageUrl 被包含在提交的数据中
      // 先尝试从表单获取，如果为空，尝试从 fileList 获取
      let imageUrl = form.getFieldValue('imageUrl');
      console.log('从表单获取的 imageUrl:', imageUrl); // 调试日志
      
      if (!imageUrl && fileList.length > 0) {
        const file = fileList[0];
        console.log('fileList 中的文件对象:', file); // 调试日志
        console.log('文件状态:', file.status); // 调试日志
        
        // 如果文件还在上传中，提示用户等待
        if (file.status === 'uploading') {
          message.warning('图片正在上传中，请稍候...');
          return; // 阻止提交，等待上传完成
        }
        
        // 如果表单中没有，从 fileList 中提取 URL
        if (file.url && file.status === 'done') {
          // 去掉 http://localhost:3000 前缀，只保留相对路径
          imageUrl = file.url.replace('http://localhost:3000', '');
          console.log('从 fileList 提取的 imageUrl:', imageUrl); // 调试日志
        } else if (file.response?.url) {
          // 如果 url 在 response 中
          imageUrl = file.response.url;
          console.log('从 fileList response 提取的 imageUrl:', imageUrl); // 调试日志
        } else if (file.status !== 'done') {
          // 如果文件还没有上传完成
          message.warning('请等待图片上传完成后再保存');
          return; // 阻止提交
        }
      }
      
      const submitData = {
        ...values,
        imageUrl: imageUrl || null, // 确保 imageUrl 被包含
      };
      
      console.log('提交的商品数据:', submitData); // 调试日志
      console.log('最终使用的 imageUrl:', imageUrl); // 调试日志
      
      if (editingProduct) {
        // 更新已有商品
        await api.patch(`/products/${editingProduct.id}`, submitData);
        message.success('商品更新成功');
      } else {
        // 创建新商品
        await api.post('/products', submitData);
        message.success('商品创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      setFileList([]); // 清空文件列表
      fetchProducts(); // 刷新列表
    } catch (error: any) {
      console.error('保存商品失败:', error); // 调试日志
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
      title: '商品图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (imageUrl: string | null) => {
        if (imageUrl) {
          // 处理图片URL：如果是相对路径，添加服务器地址
          const imageSrc = imageUrl.startsWith('http') 
            ? imageUrl 
            : `http://localhost:3000${imageUrl}`;
          return (
            <Image
              src={imageSrc}
              alt="商品图片"
              width={60}
              height={60}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAwIiB5PSIzMTAiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuaXoOazleWKoOi9veWbvueJhzwvdGV4dD48L3N2Zz4="
            />
          );
        }
        return (
          <div
            style={{
              width: 60,
              height: 60,
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              color: '#999',
              fontSize: 12,
            }}
          >
            暂无图片
          </div>
        );
      },
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Product) => (
        <Button
          type="link"
          onClick={() => fetchProductDetail(record.id)}
          style={{ padding: 0, fontWeight: 500 }}
        >
          {name}
        </Button>
      ),
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

          <Form.Item name="imageUrl" label="商品图片" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item label="上传图片">
            <Upload
              fileList={fileList}
              customRequest={handleUpload}
              onRemove={handleRemove}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              beforeUpload={(file) => {
                console.log('beforeUpload 被调用，文件:', file); // 调试日志
                // 检查文件大小（5MB）
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('图片大小不能超过 5MB!');
                  return Upload.LIST_IGNORE;
                }
                // 检查文件类型
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('只能上传图片文件!');
                  return Upload.LIST_IGNORE;
                }
                // 返回 false 阻止默认上传，使用 customRequest
                // 注意：返回 false 时，文件会被添加到 fileList，但不会自动调用 customRequest
                // 需要在 onChange 中手动触发
                // 但是，我们可以在这里直接触发上传
                setTimeout(() => {
                  console.log('在 beforeUpload 后触发上传，文件:', file); // 调试日志
                  handleUpload({
                    file: file,
                    onSuccess: (response: any) => {
                      console.log('上传成功回调:', response);
                    },
                    onError: (error: any) => {
                      console.error('上传失败回调:', error);
                    },
                  } as any);
                }, 100); // 延迟一点，确保 fileList 已更新
                return false;
              }}
              onChange={(info) => {
                console.log('文件列表变化:', info); // 调试日志
                const { file, fileList: newFileList } = info;
                
                console.log('文件状态:', file.status); // 调试日志
                console.log('是否有 originFileObj:', !!file.originFileObj); // 调试日志
                
                // 更新文件列表
                setFileList(newFileList as UploadFile[]);
                
                // 如果文件刚被添加（没有状态或状态为 undefined），手动触发上传
                // 尝试从 originFileObj 或直接使用 file 对象
                const fileToUpload = file.originFileObj || (file as any);
                
                if ((file.status === undefined || !file.status) && fileToUpload) {
                  console.log('检测到新文件，开始上传...', file); // 调试日志
                  console.log('使用的文件对象:', fileToUpload); // 调试日志
                  // 手动调用上传函数
                  handleUpload({
                    file: fileToUpload,
                    onSuccess: (response: any) => {
                      console.log('上传成功回调:', response);
                    },
                    onError: (error: any) => {
                      console.error('上传失败回调:', error);
                    },
                  } as any);
                } else {
                  console.log('不满足上传条件，文件状态:', file.status, '是否有 originFileObj:', !!file.originFileObj, 'fileToUpload:', !!fileToUpload); // 调试日志
                }
              }}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
              支持 JPG、PNG、GIF、WEBP 格式，最大 5MB
            </div>
          </Form.Item>
          
          <Form.Item name="imageUrlText" label="或输入图片URL">
            <Input
              placeholder="也可以直接输入图片链接地址"
              allowClear
              onChange={(e) => {
                form.setFieldsValue({ imageUrl: e.target.value || null });
                if (e.target.value) {
                  setFileList([]);
                }
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 商品详情弹窗 */}
      <Modal
        title="商品详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setDetailProduct(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false);
            setDetailProduct(null);
          }}>
            关闭
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setDetailModalVisible(false);
              if (detailProduct) {
                handleOpenModal(detailProduct);
              }
            }}
          >
            编辑
          </Button>,
        ]}
        width={600}
        className="product-modal"
      >
        {detailProduct && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: 16 }}>
              <strong>商品ID：</strong>
              <span>{detailProduct.id}</span>
            </div>
            {detailProduct.imageUrl && (
              <div style={{ marginBottom: 16 }}>
                <strong>商品图片：</strong>
                <div style={{ marginTop: 8 }}>
                  <Image
                    src={detailProduct.imageUrl.startsWith('http') 
                      ? detailProduct.imageUrl 
                      : `http://localhost:3000${detailProduct.imageUrl}`}
                    alt="商品图片"
                    width={200}
                    style={{ borderRadius: 8 }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwMCIgeT0iMzEwIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7ml6Dms5XliqDovb3lm77niYc8L3RleHQ+PC9zdmc+"
                  />
                </div>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <strong>商品名称：</strong>
              <span>{detailProduct.name}</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>商品描述：</strong>
              <div style={{ marginTop: 8, color: '#666' }}>
                {detailProduct.description || '暂无描述'}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>价格：</strong>
              <span className="price-text" style={{ fontSize: 18, marginLeft: 8 }}>
                ¥{detailProduct.price.toFixed(2)}
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>库存：</strong>
              <Tag color={detailProduct.stock > 0 ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                {detailProduct.stock}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>分类：</strong>
              <span style={{ marginLeft: 8 }}>
                {detailProduct.category?.name || '未分类'}
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>创建时间：</strong>
              <span style={{ marginLeft: 8 }}>
                {new Date(detailProduct.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
            <div>
              <strong>更新时间：</strong>
              <span style={{ marginLeft: 8 }}>
                {new Date(detailProduct.updatedAt).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Products;
