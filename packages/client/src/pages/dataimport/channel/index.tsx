import { Tabs } from 'antd';
import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import Stock from './stock';
import Sale from './sale';
import Transit from './transit';
import styles from './style.less';
import { CustomerType } from '@/types/common';
import CTree from './ctree';

const { TabPane } = Tabs;

const Channel: React.FC = () => {
  const [customerId, setCustomerId] = useState<number>(0);
  const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.vendor);

  const onSelect = (a: number, b: CustomerType) => {
    setCustomerId(a);
    setCustomerType(b);
  };

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.leftTree}>
          <div className={styles.treeTitle}>用户选择</div>
          <CTree onSelect={onSelect} />
        </div>
        <div className={styles.right}>
          <Tabs defaultActiveKey="stock" destroyInactiveTabPane>
            <TabPane tab="库存" key="stock">
              <Stock customerId={customerId} customerType={customerType}></Stock>
            </TabPane>
            <TabPane tab="销售" key="sale">
              <Sale customerId={customerId} customerType={customerType}></Sale>
            </TabPane>
            <TabPane tab="在途库存" key="transit">
              <Transit customerId={customerId}></Transit>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
};

export default Channel;
