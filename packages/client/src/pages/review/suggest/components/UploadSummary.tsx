import { useRequest } from 'umi';
import { Table } from 'antd';
import { getUploadSummary } from '../service';
import styles from '../style.less';
import type { Summary } from '../data.d';
import { useEffect } from 'react';

interface Props {
  week: string;
}

// 上传汇总，品牌商、代理商、经销商
const UploadSummary = (props: Props) => {
  const { data, run } = useRequest(
    async (params) => {
      return await getUploadSummary(params);
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    run({
      week: props.week,
    });
  }, [props.week]);

  const columns = [
    {
      title: '客户',
      dataIndex: 'title',
    },
    {
      title: '库存',
      render: (text: string, record: Summary) => {
        return `${record.stockNumber}/${record.stockTotal}`;
      },
    },
    {
      title: '销售',
      render: (text: string, record: Summary) => {
        return `${record.saleNumber}/${record.saleTotal}`;
      },
    },
    {
      title: '库存未上传',
      dataIndex: 'noStockUpload',
      render: (text: string, record: Summary) => {
        return record.noStockUpload.join('、');
      },
    },
    {
      title: '销售未上传',
      dataIndex: 'noSaleUpload',
      render: (text: string, record: Summary) => {
        return record.noSaleUpload.join('、');
      },
    },
  ];

  return (
    <div className={styles.box}>
      <Table columns={columns} dataSource={data as Summary[]} pagination={false} />
    </div>
  );
};

export default UploadSummary;
