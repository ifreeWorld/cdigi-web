import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import { useRequest } from 'umi';
import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { CustomerTag } from './data';
import { customerTypeMap } from '../../../common';
import type { TablePagination } from '../../../common/data';
import OperationModal from './components/OperationModal';
import { getTag, addTag, updateTag, deleteTag } from './service';

const TableList: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<Partial<CustomerTag> | undefined>();

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
      onSuccess: (result) => {
        mutate(result);
      },
      onError: (error, [method]) => {
        message.error(`调用${method}接口失败`);
        console.log(error);
      },
    },
  );

  const columns: ProColumns<CustomerTag>[] = [
    {
      title: '标签名称',
      dataIndex: 'tagName',
    },
    {
      title: '标签颜色',
      dataIndex: 'tagColor',
      hideInSearch: true,
    },
    {
      title: '标签类型',
      dataIndex: 'tagType',
      valueType: 'select',
      valueEnum: customerTypeMap,
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
        <a
          key="config"
          onClick={() => {
            Modal.confirm({
              title: '删除任务',
              content: '确定删除该任务吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: () => {
                postRun('remove', [record.id]);
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

  return (
    <PageContainer>
      <ProTable<CustomerTag, TablePagination>
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
        request={getTag}
        columns={columns}
      />
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
