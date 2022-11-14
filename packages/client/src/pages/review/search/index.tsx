import { DatePicker, message } from 'antd';
import { useRequest } from 'umi';
import { useState, useRef, useEffect, useMemo } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import moment, { Moment } from 'moment';
import { isEmpty } from 'lodash';
import { PageContainer } from '@ant-design/pro-layout';
import CTree from '../../dataimport/channel/ctree';
import { CustomerType } from '../../../types/common';
import { getAllSale } from './service';
import { getAllValues } from '../../analysis/create/service';
import { Select } from 'sensd';
import { WeekRangePicker } from '../../../components/WeekPicker';
import styles from './style.less';

const Search = () => {
  const [customerId, setCustomerId] = useState<number>(0);
  const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.vendor);
  const actionRef = useRef<ActionType>();
  const searchRef = useRef();

  const onSelect = (a: number, b: CustomerType) => {
    setCustomerId(a);
    setCustomerType(b);
  };

  const { run, data: tableData } = useRequest(
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

  const lastWeek = useMemo(() => moment().subtract(1, 'weeks'), []);
  const last2Week = useMemo(() => moment().subtract(2, 'weeks'), []);

  useEffect(() => {
    actionRef.current?.reset?.();
    if (isEmpty(searchRef.current?.getFieldValue('week'))) {
      searchRef.current?.setFieldsValue?.({
        week: [last2Week, lastWeek],
      });
    }
    searchRef.current?.submit?.();
  }, [customerId]);

  useEffect(() => {}, []);

  const columns = useMemo(() => {
    const c: ProColumns[] = [
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
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        },
        hideInTable: true,
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
        hideInTable: true,
      },
      {
        title: '产品型号',
        dataIndex: 'productName',
        hideInSearch: true,
      },
    ];
    if (!tableData || tableData.length === 0) {
      return c;
    }
    const keys = Object.keys(tableData[0]);
    const etas = Object.keys(tableData[0].transit || {}) || [];
    const etaColumn: ProColumns = {
      title: '在途库存（ETA）',
      children: [],
      hideInSearch: true,
    };
    etas.forEach((eta) => {
      etaColumn.children.push({
        title: eta || '空',
        dataIndex: ['transit', eta],
        hideInSearch: true,
      });
    });
    c.push(etaColumn);
    keys.forEach((key) => {
      if (key !== 'productName' && key !== 'transit') {
        c.push({
          title: key,
          hideInSearch: true,
          children: [
            {
              title: '销量',
              dataIndex: [key, 'sale'],
              hideInSearch: true,
              sorter: (a, b) => a[key].sale - b[key].sale,
            },
            {
              title: '库存',
              dataIndex: [key, 'stock'],
              hideInSearch: true,
              sorter: (a, b) => a[key].stock - b[key].stock,
            },
          ],
        });
      }
    });
    return c;
  }, [tableData]);

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
            rowKey="productName"
            formRef={searchRef}
            search={{
              labelWidth: 'auto',
            }}
            scroll={{ x: 'max-content' }}
            pagination={false}
            request={async (params, sort) => {
              console.log(sort);
              if (!customerId) {
                return {
                  data: [],
                  total: 0,
                  success: true,
                };
              }
              if (!params.week || params.week?.length < 2) {
                return;
              }
              const res = await run({
                customerId,
                startWeek: moment(params.week[0]).format('gggg-ww'),
                endWeek: moment(params.week[1]).format('gggg-ww'),
                productNames: params.productNames,
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
