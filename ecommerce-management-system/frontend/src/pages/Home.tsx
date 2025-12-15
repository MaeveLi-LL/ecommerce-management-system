import { useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Skeleton, Space, Statistic, Typography } from 'antd';
import { Pie, Column } from '@ant-design/plots';
import { AppstoreOutlined, ShoppingOutlined } from '@ant-design/icons';
import api from '../utils/api';
import './Home.css';

const Home = () => {
  const [productTotal, setProductTotal] = useState<number>(0);
  const [categoryTotal, setCategoryTotal] = useState<number>(0);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [productRes, categoryRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      const productList = Array.isArray(productRes.data) ? productRes.data : [];
      const categoryList = Array.isArray(categoryRes.data) ? categoryRes.data : [];

      setProducts(productList);
      setCategories(categoryList);
      setProductTotal(productList.length);
      setCategoryTotal(categoryList.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categories) {
      if (typeof c?.id === 'number') map.set(c.id, c.name ?? `Category #${c.id}`);
    }
    return map;
  }, [categories]);

  const productsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const name =
        p?.categoryId == null
          ? 'Uncategorized'
          : categoryNameById.get(p.categoryId) ?? 'Uncategorized';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [products, categoryNameById]);

  const last7DaysNewProducts = useMemo(() => {
    const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const toDayKey = (d: Date) =>
      `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

    const today = new Date();
    const days: { date: string; value: number }[] = [];
    const index = new Map<string, number>();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toDayKey(d);
      index.set(key, days.length);
      days.push({ date: key, value: 0 });
    }

    for (const p of products) {
      const createdAt = p?.createdAt ? new Date(p.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) continue;
      const key = toDayKey(createdAt);
      const idx = index.get(key);
      if (idx !== undefined) days[idx].value += 1;
    }

    return days;
  }, [products]);

  const pieConfig = useMemo(
    () => ({
      data: productsByCategory,
      angleField: 'value',
      colorField: 'category',
      radius: 0.9,
      innerRadius: 0.55,
      legend: { position: 'bottom' as const },
      label: { text: 'value', style: { fontWeight: 600 } },
      tooltip: { showTitle: false },
      interactions: [{ type: 'element-active' }],
    }),
    [productsByCategory],
  );

  const columnConfig = useMemo(
    () => ({
      data: last7DaysNewProducts,
      xField: 'date',
      yField: 'value',
      color: '#667eea',
      columnWidthRatio: 0.6,
      xAxis: { label: { autoHide: true } },
      yAxis: { min: 0, tickCount: 5 },
      tooltip: { showTitle: true },
      meta: { value: { alias: 'New products' } },
    }),
    [last7DaysNewProducts],
  );

  return (
    <div className="home-page">
      <div className="home-hero">
        <Space direction="vertical" size={4}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Overview
          </Typography.Title>
          <Typography.Text type="secondary">
            Key metrics and trends for your store.
          </Typography.Text>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="home-stat-card home-stat-card--primary" bordered={false}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic title="Total products" value={productTotal} prefix={<ShoppingOutlined />} />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card className="home-stat-card" bordered={false}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic title="Total categories" value={categoryTotal} prefix={<AppstoreOutlined />} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        <Col xs={24} lg={12}>
          <Card className="home-chart-card" bordered={false} title="Products by category">
            {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : <Pie {...pieConfig} />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="home-chart-card" bordered={false} title="New products (last 7 days)">
            {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : <Column {...columnConfig} />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;


