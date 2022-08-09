import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import { useRequest } from 'umi';
import React, { useState, useRef, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { StoreListItem } from './data';
import type { TablePagination } from '../../../types/common';
import OperationModal from './components/OperationModal';
import { getStore, addStore, updateStore, deleteStore } from './service';

const TableList: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<Partial<StoreListItem> | undefined>();

  const { data: storeRes, run } = useRequest(
    async (params) => {
      return await getStore(params);
    },
    {
      manual: true,
    },
  );
  const { run: postRun } = useRequest(
    async (method: 'add' | 'update' | 'remove', params) => {
      if (method === 'remove') {
        await deleteStore(params);
        message.success('删除成功');
      }
      if (method === 'update') {
        await updateStore(params);
        message.success('更新成功');
      }
      if (method === 'add') {
        await addStore(params);
        message.success('添加成功');
      }
    },
    {
      manual: true,
      onSuccess: () => {
        setVisible(false);
        actionRef.current?.reloadAndRest?.();
      },
      onError: (error, [method]) => {
        message.error(`调用${method}接口失败`);
        console.log(error);
      },
    },
  );

  const columns: ProColumns<StoreListItem>[] = [
    {
      title: '门店名称',
      dataIndex: 'storeName',
    },
    {
      title: '门店地址',
      dataIndex: 'storeAddress',
    },
    {
      title: '所属经销商',
      dataIndex: 'customer',
      hideInSearch: true,
      render: (text, record: StoreListItem) => {
        return record?.customer?.customerName || '';
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      hideInForm: true,
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setVisible(true);
            setCurrentRow({
              id: record.id,
              storeName: record.storeName,
              storeAddress: record.storeAddress,
              customer: record.customer,
            });
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            // TODO 删除需要考虑有数据的情况下就不让删除
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

  const handleCancel = () => {
    setVisible(false);
    setCurrentRow({});
  };

  const handleSubmit = (values: Partial<StoreListItem>) => {
    const method = values?.id ? 'update' : 'add';
    postRun(method, values);
  };

  const allStoreNames = useMemo(() => {
    if (storeRes?.list) {
      return storeRes?.list.map((item) => {
        return item.storeName;
      });
    }
    return [];
  }, [storeRes?.list]);

  return (
    <PageContainer>
      <ProTable<StoreListItem, TablePagination>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params) => {
          const res = await run(params);
          return {
            data: res.list,
            total: res.total,
            success: true,
          };
        }}
        columns={columns}
      />
      <OperationModal
        visible={visible}
        current={currentRow}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        allStoreNames={allStoreNames}
      />
    </PageContainer>
  );
};

export default TableList;
