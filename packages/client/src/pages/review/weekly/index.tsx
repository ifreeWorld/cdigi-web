import { PageContainer } from '@ant-design/pro-layout';
import ProForm, { ProFormSelect, QueryFilter, ModalForm, ProFormText } from '@ant-design/pro-form';
import { Select } from 'sensd';
import { Button, message } from 'antd';
import moment from 'moment';
import { ProFormWeekPicker } from '@/components/WeekPicker';
import UploadSummary from '../suggest/components/UploadSummary';
import styles from './style.less';
import { dateFormat, weekdayOptions, weekdayMap } from '@/constants';
import { useEffect, useMemo, useState } from 'react';
import {
  getReportList,
  addReport,
  deleteReport,
  setWeeklyGenerateDay,
  getWeeklyGenerateDay,
} from './service';
import { useRequest } from 'umi';
import { getAllValues } from '@/pages/analysis/create/service';

const Weekly = () => {
  const cur = moment();
  const [week, setWeek] = useState<string>(cur.format('gggg-ww'));
  const [visible, setVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);

  const { run: runList, data: weeklyData } = useRequest(
    async (params) => {
      return await getReportList(params);
    },
    {
      manual: true,
    },
  );

  const { run: runWeeklyGenerateDay, data: weeklyGenerateDay } = useRequest(
    async () => {
      return await getWeeklyGenerateDay();
    },
    {
      manual: true,
    },
  );

  const { run: runProductName, data: productNameList } = useRequest(
    async () => {
      return await getAllValues('productName', 'sale');
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    runWeeklyGenerateDay();
    runProductName();
    runList({
      date: week,
      reportType: 1,
    });
  }, []);

  const esgDate = useMemo(() => {
    if (!weeklyGenerateDay) {
      return;
    }
    const weekday = cur.isoWeekday();
    const nextWeekDay = Number(weeklyGenerateDay);
    let diff = nextWeekDay - weekday;
    if (diff <= 0) {
      diff += 7;
    }
    return cur.clone().add(diff, 'days').format(dateFormat);
  }, [weeklyGenerateDay]);

  const add = () => {
    setAddVisible(true);
  };

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.title}>周报切换</div>
        <QueryFilter<{
          week: string;
        }>
          onFinish={async (values) => {
            setWeek(values.week);
            runList({
              date: values.week,
              reportType: 1,
            });
          }}
          submitter={{
            render: (props) => {
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
            width="200px"
            dateFormatter={1}
            allowClear={false}
            transform={(value: string) => {
              const date = moment(value);
              const week = date.format('gggg-ww');
              const startDate = date.startOf('week').format(dateFormat);
              const endDate = date.endOf('week').format(dateFormat);
              return {
                week,
                weekStartDate: startDate,
                weekEndDate: endDate,
              };
            }}
          />
        </QueryFilter>
      </div>
      <div className={styles.container}>
        <div className={styles.title}>周报设置</div>
        <div>
          <span>
            <span>每周生成时间：</span>
            <span>{weekdayMap[weeklyGenerateDay]}</span>
          </span>
          <span style={{ margin: '0 50px' }}>
            <span>下次的报告预计生成时间：</span>
            <span>{esgDate}</span>
          </span>
          <Button type="primary" onClick={() => setVisible(true)}>
            修改
          </Button>
        </div>
        <ModalForm
          visible={visible}
          title="周报设置"
          width={640}
          onFinish={async (values) => {
            setVisible(false);
            await setWeeklyGenerateDay(values.weeklyGenerateDay);
            runWeeklyGenerateDay();
          }}
          initialValues={{
            weeklyGenerateDay,
            esgDate,
          }}
          modalProps={{
            onCancel: () => setVisible(false),
            destroyOnClose: true,
          }}
        >
          <>
            <ProFormSelect
              options={weekdayOptions}
              label="每周生成时间"
              name="weeklyGenerateDay"
              allowClear={false}
              rules={[{ required: true, message: '请选择' }]}
            />
          </>
        </ModalForm>
      </div>
      <div className={styles.container}>
        <div className={styles.title}>数据上传情况</div>
        <UploadSummary week={week} />
      </div>
      <div className={styles.container}>
        <div className={styles.title}>
          周报列表
          <div className={styles.floatRight}>
            <Button onClick={add} type="primary">
              添加报告
            </Button>
          </div>
        </div>
        <div className={styles.reportList}>
          {weeklyData?.map((item, index) => {
            return (
              <div className={styles.reportItem}>
                <div className={styles.row}>
                  <div className={styles.left}>报告名称：</div>
                  <div className={styles.right}>{item.reportName}</div>
                  <div className={styles.absolute}>
                    <span
                      className={styles.tag}
                    >{`本期报告时间：${item.startDate} 至 ${item.endDate}`}</span>
                    <span className={styles.tag}>{`报告期数：${item.date}`}</span>
                  </div>
                </div>
                <div className={styles.row} style={{ paddingRight: '135px' }}>
                  <div className={styles.left}>产品型号：</div>
                  <div className={styles.right}>{item.productNames}</div>
                  <div className={styles.absolute}>
                    <Button type="primary" style={{ marginRight: '4px' }} onClick={() => {}}>
                      详情
                    </Button>
                    <Button
                      type="primary"
                      onClick={async () => {
                        const res = await deleteReport({
                          reportName: item.reportName,
                        });
                        if (res.data) {
                          message.success('删除成功');
                        }
                        runList({
                          date: week,
                          reportType: 1,
                        });
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.left}>销售汇总：</div>
                  <div className={styles.right}>{0}</div>
                </div>
                <div className={styles.row}>
                  <div className={styles.left}>库存汇总：</div>
                  <div className={styles.right}>{0}</div>
                </div>
              </div>
            );
          })}
          {!weeklyData || (weeklyData.length === 0 && <div>无数据</div>)}
        </div>
        <ModalForm
          visible={addVisible}
          title="添加"
          width={640}
          onFinish={async (values) => {
            setAddVisible(false);
            const res = await addReport({
              ...values,
              productNames: values.productNames.join(';'),
              reportType: 1,
              date: week,
            });
            if (res.code === 0) {
              message.success('创建成功');
            }
            runList({
              date: week,
              reportType: 1,
            });
          }}
          initialValues={{}}
          modalProps={{
            onCancel: () => setAddVisible(false),
            destroyOnClose: true,
          }}
        >
          <>
            <ProFormText
              name="reportName"
              label="周报名称"
              placeholder="请输入"
              rules={[{ required: true, message: '请输入' }]}
            />
            <ProForm.Item
              name="productNames"
              label="产品型号"
              rules={[{ required: true, message: '请选择' }]}
            >
              <Select
                mode="multiple"
                showDropdownSearch
                showCheckAll
                showConfirm
                selectorSimpleMode
                options={productNameList}
                selectAllText="全选"
              />
            </ProForm.Item>
          </>
        </ModalForm>
      </div>
    </PageContainer>
  );
};

export default Weekly;
