import CTree from '@/pages/dataimport/channel/ctree';
import { CustomerType } from '@/types/common';
import { PageContainer } from '@ant-design/pro-layout';
import { useState } from 'react';
import { useLocation } from 'umi';
import { useDebounceEffect } from 'ahooks';
import styles from './style.less';
import { getReportDetail } from '../service';

export default () => {
  const location: any = useLocation();
  const [customerId, setCustomerId] = useState<number>(0);
  const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.vendor);
  const [isLeaf, setIsLeaf] = useState<boolean>(false);

  const onSelect = (a: number, b: CustomerType, c: boolean) => {
    setCustomerId(a);
    setCustomerType(b);
    setIsLeaf(c);
  };

  const getData = async () => {
    const { query = {} } = location;
    const { date, productNames } = query;
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
    console.log(res);
  };

  useDebounceEffect(() => {
    getData();
  }, [location, customerId, customerType, isLeaf]);
  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.leftTree}>
          <div className={styles.treeTitle}>用户选择</div>
          <CTree onSelect={onSelect} />
        </div>
        <div className={styles.right}></div>
      </div>
    </PageContainer>
  );
};
