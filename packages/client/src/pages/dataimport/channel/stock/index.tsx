import { message, Modal, DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import { useRequest } from 'umi';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import moment from 'moment';
import type { StockItem } from './data';
import type { TablePagination } from '../../../../types/common';
import { getStock, deleteStock } from './service';

const format = 'YYYY-MM-DD';
const customWeekStartEndFormat: DatePickerProps['format'] = (value) =>
  `${moment(value).startOf('week').format(format)} ~ ${moment(value).endOf('week').format(format)}`;

const Stock = ({ customerId }: { customerId: number }) => {
  const actionRef = useRef<ActionType>();
  const searchRef = useRef();

  const { run } = useRequest(
    async (params) => {
      return await getStock(params);
    },
    {
      manual: true,
    },
  );

  const { run: postRun } = useRequest(
    async (method: 'add' | 'remove', params) => {
      if (method === 'remove') {
        await deleteStock(params);
        message.success('删除成功');
      }
      // if (method === 'add') {
      //   await addTag(params);
      //   message.success('添加成功');
      // }
    },
    {
      manual: true,
      onSuccess: () => {
        // setVisible(false);
        actionRef.current?.reloadAndRest?.();
      },
      onError: (error, [method]) => {
        message.error(`调用${method}接口失败`);
        console.log(error);
      },
    },
  );

  const columns: ProColumns<StockItem>[] = [
    {
      dataIndex: 'id',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '周',
      dataIndex: 'week',
      colSize: 2,
      renderFormItem: (item, { type, fieldProps }, form) => {
        if (type === 'form') {
          return null;
        }
        return <DatePicker {...fieldProps} picker="week" format={customWeekStartEndFormat} />;
      },
      // hideInSearch: true,
    },
    {
      title: '周开始时间',
      dataIndex: 'weekStartDate',
      hideInSearch: true,
    },
    {
      title: '周结束时间',
      dataIndex: 'weekEndDate',
      hideInSearch: true,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      hideInSearch: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      hideInSearch: true,
    },
    {
      title: '总额',
      dataIndex: 'total',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      hideInForm: true,
      render: (_, record) => [
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: '删除',
              content: '确定删除吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: () => {
                postRun('remove', {
                  ids: [record.id],
                });
              },
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  useEffect(() => {
    actionRef.current?.reset?.();
    searchRef.current?.submit?.();
  }, [customerId]);

  const dataFormat = (date: moment.Moment, dateString: string) => {
    const weekStr = date.format('gggg-w');
    const year = Number(weekStr.split('-')[0]);
    const week = Number(weekStr.split('-')[1]);
    const startDate = date.startOf('week').format(format);
    const endDate = date.endOf('week').format(format);
    console.log(date, dateString);
    console.log('year', year);
    console.log('week', week);
    console.log('weekStr', weekStr);
    console.log('startDate', startDate);
    console.log('endDate', endDate);

    console.log(moment().year(year).week(week).startOf('week').format('YYYY-MM-DD'));
    console.log(moment().year(year).week(week).endOf('week').format('YYYY-MM-DD'));
    return weekStr;
  };

  return (
    <ProTable<StockItem, TablePagination>
      actionRef={actionRef}
      formRef={searchRef}
      rowKey="id"
      search={{
        labelWidth: 120,
      }}
      dateFormatter={dataFormat}
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
        });
        return {
          data: res.list,
          total: res.total,
          success: true,
        };
      }}
      columns={columns}
    />
  );
};

export default Stock;
