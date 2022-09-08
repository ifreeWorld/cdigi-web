import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Tag, Modal } from 'antd';
import { useRequest } from 'umi';
import React, { useState, useRef, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { CustomerListItem } from './data';
import { customerTypeMap } from '../../../constants';
import { CustomerType } from '../../../types/common';
import type { TablePagination } from '../../../types/common';
import OperationModal from './components/OperationModal';
import { getAllTag } from '../tag/service';
import {
  getCustomer,
  getAllCustomer,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getAllByKey,
} from './service';

const TableList: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [opType, setOpType] = useState<'add' | 'edit'>('add');
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<Partial<CustomerListItem> | undefined>();

  const { data: tagRes } = useRequest(async () => {
    return await getAllTag();
  });

  const { run: runCountry, data: allCountryList } = useRequest(
    async () => {
      return await getAllByKey({
        key: 'country',
      });
    },
    {
      manual: true,
    },
  );

  const { run: runRegion, data: allRegionList } = useRequest(
    async () => {
      return await getAllByKey({
        key: 'region',
      });
    },
    {
      manual: true,
    },
  );

  const { run: runAll, data: allCustomerList } = useRequest(
    async () => {
      return await getAllCustomer({});
    },
    {
      manual: true,
    },
  );

  const { run } = useRequest(
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
        setCurrentRow({});
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
      title: '客户名称',
      dataIndex: 'customerName',
    },
    {
      title: '客户类型',
      dataIndex: 'customerType',
      valueType: 'select',
      valueEnum: customerTypeMap,
    },
    {
      title: '国家',
      dataIndex: 'country',
      hideInSearch: true,
    },
    {
      title: '区域',
      dataIndex: 'region',
      hideInSearch: true,
    },
    {
      title: '客户邮箱',
      dataIndex: 'email',
      hideInSearch: true,
    },
    {
      title: '供应商',
      dataIndex: 'parent',
      ellipsis: true,
      render: (text, record: CustomerListItem) => {
        return record.parent.map((item) => item.customerName)?.join(',') || '';
      },
    },
    {
      title: '标签',
      dataIndex: 'tag',
      hideInSearch: true,
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
            setOpType('edit');
            setCurrentRow({
              id: record.id,
              customerName: record.customerName,
              // @ts-ignore
              customerType: String(record.customerType),
              country: record.country,
              region: record.region,
              email: record.email,
              tags: record.tags,
              parent: record.parent,
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

  const handleSubmit = (values: Partial<CustomerListItem>) => {
    const method = values?.id ? 'update' : 'add';
    postRun(method, values);
  };

  const allCustomerNames = useMemo(() => {
    if (allCustomerList) {
      return allCustomerList.map((item) => {
        return item.customerName;
      });
    }
    return [];
  }, [allCustomerList]);

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
              setOpType('add');
              setCurrentRow({
                customerType: CustomerType.vendor,
              });
            }}
          >
            <PlusOutlined /> 新建品牌商
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setVisible(true);
              setOpType('add');
              setCurrentRow({
                customerType: CustomerType.disty,
              });
            }}
          >
            <PlusOutlined /> 新建代理商
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setVisible(true);
              setOpType('add');
              setCurrentRow({
                customerType: CustomerType.dealer,
              });
            }}
          >
            <PlusOutlined /> 新建经销商
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setVisible(true);
              setOpType('add');
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params) => {
          runAll();
          runCountry();
          runRegion();
          const res = await run({
            ...params,
            parent: true,
          });
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
        allTagList={tagRes}
        allCountryList={allCountryList}
        allRegionList={allRegionList}
        allCustomerList={allCustomerList}
        allCustomerNames={allCustomerNames}
      />
    </PageContainer>
  );
};

export default TableList;
