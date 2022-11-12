import { useState } from 'react';
import { QueryFilter } from '@ant-design/pro-form';
import { Button } from 'antd';
import moment from 'moment';
import { CustomerType } from '@/types/common';
import { ProFormWeekPicker } from '@/components/WeekPicker';
import CTree from '@/pages/dataimport/channel/ctree';
import { PageContainer } from '@ant-design/pro-layout';
import UploadSummary from './components/UploadSummary';
import { dateFormat } from '@/constants';
import styles from './style.less';

const Suggest = () => {
  const cur = moment();
  const [customerId, setCustomerId] = useState<number>(0);
  const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.vendor);
  const [customerName, setCustomerName] = useState<string>('');
  const [isLeaf, setIsLeaf] = useState<boolean>(false);
  const [week, setWeek] = useState<string>(cur.format('gggg-ww'));
  const onSelect = (a: number, b: CustomerType, c: string, d: boolean) => {
    setCustomerId(a);
    setCustomerType(b);
    setCustomerName(c);
    setIsLeaf(d);
  };
  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.flex}>
        <div className={styles.leftTree}>
          <div className={styles.treeTitle}>用户选择</div>
          <CTree onSelect={onSelect} isSelectParent={true} />
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.box}>
            <div className={styles.title}>时间选择</div>
            <QueryFilter<{
              week: string;
            }>
              onFinish={async (values) => {
                setWeek(values.week);
              }}
              submitter={{
                render: () => {
                  return [
                    <Button key="submit" htmlType="submit" type="primary">
                      查询
                    </Button>,
                  ];
                },
              }}
              initialValues={{ week: cur }}
            >
              <ProFormWeekPicker
                name="week"
                label="周"
                width="300px"
                dateFormatter={1}
                allowClear={false}
                transform={(value: string) => {
                  const date = moment(value);
                  const weekstr = date.format('gggg-ww');
                  const startDate = date.startOf('week').format(dateFormat);
                  const endDate = date.endOf('week').format(dateFormat);
                  return {
                    week: weekstr,
                    weekStartDate: startDate,
                    weekEndDate: endDate,
                  };
                }}
              />
            </QueryFilter>
          </div>
          <UploadSummary week="2022-10" />
        </div>
      </div>
    </PageContainer>
  );
};

export default Suggest;
