import { Line } from '@ant-design/charts';
import styles from '../style.less';

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

const LineChart = ({
  data,
  xField,
  yField,
  seriesField,
  xFieldLabel,
  yFieldLabel,
  seriesFieldLabel,
  filterLabel,
}: Props) => {
  const result: any[] = [];
  data.forEach((item) => {
    for (const key in item) {
      if (key !== xField) {
        const obj = {
          [xField]: item[xField],
          [yField]: item[key],
          [seriesField]: key,
        };
        result.push(obj);
      }
    }
  });

  const config = {
    data: result,
    xField,
    yField,
    seriesField,
  };

  const title = (
    <div className={styles.title}>
      分析图表
      <span className={styles.parameter}>
        {`相关参数：X轴(${xFieldLabel})，Y轴(${yFieldLabel})，曲线分组(${seriesFieldLabel})，筛选(${filterLabel})`}
      </span>
    </div>
  );

  let line;
  if (xField && yField && seriesField) {
    line = <Line {...config} />;
  }

  return (
    <div className={styles.lineChart}>
      {title}
      {line}
    </div>
  );
};

export default LineChart;
