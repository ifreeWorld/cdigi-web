import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import { useRequest } from 'umi';
import React, { useState, useRef, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { ProFormSelect } from '@ant-design/pro-form';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { StoreListItem } from './data';
import type { TablePagination, Option } from '../../../types/common';
import { CustomerType } from '../../../types/common.d';
import OperationModal from './components/OperationModal';
import {
  getStore,
  getAllStore,
  addStore,
  updateStore,
  deleteStore,
  downloadTemplate,
} from './service';
import { getAllCustomer } from '../list/service';

const TableList: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [opType, setOpType] = useState<'add' | 'edit'>('add');
  const actionRef = useRef<ActionType>();
  const searchRef = useRef();
  const [currentRow, setCurrentRow] = useState<Partial<StoreListItem> | undefined>();

  const { run } = useRequest(
    async (params) => {
      return await getStore(params);
    },
    {
      manual: true,
    },
  );
  const { data: allDealers, run: runAllDealers } = useRequest<{ data: Option[] }>(async () => {
    const { data } = await getAllCustomer({
      customerType: CustomerType.dealer,
    });
    const res: Option[] = data.map((item) => {
      return {
        label: item.customerName,
        value: item.id,
      };
    });
    return {
      data: res,
    };
  });
  const { data: allStoreList, run: runAllStore } = useRequest(async () => {
    return await getAllStore();
  });
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
        setCurrentRow({});
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
      title: '区域',
      dataIndex: 'region',
    },
    {
      title: '所属经销商',
      dataIndex: 'customer',
      // TODO 设置search的render
      renderFormItem: (item, { type, fieldProps }: any) => {
        if (type === 'form') {
          return null;
        }

        return <ProFormSelect options={allDealers} {...fieldProps} />;
      },
      render: (text, record: StoreListItem) => {
        return record?.customer?.customerName || '';
      },
    },
    {
      title: '门店地址',
      dataIndex: 'storeAddress',
      hideInSearch: true,
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
            setOpType('edit');
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
    if (allStoreList) {
      return allStoreList.map((item) => {
        return item.storeName;
      });
    }
    return [];
  }, [allStoreList]);

  return (
    <PageContainer>
      <ProTable<StoreListItem, TablePagination>
        headerTitle="查询表格"
        formRef={searchRef}
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
              setOpType('add');
              setCurrentRow({
                customer: searchRef?.current?.getFieldValue?.('customer') || { id: undefined },
              });
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              // 下载
              downloadTemplate({
                fileName: 'store_template.xlsx',
              });
            }}
          >
            <DownloadOutlined /> 下载模板
          </Button>,
        ]}
        request={async (params) => {
          runAllStore();
          runAllDealers();
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
        opType={opType}
        visible={visible}
        current={currentRow}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        allStoreNames={allStoreNames}
        allDealers={allDealers}
      />
    </PageContainer>
  );
};

export default TableList;
