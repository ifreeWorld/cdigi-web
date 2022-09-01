import { Tabs, Checkbox } from 'antd';
import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { stockHeaderMap, saleHeaderMap } from '../../../constants';
import styles from './style.less';

const { TabPane } = Tabs;

const Channel: React.FC = () => {
  const getOptions = (map: Record<string, string>) => {
    return Object.keys(map).map((label: string) => {
      return {
        label,
        value: map[label],
      };
    });
  };

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.leftTree}>
          <Tabs defaultActiveKey="stock" destroyInactiveTabPane>
            <TabPane tab="库存" key="stock">
              <Checkbox.Group options={getOptions(stockHeaderMap)} />
            </TabPane>
            <TabPane tab="销售" key="sale">
              <Checkbox.Group options={getOptions(saleHeaderMap)} />
            </TabPane>
          </Tabs>
        </div>
        <div className={styles.right}></div>
      </div>
    </PageContainer>
  );
};

export default Channel;
