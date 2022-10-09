import { useRequest } from 'umi';
import { Table } from 'antd';
import { getUploadSummary } from '../service';
import styles from '../style.less';
import type { Summary } from '../data.d';

const UploadSummary = () => {
  const { data } = useRequest(async (params) => {
    return await getUploadSummary(params);
  });

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
      title: '未上传',
      dataIndex: 'noUpload',
      render: (text: string, record: Summary) => {
        return record.noUpload.join('、');
      },
    },
  ];

  return (
    <div className={styles.box}>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default UploadSummary;
