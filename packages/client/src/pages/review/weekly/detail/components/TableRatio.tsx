import { formatNumber, formatPerfect } from '@/utils';
import { Table } from 'antd';
import type { ReportNum, WeeklyDetailData } from '../../data.d';

interface Props {
  data: WeeklyDetailData['saleRatioArr'] | WeeklyDetailData['stockRatioArr'];

  type: 'sale' | 'stock';
}

const TableRatio = (props: Props) => {
  const columns = [
    {
      dataIndex: 'productName',
      title: '产品型号',
    },
    {
      dataIndex: 'ringRatio',
      title: '环比',
      render: (text: ReportNum) => {
        return formatPerfect(text);
      },
    },
    {
      dataIndex: 'sameRatio',
      title: '同比',
      render: (text: ReportNum) => {
        return formatPerfect(text);
      },
    },
  ];
  if (props.type === 'sale') {
    columns.push({
      dataIndex: 'avgRatio',
      title: '平均比',
      render: (text: ReportNum) => {
        return formatPerfect(text);
      },
    });
  } else if (props.type === 'stock') {
    columns.push({
      dataIndex: 'turn',
      title: '库存销售天数',
      render: (text: ReportNum) => {
        return formatNumber(text);
      },
    });
  }
  return (
    <Table
      columns={columns}
      dataSource={props.data}
      scroll={{ x: 'max-content' }}
      pagination={false}
    />
  );
};
export default TableRatio;
