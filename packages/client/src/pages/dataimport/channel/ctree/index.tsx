import { Tree } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { useRequest } from 'umi';
import React, { useState, useMemo } from 'react';
import { getAllCustomer } from '../../../customer/list/service';
import { CustomerType } from '@/types/common';

interface Props {
  onSelect: (
    customerId: number,
    customerType: CustomerType,
    customerName: string,
    isLeaf: boolean,
  ) => void;
  /**
   * 是否可以选择父节点
   */
  isSelectParent?: boolean;
}

const CTree: React.FC<Props> = (props) => {
  const [customerId, setCustomerId] = useState<number>(0);
  const { data: allCustomerList } = useRequest(async () => {
    const res = await getAllCustomer({});
    if (res.data[0] && res.data[0].id) {
      setCustomerId(res.data[0].id);
      props.onSelect(res.data[0].id, res.data[0].customerType, res.data[0].customerName, true);
    }
    return res;
  });

  const treeData: DataNode[] = useMemo(() => {
    const result = [
      {
        title: '品牌商',
        selectable: !!props.isSelectParent,
        key: 'vendor',
        customerType: CustomerType.vendor,
        children: [],
      },
      {
        title: '代理商',
        selectable: !!props.isSelectParent,
        key: 'disty',
        customerType: CustomerType.disty,
        children: [],
      },
      {
        title: '经销商',
        selectable: !!props.isSelectParent,
        key: 'dealer',
        customerType: CustomerType.dealer,
        children: [],
      },
    ];
    if (allCustomerList && allCustomerList.length > 0) {
      allCustomerList.forEach((customer) => {
        if (customer.customerType) {
          const child = {
            title: customer.customerName,
            key: customer.id,
            customerType: customer.customerType,
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
    const a = info.node.key as number;
    const b = info.node.customerType as CustomerType;
    const c = info.node.title;
    setCustomerId(a);
    props.onSelect(a, b, c, !info.node.children);
  };

  return (
    <Tree defaultExpandAll selectedKeys={[customerId]} onSelect={onSelect} treeData={treeData} />
  );
};

export default CTree;
