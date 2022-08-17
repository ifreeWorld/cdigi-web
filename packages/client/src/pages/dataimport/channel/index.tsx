import { Tree, Tabs } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { useRequest } from 'umi';
import React, { useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { getAllCustomer } from '../../customer/list/service';
import Stock from './stock';
import styles from './style.less';

const { TabPane } = Tabs;

const Channel: React.FC = () => {
  const [customerId, setCustomerId] = useState<number>(0);
  const { data: allCustomerList } = useRequest(async () => {
    const res = await getAllCustomer({});
    if (res.data[0] && res.data[0].id) {
      setCustomerId(res.data[0].id);
    }
    return res;
  });

  const treeData: DataNode[] = useMemo(() => {
    const result = [
      {
        title: '品牌商',
        selectable: false,
        key: 'vendor',
        children: [],
      },
      {
        title: '代理商',
        selectable: false,
        key: 'disty',
        children: [],
      },
      {
        title: '经销商',
        selectable: false,
        key: 'dealer',
        children: [],
      },
    ];
    if (allCustomerList && allCustomerList.length > 0) {
      allCustomerList.forEach((customer) => {
        if (customer.customerType) {
          const child = {
            title: customer.customerName,
            key: customer.id,
            selectable: true,
          };
          // @ts-ignore
          result[customer.customerType - 1].children.push(child);
        }
      });
    }
    return result;
  }, [allCustomerList]);

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    setCustomerId(info.node.key as number);
  };

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.leftTree}>
          <div className={styles.treeTitle}>用户选择</div>
          <Tree
            defaultExpandAll
            selectedKeys={[customerId]}
            onSelect={onSelect}
            treeData={treeData}
          />
        </div>
        <div className={styles.right}>
          <Tabs defaultActiveKey="stock" destroyInactiveTabPane>
            <TabPane tab="库存" key="stock">
              <Stock customerId={customerId}></Stock>
            </TabPane>
            <TabPane tab="销售" key="sale">
              销售
            </TabPane>
            <TabPane tab="在途库存" key="onpassage">
              在途库存
            </TabPane>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
};

export default Channel;
