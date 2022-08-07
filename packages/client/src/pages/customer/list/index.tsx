import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Tag, Modal } from 'antd';
import { useRequest } from 'umi';
import React, { useState, useRef, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { CustomerListItem } from './data';
import { customerTypeMap } from '../../../common';
import type { TablePagination } from '../../../types/common';
import OperationModal from './components/OperationModal';
import { getAllTag } from '../tag/service';
import { getCustomer, addCustomer, updateCustomer, deleteCustomer } from './service';

const TableList: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<Partial<CustomerListItem> | undefined>();

  const { data: tagRes } = useRequest(() => {
    return getAllTag();
  });

  const { data: customerRes, run } = useRequest(
    async (params) => {
      return await getCustomer(params);
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

  const columns: ProColumns<CustomerListItem>[] = [
    {
      title: '用户名称',
      dataIndex: 'customerName',
    },
    {
      title: '用户类型',
      dataIndex: 'customerType',
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
            {tags.map((tag) => (
              <Tag key={tag.id} color={tag.tagColor}>
                {tag.tagName}
              </Tag>
            ))}
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
          key="edit"
          onClick={() => {
            setVisible(true);
            setCurrentRow({
              id: record.id,
              customerName: record.customerName,
              customerType: record.customerType,
              country: record.country,
              region: record.region,
              email: record.email,
              tags: record.tags,
            });
          }}
        >
          编辑
        </a>,
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

  const handleCancel = () => {
    setVisible(false);
    setCurrentRow({});
  };

  const handleSubmit = (values: Partial<CustomerListItem>) => {
    const method = values?.id ? 'update' : 'add';
    postRun(method, values);
  };

  const allCustomerNames = useMemo(() => {
    if (customerRes?.list) {
      return customerRes?.list.map((item) => {
        return item.customerName;
      });
    }
    return [];
  }, [customerRes?.list]);

  return (
    <PageContainer>
      <ProTable<CustomerListItem, TablePagination>
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
        allTagList={tagRes}
        allCustomerNames={allCustomerNames}
      />
    </PageContainer>
  );
};

export default TableList;
