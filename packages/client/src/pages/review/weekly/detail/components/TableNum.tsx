import { Table } from 'antd';
import type { WeeklyDetailData } from '../../data.d';

interface Props {
  data: WeeklyDetailData['saleNumArr'] | WeeklyDetailData['stockNumArr'];

  type: 'sale' | 'stock';
}

const TableNum = (props: Props) => {
  const item = props.data && props.data.length ? props.data[0] : {};
  const columns = [
    {
      dataIndex: 'productName',
      title: '产品型号',
    },
  ];
  for (const key in item) {
    if (key !== 'productName') {
      columns.push({
        dataIndex: key,
        title: key,
      });
    }
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
export default TableNum;
