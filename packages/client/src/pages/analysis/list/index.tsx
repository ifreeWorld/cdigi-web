import { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useRequest, Link } from 'umi';
import type { TablePagination } from '../../../types/common';
import type { AnalysisListItem } from './data';
import { getTableData } from './service';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export const analysisTypeMap = {
  '1': '自定义分析',
  '2': '自动分析',
};

export const sourceMap = {
  '1': '自主创建',
  '2': '周报',
  '3': '月报',
};

const TableList = () => {
  const actionRef = useRef<ActionType>();
  const { run } = useRequest(
    async (params) => {
      return await getTableData(params);
    },
    {
      manual: true,
    },
  );

  const columns: ProColumns<AnalysisListItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '分析类型',
      dataIndex: 'analysisType',
      valueType: 'select',
      valueEnum: analysisTypeMap,
    },
    {
      title: '来源',
      dataIndex: 'source',
      valueType: 'select',
      valueEnum: sourceMap,
    },
  ];

  return (
    <PageContainer>
      <ProTable<AnalysisListItem, TablePagination>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={() => [
          <Link key="create" to="/analysis/create" target="_blank">
            <Button type="primary">
              <PlusOutlined /> 创建自定义分析
            </Button>
          </Link>,
        ]}
        search={{
          labelWidth: 120,
        }}
        request={async (params) => {
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
    </PageContainer>
  );
};

export default TableList;
