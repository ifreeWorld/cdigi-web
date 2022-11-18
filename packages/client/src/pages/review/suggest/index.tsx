import { useEffect, useMemo, useState } from 'react';
import ProForm, {
  ProFormDependency,
  ProFormSelect,
  ProFormSwitch,
  ProFormDigit,
  QueryFilter,
} from '@ant-design/pro-form';
import { Button } from 'antd';
import { Select as SensdSelect } from 'sensd';
import moment from 'moment';
import { useRequest } from 'umi';
import { CustomerType } from '@/types/common';
import { ProFormWeekPicker } from '@/components/WeekPicker';
import CTree from '@/pages/dataimport/channel/ctree';
import { PageContainer } from '@ant-design/pro-layout';
import UploadSummary from './components/UploadSummary';
import { dateFormat } from '@/constants';
import styles from './style.less';
import UploadSummaryLeaf from './components/UploadSummaryLeaf';
import { getAllProduct } from '@/pages/dataimport/product/service';
import { getAllCustomer } from '@/pages/customer/list/service';
import { exportSuggestReport, getSuggestConfig, saveSuggestConfig } from './service';
import { useDebounceEffect } from 'ahooks';
import { cloneDeep, isEmpty } from 'lodash';

const defaultValues = {
  monthCount: 3,
  expectSafeStockPeriod: 1,
  calcWeekCount: 12,
  minSafeStock: 0,
  storeSwitch: true,
  storeCalcWeekCount: 4,
  storeCoefficient: 1,
  storeSafeSwitch: true,
  storeBeforeWeekCount: 1,
  storeMinSafeStock: 0,
};

const Suggest = () => {
  const cur = moment();
  const [customerId, setCustomerId] = useState<number>(0);
  const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.vendor);
  const [isLeaf, setIsLeaf] = useState<boolean>(false);
  const [week, setWeek] = useState<string>(cur.format('gggg-ww'));
  const onSelect = (a: number, b: CustomerType, c: string, d: boolean) => {
    setCustomerId(a);
    setCustomerType(b);
    setIsLeaf(d);
  };

  const { data: suggestConfig, loading } = useRequest(async () => {
    return await getSuggestConfig();
  });

  const { data: allProductList } = useRequest(async () => {
    return await getAllProduct({});
  });

  const { data: allCustomerList, run: runCustomer } = useRequest(
    async (params) => {
      return await getAllCustomer(params);
    },
    {
      manual: true,
    },
  );

  const productOptions = useMemo(() => {
    return allProductList?.map((item) => {
      return {
        label: item.productName,
        value: item.productName,
      };
    });
  }, [allProductList]);

  const customerOptions = useMemo(() => {
    return allCustomerList?.map((item) => {
      return {
        label: item.customerName,
        value: item.id,
      };
    });
  }, [allCustomerList]);

  useDebounceEffect(() => {
    runCustomer({
      customerType: customerType,
    });
  }, [customerType]);

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
              onValuesChange={async (values) => {
                setWeek(values.week);
              }}
              span={24}
              submitter={{
                render: () => {
                  return [];
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
          {isLeaf ? (
            <UploadSummaryLeaf week={week} customerId={customerId} customerType={customerType} />
          ) : (
            <UploadSummary week={week} />
          )}
          <div className={styles.box}>
            <div className={styles.title}>推荐订单</div>
            {!loading && (
              <ProForm
                initialValues={isEmpty(suggestConfig) ? defaultValues : suggestConfig}
                layout="horizontal"
                onFinish={async (values) => {
                  const temp = cloneDeep(values);
                  delete temp.customerIds;
                  const res = await saveSuggestConfig(temp);
                  if (res.data) {
                    const params = {
                      week,
                      customerIds: isLeaf ? [customerId] : values.customerIds,
                    };
                    await exportSuggestReport(params);
                  }
                }}
                submitter={{
                  render: () => {
                    return [
                      <Button htmlType="submit" type="primary" key="save">
                        保存并下载报告
                      </Button>,
                    ];
                  },
                }}
              >
                <>
                  {!isLeaf && (
                    <>
                      <div className={styles.subTitle}>客户选择:</div>
                      <div className={styles.subContent}>
                        <ProForm.Item
                          name="customerIds"
                          label="客户"
                          rules={[
                            {
                              required: true,
                              message: '请选择',
                            },
                          ]}
                        >
                          <SensdSelect
                            mode="multiple"
                            showDropdownSearch
                            showCheckAll
                            showConfirm
                            selectorSimpleMode
                            options={customerOptions}
                            selectAllText="全选"
                          />
                        </ProForm.Item>
                      </div>
                    </>
                  )}
                  <div className={styles.subTitle}>产品型号设置：</div>
                  <div className={styles.subContent}>
                    <ProFormSelect
                      style={{ width: '108px' }}
                      name="monthCount"
                      label="过去一段时间库存或销售&gt;0的机型"
                      rules={[
                        {
                          required: true,
                          message: '请选择',
                        },
                      ]}
                      options={[
                        { label: '一个季度', value: 3 },
                        { label: '半年', value: 6 },
                        { label: '一年', value: 12 },
                      ]}
                    />
                    <ProForm.Item name="addProduct" label="添加的产品型号">
                      <SensdSelect
                        mode="multiple"
                        showDropdownSearch
                        showCheckAll
                        showConfirm
                        selectorSimpleMode
                        options={productOptions}
                        selectAllText="全选"
                      />
                    </ProForm.Item>
                    <ProForm.Item name="removeProduct" label="剔除的产品型号">
                      <SensdSelect
                        mode="multiple"
                        showDropdownSearch
                        showCheckAll
                        showConfirm
                        selectorSimpleMode
                        options={productOptions}
                        selectAllText="全选"
                      />
                    </ProForm.Item>
                  </div>
                  <div className={styles.subTitle}>计算公式参数设置:</div>
                  <div className={styles.subContent}>
                    <ProForm.Item>
                      <div>
                        计算公式：(推荐订单数量 = 期望安全库存周数 * 周均销量 - 现有库存 -
                        未入库库存)
                      </div>
                    </ProForm.Item>
                    <ProFormDigit
                      name="expectSafeStockPeriod"
                      label="期望安全库存周数"
                      rules={[
                        {
                          required: true,
                          message: '请填写',
                        },
                      ]}
                    />
                    <ProFormDigit
                      name="calcWeekCount"
                      label="平均销量的周数"
                      rules={[
                        {
                          required: true,
                          message: '请填写',
                        },
                      ]}
                    />
                    <ProFormDigit
                      name="minSafeStock"
                      label="最小安全库存(推荐订单会保证最小安全库存)"
                      rules={[
                        {
                          required: true,
                          message: '请填写',
                        },
                      ]}
                    />
                    {customerType === CustomerType.dealer && (
                      <>
                        <ProFormSwitch name="storeSwitch" label="开启门店推荐订单" />
                        <ProFormDependency name={['storeSwitch']}>
                          {({ storeSwitch }) => {
                            return storeSwitch ? (
                              <div className={styles.subContent}>
                                <ProForm.Item>
                                  <div>计算公式：(门店的推荐订单数量 = 周均销量 * 系数)</div>
                                </ProForm.Item>
                                <ProFormDigit
                                  name="storeCalcWeekCount"
                                  label="平均销量的周数"
                                  rules={[
                                    {
                                      required: true,
                                      message: '请填写',
                                    },
                                  ]}
                                />
                                <ProFormDigit
                                  style={{ marginBottom: 0 }}
                                  name="storeCoefficient"
                                  label="系数"
                                  rules={[
                                    {
                                      required: true,
                                      message: '请填写',
                                    },
                                  ]}
                                />
                                <ProFormSwitch
                                  name="storeSafeSwitch"
                                  label="开启后自动检索 N 周断货的库存，并推荐补货"
                                />
                                <ProFormDependency name={['storeSafeSwitch']}>
                                  {({ storeSafeSwitch }) => {
                                    return storeSafeSwitch ? (
                                      <>
                                        <ProFormDigit
                                          name="storeBeforeWeekCount"
                                          label="N"
                                          rules={[
                                            {
                                              required: true,
                                              message: '请填写',
                                            },
                                          ]}
                                        />
                                        <ProFormDigit
                                          name="storeMinSafeStock"
                                          label="最小安全库存(推荐订单会保证最小安全库存)"
                                          rules={[
                                            {
                                              required: true,
                                              message: '请填写',
                                            },
                                          ]}
                                        />
                                      </>
                                    ) : null;
                                  }}
                                </ProFormDependency>
                              </div>
                            ) : null;
                          }}
                        </ProFormDependency>
                      </>
                    )}
                  </div>
                </>
              </ProForm>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Suggest;
