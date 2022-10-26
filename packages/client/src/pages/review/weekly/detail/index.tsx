import CTree from '@/pages/dataimport/channel/ctree';
import { CustomerType } from '@/types/common';
import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import { useLocation } from 'umi';
import { useDebounceEffect } from 'ahooks';
import { Tabs } from 'antd';
import styles from './style.less';
import { getReportDetail } from '../service';
import type { WeeklyDetailData } from '../data';
import { formatNumber, formatPerfect } from '@/utils';
import TableNum from './components/TableNum';
import TableRatio from './components/TableRatio';
const { TabPane } = Tabs;

export default () => {
  const location: any = useLocation();
  const [customerId, setCustomerId] = useState<number>(0);
  const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.vendor);
  const [customerName, setCustomerName] = useState<string>('');
  const [isLeaf, setIsLeaf] = useState<boolean>(false);
  const [detailData, setDetailData] = useState<WeeklyDetailData>();
  const { query = {} } = location;
  const { date, productNames, startDate, endDate } = query;
  const {
    curWeekSaleTotal = 0,
    curWeekSaleRingRatio = 'n/a',
    curWeekStockTotal = 0,
    curWeekStockTurn = 'n/a',
    saleNumArr = [],
    saleRatioArr = [],
    stockNumArr = [],
    stockRatioArr = [],
  } = detailData || {};

  const onSelect = (a: number, b: CustomerType, c: string, d: boolean) => {
    setCustomerId(a);
    setCustomerType(b);
    setCustomerName(c);
    setIsLeaf(d);
  };

  const getData = async () => {
    const data: any = {
      date,
      productNames,
      reportType: 1,
    };
    if (isLeaf) {
      data.customerId = customerId;
    } else {
      data.customerType = customerType;
    }
    const res = await getReportDetail(data);
    if (res.code === 0) {
      setDetailData(res.data);
    }
  };

  useDebounceEffect(() => {
    getData();
  }, [location, customerId, customerType, isLeaf]);

  return (
    <PageContainer
      className={styles.pageContainer}
      title={location?.query?.reportName || '周报详情'}
    >
      <div className={styles.container}>
        <div className={styles.leftTree}>
          <div className={styles.treeTitle}>用户选择</div>
          <CTree onSelect={onSelect} isSelectParent={true} />
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.box}>
            <div className={styles.row}>
              <div className={styles.left}>产品型号：</div>
              <div className={styles.right}>{productNames}</div>
              <div className={styles.absolute}>
                <span className={styles.tag}>{`本期报告时间：${startDate} 至 ${endDate}`}</span>
                <span className={styles.tag}>{`报告期数：${date}`}</span>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.left}>销售汇总：</div>
              <div className={styles.right}>{`${customerName}实现销售数值（${formatNumber(
                curWeekSaleTotal,
              )}），销售指标（环比）实现数值（${formatPerfect(curWeekSaleRingRatio)}）。`}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.left}>库存汇总：</div>
              <div className={styles.right}>
                {`${customerName}实现库存数值（${formatNumber(
                  curWeekStockTotal,
                )}），库存指标（库存周转天数）实现数值（${formatNumber(curWeekStockTurn)}）`}
              </div>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.title}>销售汇总</div>
            <Tabs defaultActiveKey="stock" destroyInactiveTabPane>
              <TabPane tab="销售指标" key="ratio">
                <TableRatio data={saleRatioArr} type="sale" />
              </TabPane>
              <TabPane tab="销售数量" key="num">
                <TableNum data={saleNumArr} type="sale" />
              </TabPane>
            </Tabs>
          </div>
          <div className={styles.box}>
            <div className={styles.title}>库存汇总</div>
            <Tabs defaultActiveKey="stock" destroyInactiveTabPane>
              <TabPane tab="库存指标" key="ratio">
                <TableRatio data={stockRatioArr} type="stock" />
              </TabPane>
              <TabPane tab="库存数量" key="num">
                <TableNum data={stockNumArr} type="stock" />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
