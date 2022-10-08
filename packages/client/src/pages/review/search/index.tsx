import { DatePicker } from 'antd';
import { useRequest } from 'umi';
import { useState, useRef, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import moment, { Moment } from 'moment';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import CTree from '@/pages/dataimport/channel/ctree';
import { CustomerType } from '@/types/common';
import { getAllSale } from './service';
import { getAllValues } from '@/pages/analysis/create/service';
import { Select } from 'sensd';
import { WeekRangePicker } from '@/components/WeekPicker';

const Search = () => {
  const [customerId, setCustomerId] = useState<number>(0);
  const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.vendor);
  const actionRef = useRef<ActionType>();
  const searchRef = useRef();

  const onSelect = (a: number, b: CustomerType) => {
    setCustomerId(a);
    setCustomerType(b);
  };

  const { run } = useRequest(
    async (params) => {
      return await getAllSale(params);
    },
    {
      manual: true,
    },
  );

  const { data: allProductNames } = useRequest(async () => {
    return await getAllValues('productName', 'sale');
  });

  useEffect(() => {
    actionRef.current?.reset?.();
    searchRef.current?.submit?.();
  }, [customerId]);

  const columns: ProColumns[] = [
    {
      title: '时间',
      dataIndex: 'week',
      colSize: 2,
      renderFormItem: (item, { type, fieldProps }) => {
        if (type === 'form') {
          return null;
        }

        return <WeekRangePicker {...fieldProps} />;
      },
    },
    {
      title: '产品型号',
      dataIndex: 'productNames',
      renderFormItem: (item, { type }) => {
        if (type === 'form') {
          return null;
        }
        return (
          <Select
            mode="multiple"
            showDropdownSearch
            showCheckAll
            showConfirm
            selectorSimpleMode
            options={allProductNames}
            selectAllText="全选"
          />
        );
      },
    },
  ];

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.leftTree}>
          <div className={styles.treeTitle}>用户选择</div>
          <CTree onSelect={onSelect} />
        </div>
        <div className={styles.right}>
          <ProTable
            actionRef={actionRef}
            rowKey="id"
            formRef={searchRef}
            search={{
              labelWidth: 'auto',
            }}
            request={async (params) => {
              if (!customerId) {
                return {
                  data: [],
                  total: 0,
                  success: true,
                };
              }
              const res = await run({
                ...params,
                customerId,
                startWeek: week[0],
                endWeek,
                customerId,
                productNames,
              });
              return {
                data: res,
                total: res.length,
                success: true,
              };
            }}
            columns={columns}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default Search;
