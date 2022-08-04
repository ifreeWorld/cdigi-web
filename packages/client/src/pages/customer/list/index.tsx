import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Tag } from 'antd';
import { useRequest } from 'umi';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { CustomerListItem } from './data';
import { customerTypeMap } from '../../../common';
import type { TablePagination } from '../../../types/common';
import OperationModal from './components/OperationModal';
import { getCustomer, addCustomer, updateCustomer, deleteCustomer } from './service';

const TableList: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<Partial<CustomerListItem> | undefined>();
  const [selectedRowsState, setSelectedRows] = useState<CustomerListItem[]>([]);

  const columns: ProColumns<CustomerListItem>[] = [
    {
      title: '用户名称',
      dataIndex: 'customerName',
    },
    {
      title: '用户类型',
      dataIndex: 'desc',
      valueType: 'select',
      valueEnum: customerTypeMap,
    },
    {
      title: '国家',
      dataIndex: 'country',
    },
    {
      title: '区域',
      dataIndex: 'region',
    },
    {
      title: '用户邮箱',
      dataIndex: 'email',
    },
    {
      title: '标签',
      dataIndex: 'tag',
      render: (text, record: CustomerListItem) => {
        const { tags = [] } = record;
        return (
          <>
            {tags.map((tag) => {
              <Tag color={tag.tagColor}>{tag.tagName}</Tag>;
            })}
          </>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      hideInForm: true,
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            setVisible(true);
            setCurrentRow(record);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  const { loading, mutate } = useRequest(
    () => {
      actionRef.current?.reloadAndRest?.();
    },
    {
      manual: true,
    },
  );
  const { run: postRun } = useRequest(
    async (method: 'add' | 'update' | 'remove', params) => {
      if (method === 'remove') {
        await deleteCustomer(params);
        message.success('删除成功');
      }
      if (method === 'update') {
        await updateCustomer(params);
        message.success('更新成功');
      }
      if (method === 'add') {
        await addCustomer(params);
        message.success('添加成功');
      }
    },
    {
      manual: true,
      onSuccess: (result) => {
        mutate(result);
      },
      onError: (error, [method]) => {
        message.error(`调用${method}接口失败`);
        console.log(error);
      },
    },
  );

  const handleCancel = () => {
    setVisible(false);
    setCurrentRow({});
  };

  const handleSubmit = (values: Partial<CustomerListItem>) => {
    const method = values?.id ? 'update' : 'add';
    postRun(method, values);
  };

  return (
    <PageContainer>
      <ProTable<CustomerListItem, TablePagination>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        loading={loading}
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
        request={getCustomer}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项
            </div>
          }
        >
          <Button
            onClick={() => {
              postRun('remove', {
                ids: selectedRowsState.map((item) => {
                  return item.id;
                }),
              });
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      <OperationModal
        visible={visible}
        current={currentRow}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
};

export default TableList;
