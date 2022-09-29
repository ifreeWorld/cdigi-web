import styles from '../style.less';
import { Table } from 'antd';

interface Props {
  data: any[];
  xField: string;
  yField: string;
  seriesField: string;
  xFieldLabel: string;
  yFieldLabel: string;
  seriesFieldLabel: string;
  filterLabel: string;
}

const TableChart = ({
  data,
  xField,
  yField,
  seriesField,
  xFieldLabel,
  yFieldLabel,
  seriesFieldLabel,
  filterLabel,
}: Props) => {
  const title = (
    <div className={styles.title}>
      分析表格
      <span className={styles.parameter}>
        {`相关参数：X轴(${xFieldLabel})，Y轴(${yFieldLabel})，曲线分组(${seriesFieldLabel})，筛选(${filterLabel})`}
      </span>
    </div>
  );
  let table;
  if (xField && yField && seriesField) {
    const columns = [
      {
        dataIndex: xField,
        title: xFieldLabel,
      },
    ];
    if (data && data.length > 0) {
      const item = data[0];
      for (const key in item) {
        if (key !== xField) {
          const obj = {
            dataIndex: key,
            title: key,
          };
          columns.push(obj);
        }
      }
    }
    table = <Table dataSource={data} columns={columns} scroll={{ x: 'max-content' }} />;
  }

  return (
    <div className={styles.lineChart}>
      {title}
      {table}
    </div>
  );
};

export default TableChart;
