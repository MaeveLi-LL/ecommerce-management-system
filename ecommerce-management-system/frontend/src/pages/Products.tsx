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

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      console.log('Fetched products:', response.data);
      setProducts(response.data);
    } catch (error: any) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch product details
  const fetchProductDetail = async (id: number) => {
    try {
      const response = await api.get(`/products/${id}`);
      setDetailProduct(response.data);
      setDetailModalVisible(true);
    } catch (error: any) {
      message.error('Failed to fetch product details');
    }
  };

  // Fetch categories for dropdown selection
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error: any) {
      message.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Open modal for adding or editing product
  const handleOpenModal = (product?: Product) => {
    if (product) {
      // Edit mode: populate form with product data
      setEditingProduct(product);
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
      });
      // If image exists, set file list
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
      // Create mode: clear form
      setEditingProduct(null);
      form.resetFields();
      setFileList([]);
    }
    setModalVisible(true);
  };

  // Handle image upload
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    try {
      const fileUid = (file as any).uid || Date.now().toString();
      
      // Update file list to uploading status
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
        throw new Error('Please login first');
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
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful, response:', data);
      
      // Update imageUrl in form (use relative path without http://localhost:3000)
      const imageUrlValue = data.url; // Backend returns /uploads/images/xxx.jpg
      form.setFieldsValue({ imageUrl: imageUrlValue });
      console.log('Set imageUrl to form:', imageUrlValue);
      
      // Update file list to success status, use server URL
      const imageUrl = `http://localhost:3000${data.url}`;
      const successFile: UploadFile = {
        uid: fileUid,
        name: (file as File).name,
        status: 'done',
        url: imageUrl, // Use server URL, not local file path
        thumbUrl: imageUrl, // Thumbnail also uses server URL
      };
      setFileList([successFile]);
      
      message.success('Image uploaded successfully');
      onSuccess?.(data, new XMLHttpRequest());
    } catch (error: any) {
      // Update file list to error status
      const errorFile: UploadFile = {
        uid: (file as any).uid || Date.now().toString(),
        name: (file as File).name,
        status: 'error',
      };
      setFileList([errorFile]);
      message.error(error.message || 'Image upload failed');
      onError?.(error);
    }
  };

  // Handle image removal
  const handleRemove = () => {
    setFileList([]);
    form.setFieldsValue({ imageUrl: null });
  };

  // Save product (create or update)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Ensure imageUrl is included in submitted data
      // Try to get from form first, if empty, try from fileList
      let imageUrl = form.getFieldValue('imageUrl');
      console.log('ImageUrl from form:', imageUrl);
      
      if (!imageUrl && fileList.length > 0) {
        const file = fileList[0];
        console.log('File object in fileList:', file);
        console.log('File status:', file.status);
        
        // If file is still uploading, prompt user to wait
        if (file.status === 'uploading') {
          message.warning('Image is uploading, please wait...');
          return; // Prevent submission, wait for upload to complete
        }
        
        // If not in form, extract URL from fileList
        if (file.url && file.status === 'done') {
          // Remove http://localhost:3000 prefix, keep only relative path
          imageUrl = file.url.replace('http://localhost:3000', '');
          console.log('Extracted imageUrl from fileList:', imageUrl);
        } else if (file.response?.url) {
          // If url is in response
          imageUrl = file.response.url;
          console.log('Extracted imageUrl from fileList response:', imageUrl);
        } else if (file.status !== 'done') {
          // If file hasn't finished uploading
          message.warning('Please wait for image upload to complete before saving');
          return; // Prevent submission
        }
      }
      
      const submitData = {
        ...values,
        imageUrl: imageUrl || null, // Ensure imageUrl is included
      };
      
      console.log('Submitting product data:', submitData);
      console.log('Final imageUrl used:', imageUrl);
      
      if (editingProduct) {
        // Update existing product
        await api.patch(`/products/${editingProduct.id}`, submitData);
        message.success('Product updated successfully');
      } else {
        // Create new product
        await api.post('/products', submitData);
        message.success('Product created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setFileList([]); // Clear file list
      fetchProducts(); // Refresh list
    } catch (error: any) {
      console.error('Failed to save product:', error);
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Delete product
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Product deleted successfully');
      fetchProducts(); // Refresh list
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Delete failed');
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
      title: 'Product Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (imageUrl: string | null) => {
        if (imageUrl) {
          // Handle image URL: if relative path, add server address
          const imageSrc = imageUrl.startsWith('http') 
            ? imageUrl 
            : `http://localhost:3000${imageUrl}`;
          return (
            <Image
              src={imageSrc}
              alt="Product Image"
              width={60}
              height={60}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAwIiB5PSIzMTAiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
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
            No Image
          </div>
        );
      },
    },
    {
      title: 'Product Name',
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <span className="price-text">${price.toFixed(2)}</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>{stock}</Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: Category | null) => category?.name || '-',
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
      render: (_: any, record: Product) => (
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
            title="Are you sure you want to delete this product?"
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
    <div className="products-page">
      <Card className="products-card">
        <div className="page-header">
          <h2 className="page-title">Product Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
            className="add-button"
            size="large"
          >
            Create Product
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="products-table"
          locale={{ emptyText: 'No Data' }}
        />
      </Card>

      <Modal
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
        className="product-modal"
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter product description" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[
              { required: true, message: 'Please enter price' },
              { type: 'number', min: 0, message: 'Price must be greater than 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter price"
              prefix="$"
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Stock"
            rules={[
              { required: true, message: 'Please enter stock' },
              { type: 'number', min: 0, message: 'Stock must be greater than or equal to 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter stock"
              min={0}
            />
          </Form.Item>

          <Form.Item name="categoryId" label="Category">
            <Select placeholder="Select category" allowClear>
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="imageUrl" label="Product Image" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item label="Upload Image">
            <Upload
              fileList={fileList}
              customRequest={handleUpload}
              onRemove={handleRemove}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              beforeUpload={(file) => {
                console.log('beforeUpload called, file:', file);
                // Check file size (5MB)
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('Image size cannot exceed 5MB!');
                  return Upload.LIST_IGNORE;
                }
                // Check file type
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('Only image files are allowed!');
                  return Upload.LIST_IGNORE;
                }
                // Return false to prevent default upload, use customRequest
                setTimeout(() => {
                  console.log('Triggering upload after beforeUpload, file:', file);
                  handleUpload({
                    file: file,
                    onSuccess: (response: any) => {
                      console.log('Upload success callback:', response);
                    },
                    onError: (error: any) => {
                      console.error('Upload error callback:', error);
                    },
                  } as any);
                }, 100); // Delay a bit to ensure fileList is updated
                return false;
              }}
              onChange={(info) => {
                console.log('File list changed:', info);
                const { file, fileList: newFileList } = info;
                
                console.log('File status:', file.status);
                console.log('Has originFileObj:', !!file.originFileObj);
                
                // Update file list
                setFileList(newFileList as UploadFile[]);
                
                // If file was just added (no status or status is undefined), manually trigger upload
                const fileToUpload = file.originFileObj || (file as any);
                
                if ((file.status === undefined || !file.status) && fileToUpload) {
                  console.log('New file detected, starting upload...', file);
                  console.log('File object used:', fileToUpload);
                  // Manually call upload function
                  handleUpload({
                    file: fileToUpload,
                    onSuccess: (response: any) => {
                      console.log('Upload success callback:', response);
                    },
                    onError: (error: any) => {
                      console.error('Upload error callback:', error);
                    },
                  } as any);
                } else {
                  console.log('Upload condition not met, file status:', file.status, 'has originFileObj:', !!file.originFileObj, 'fileToUpload:', !!fileToUpload);
                }
              }}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload Image</div>
                </div>
              )}
            </Upload>
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
              Supports JPG, PNG, GIF, WEBP formats, max 5MB
            </div>
          </Form.Item>
          
          <Form.Item name="imageUrlText" label="Or Enter Image URL">
            <Input
              placeholder="Or directly enter image URL"
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

      {/* Product Detail Modal */}
      <Modal
        title="Product Details"
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
            Close
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
            Edit
          </Button>,
        ]}
        width={600}
        className="product-modal"
      >
        {detailProduct && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: 16 }}>
              <strong>Product ID: </strong>
              <span>{detailProduct.id}</span>
            </div>
            {detailProduct.imageUrl && (
              <div style={{ marginBottom: 16 }}>
                <strong>Product Image: </strong>
                <div style={{ marginTop: 8 }}>
                  <Image
                    src={detailProduct.imageUrl.startsWith('http') 
                      ? detailProduct.imageUrl 
                      : `http://localhost:3000${detailProduct.imageUrl}`}
                    alt="Product Image"
                    width={200}
                    style={{ borderRadius: 8 }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwMCIgeT0iMzEwIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                  />
                </div>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <strong>Product Name: </strong>
              <span>{detailProduct.name}</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Description: </strong>
              <div style={{ marginTop: 8, color: '#666' }}>
                {detailProduct.description || 'No description'}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Price: </strong>
              <span className="price-text" style={{ fontSize: 18, marginLeft: 8 }}>
                ${detailProduct.price.toFixed(2)}
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Stock: </strong>
              <Tag color={detailProduct.stock > 0 ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                {detailProduct.stock}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Category: </strong>
              <span style={{ marginLeft: 8 }}>
                {detailProduct.category?.name || 'Uncategorized'}
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Created At: </strong>
              <span style={{ marginLeft: 8 }}>
                {new Date(detailProduct.createdAt).toLocaleString('en-US')}
              </span>
            </div>
            <div>
              <strong>Updated At: </strong>
              <span style={{ marginLeft: 8 }}>
                {new Date(detailProduct.updatedAt).toLocaleString('en-US')}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Products;
