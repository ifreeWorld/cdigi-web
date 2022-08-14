import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Modal, Tag } from 'antd';
import { useRequest } from 'umi';
import React, { useState, useRef, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { CustomerTag } from './data';
import type { TablePagination } from '../../../types/common';
import OperationModal from './components/OperationModal';
import { getTag, addTag, updateTag, deleteTag } from './service';

const TableList: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<Partial<CustomerTag> | undefined>();

  const { data: tagRes, run } = useRequest(
    async (params) => {
      return await getTag(params);
    },
    {
      manual: true,
    },
  );

  const { run: postRun } = useRequest(
    async (method: 'add' | 'update' | 'remove', params) => {
      if (method === 'remove') {
        await deleteTag(params);
        message.success('删除成功');
      }
      if (method === 'update') {
        await updateTag(params);
        message.success('更新成功');
      }
      if (method === 'add') {
        await addTag(params);
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

  const columns: ProColumns<CustomerTag>[] = [
    {
      dataIndex: 'id',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '标签名称',
      dataIndex: 'tagName',
    },
    {
      title: '标签颜色',
      dataIndex: 'tagColor',
      hideInSearch: true,
      render: (text, record) => <Tag color={record.tagColor}>{record.tagName}</Tag>,
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
              tagName: record.tagName,
              tagColor: record.tagColor,
              // @ts-ignore
              customerType: String(record.customerType),
            });
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            if (record.customers.length > 0) {
              const name = record.customers.map((item) => item.customerName).join('、');
              // TODO products
              message.warning(
                `${record.tagName}这个标签已经绑定了${name}，如需删除，请先删除绑定关系`,
                3,
              );
              return;
            }
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

  const handleSubmit = (values: Partial<CustomerTag>) => {
    const method = values?.id ? 'update' : 'add';
    postRun(method, values);
  };

  const allTagNames = useMemo(() => {
    if (tagRes?.list) {
      return tagRes?.list.map((item) => {
        return item.tagName;
      });
    }
    return [];
  }, [tagRes?.list]);

  return (
    <PageContainer>
      <ProTable<CustomerTag, TablePagination>
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
        allTagNames={allTagNames}
      />
    </PageContainer>
  );
};

export default TableList;
