import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Tag, Modal } from 'antd';
import { useRequest } from 'umi';
import React, { useState, useRef, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProductListItem } from './data';
import type { TablePagination } from '../../../types/common';
import OperationModal from './components/OperationModal';
import { getAllTag } from '../../customer/tag/service';
import { getProduct, getAllProduct, addProduct, updateProduct, deleteProduct } from './service';

const TableList: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<Partial<ProductListItem> | undefined>();

  const { data: tagRes } = useRequest(async () => {
    return await getAllTag();
  });

  const { run: runAll, data: allProductList } = useRequest(async () => {
    return await getAllProduct({});
  });

  const { run } = useRequest(
    async (params) => {
      return await getProduct(params);
    },
    {
      manual: true,
    },
  );
  const { run: postRun } = useRequest(
    async (method: 'add' | 'update' | 'remove', params) => {
      if (method === 'remove') {
        await deleteProduct(params);
        message.success('删除成功');
      }
      if (method === 'update') {
        await updateProduct(params);
        message.success('更新成功');
      }
      if (method === 'add') {
        await addProduct(params);
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

  const columns: ProColumns<ProductListItem>[] = [
    {
      title: '产品型号',
      dataIndex: 'productName',
    },
    {
      title: '品牌',
      dataIndex: 'vendorName',
    },
    {
      title: '一级分类',
      dataIndex: 'categoryFirstName',
    },
    {
      title: '二级分类',
      dataIndex: 'categorySecondName',
    },
    {
      title: '三级分类',
      dataIndex: 'categoryThirdName',
    },
    {
      title: '标签',
      dataIndex: 'tag',
      hideInSearch: true,
      render: (text, record: ProductListItem) => {
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
              productName: record.productName,
              vendorName: record.vendorName,
              categoryFirstName: record.categoryFirstName,
              categorySecondName: record.categorySecondName,
              categoryThirdName: record.categoryThirdName,
              tags: record.tags,
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

  const handleSubmit = (values: Partial<ProductListItem>) => {
    const method = values?.id ? 'update' : 'add';
    postRun(method, values);
  };

  const allProductNames = useMemo(() => {
    if (allProductList) {
      return allProductList.map((item) => {
        return item.productName;
      });
    }
    return [];
  }, [allProductList]);

  return (
    <PageContainer>
      <ProTable<ProductListItem, TablePagination>
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
          runAll();
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
        visible={visible}
        current={currentRow}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        allTagList={tagRes}
        allProductNames={allProductNames}
      />
    </PageContainer>
  );
};

export default TableList;
