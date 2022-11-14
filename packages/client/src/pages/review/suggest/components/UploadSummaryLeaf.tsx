import { useRequest } from 'umi';
import { Table } from 'antd';
import { getUploadSummary } from '../service';
import styles from '../style.less';
import type { SummaryLeaf } from '../data';
import { useDebounceEffect } from 'ahooks';
import type { CustomerType } from '@/types/common';

interface Props {
  week: string;
  customerId: number;
  customerType: CustomerType;
}

// 单个客户的12周上传情况汇总
const UploadSummaryLeaf = (props: Props) => {
  const { data, run } = useRequest(
    async (params) => {
      return await getUploadSummary(params);
    },
    {
      manual: true,
    },
  );

  useDebounceEffect(() => {
    const { week, customerId, customerType } = props;
    run({
      week,
      customerId,
      customerType,
    });
  }, [props]);

  const columns = [
    {
      title: '期数',
      dataIndex: 'week',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      render: (text: string, record: SummaryLeaf) => {
        return record.stock ? '已上传' : '未上传';
      },
    },
    {
      title: '销售',
      dataIndex: 'sale',
      render: (text: string, record: SummaryLeaf) => {
        return record.sale ? '已上传' : '未上传';
      },
    },
  ];

  return (
    <div className={styles.box}>
      <Table
        columns={columns}
        dataSource={data as SummaryLeaf[]}
        pagination={false}
        scroll={{ y: '200px' }}
      />
    </div>
  );
};

export default UploadSummaryLeaf;
