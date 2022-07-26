import { Tabs, message, Tree, Button } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  FilterOutlined,
  MenuOutlined,
  PauseOutlined,
  UnderlineOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { Key } from 'rc-tree/lib/interface';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import type { DragSourceMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from './style.less';
import OperationModal from './components/OperationModal';
import { getAllValues, getPivotData, add } from './service';
import { isEmpty } from 'lodash';
import type { PivotData } from './data.d';
import { DropKeyEnum } from './data.d';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import LineChart from './components/LineChart';
import TableChart from './components/TableChart';

interface Option {
  value: string;
  label: string;
  supportType?: DropKeyEnum[];
}

interface DropConfig {
  key: DropKeyEnum;
  label: string;
  icon: JSX.Element;
  config: boolean;
  max: number;
}

interface DropMapItem extends Option {
  /**
   * 指标的具体配置
   */
  detail?: any;
}

type DropMap = Record<DropKeyEnum, DropMapItem[]>;

interface TreeData {
  title: string;
  key: string;
  supportType?: DropKeyEnum[];
  checkable?: boolean;
  children?: TreeData[];
}

const { TabPane } = Tabs;
const TYPE = 'customize';

const data = [
  {
    tabName: '库存',
    tabValue: 'stock',
  },
  {
    tabName: '销售',
    tabValue: 'sale',
  },
];

const dropConfigs: DropConfig[] = [
  {
    key: DropKeyEnum.filter,
    label: '筛选器',
    icon: <FilterOutlined className={styles.icon} />,
    config: true,
    max: 5,
  },
  {
    key: DropKeyEnum.column,
    label: '列',
    icon: <PauseOutlined className={styles.icon} />,
    config: true,
    max: 1,
  },
  {
    key: DropKeyEnum.row,
    label: '行',
    icon: <MenuOutlined className={styles.icon} />,
    config: true,
    max: 1,
  },
  {
    key: DropKeyEnum.value,
    label: '值',
    icon: <UnderlineOutlined className={styles.icon} />,
    config: true,
    max: 1,
  },
];

const DragBox = ({
  option,
  canDrag,
  children,
  end,
}: {
  option: Option;
  canDrag: () => boolean;
  children: JSX.Element | string;
  end?: (item: Option, monitor: DragSourceMonitor<Option, unknown>) => void;
}) => {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: TYPE,
      item: option,
      canDrag,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
      end,
    }),
    [option, canDrag],
  );

  return (
    <div ref={drag} style={{ opacity }} data-testid="box">
      {children}
    </div>
  );
};

const DropBox = ({
  onDrop,
  list,
  config,
  onOpenDetail,
  onDragOut,
}: {
  onDrop: any;
  list: DropMapItem[];
  config: DropConfig;
  onOpenDetail: (option: Option, key: DropKeyEnum) => void;
  onDragOut: (key: DropKeyEnum, value: Option['value']) => void;
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(
    {
      accept: TYPE,
      drop: onDrop,
      canDrop: (item) => {
        // 每一个只能拖拽一个
        return list.length < config.max && item?.supportType?.includes(config.key);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [list, onDrop],
  );

  const isActive = isOver && canDrop;
  let backgroundColor = '#fff';
  if (isActive) {
    backgroundColor = 'darkgreen';
  } else if (canDrop) {
    backgroundColor = 'darkkhaki';
  }

  return (
    <div ref={drop} data-testid="dustbin">
      <div className={styles.drop} style={{ backgroundColor }}>
        {list.map((option: DropMapItem) => {
          return (
            <DragBox
              key={option.value}
              option={option}
              canDrag={() => {
                return true;
              }}
              end={(item, monitor) => {
                const { value } = item;
                const didDrop = monitor.didDrop();
                if (!didDrop) {
                  onDragOut(config.key, value);
                }
              }}
            >
              <div className={styles.dropItem}>
                <div className={styles.itemTitle}>{option.label}</div>
                {config.config && (
                  <SettingOutlined
                    className={classNames(
                      styles.itemIcon,
                      !isEmpty(option.detail) ? styles.highlight : '',
                    )}
                    onClick={() => {
                      onOpenDetail(option, config.key);
                    }}
                  />
                )}
              </div>
            </DragBox>
          );
        })}
      </div>
    </div>
  );
};

const Channel: React.FC = () => {
  const [type, setType] = useState<PivotData['type']>('stock');
  const [checkList, setCheckList] = useState<Key[]>([]);
  const [dropListMap, setDropListMap] = useState<DropMap>({} as DropMap);
  const [modalOptions, setModalOptions] = useState<any[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [detailConfig, setDetailConfig] = useState<{ key: DropKeyEnum; field: string }>();
  const [pivotData, setPivotData] = useState<{
    list: any[];
    row: string;
    rowLabel: string;
    column: string;
    columnLabel: string;
    value: string;
    valueLabel: string;
    filterLabel: string;
    sort: string[];
  }>({
    list: [],
    row: '',
    rowLabel: '',
    column: '',
    columnLabel: '',
    value: '',
    valueLabel: '',
    filterLabel: '',
    sort: [],
  });

  const treeData: TreeData[] = useMemo(() => {
    const prefix = type === 'stock' ? '库存' : '销售';
    const result = [
      {
        title: '产品',
        key: 'product',
        checkable: false,
        children: [
          {
            title: '产品型号',
            key: 'productName',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.row, DropKeyEnum.column],
          },
          {
            title: '一级分类',
            key: 'categoryFirstName',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.row, DropKeyEnum.column],
          },
          {
            title: '二级分类',
            key: 'categorySecondName',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.row, DropKeyEnum.column],
          },
          {
            title: '三级分类',
            key: 'categoryThirdName',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.row, DropKeyEnum.column],
          },
        ],
      },
      {
        title: '时间',
        key: 'time',
        checkable: false,
        children: [
          {
            title: '年',
            key: 'year',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.row, DropKeyEnum.column],
          },
          {
            title: '季度',
            key: 'quarter',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.row, DropKeyEnum.column],
          },
          {
            title: '月',
            key: 'month',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.row, DropKeyEnum.column],
          },
          {
            title: '月-周',
            key: 'monthAndWeek',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.row, DropKeyEnum.column],
          },
          {
            title: '周',
            key: 'weekalone',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.row, DropKeyEnum.column],
          },
        ],
      },
      {
        title: '客户',
        key: 'customer',
        checkable: false,
        children: [
          {
            title: '客户名称',
            key: 'customerName',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
          {
            title: '渠道层级',
            key: 'customerType',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
          {
            title: '国家',
            key: 'country',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
          {
            title: '区域',
            key: 'region',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
        ],
      },
      {
        title: '门店',
        key: 'store',
        checkable: false,
        children: [
          {
            title: '门店名称',
            key: 'storeName',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
        ],
      },
      {
        title: '值',
        key: 'vvvv',
        checkable: false,
        children: [
          {
            title: `${prefix}数量`,
            key: 'quantity',
            checkable: true,
            supportType: [DropKeyEnum.value],
          },
          {
            title: `${prefix}总额`,
            key: 'total',
            checkable: true,
            supportType: [DropKeyEnum.value],
          },
          {
            title: `${prefix}价格`,
            key: 'price',
            checkable: true,
            supportType: [DropKeyEnum.value],
          },
        ],
      },
    ];
    if (type === 'sale') {
      result.push({
        title: '采购客户',
        key: 'buyer',
        checkable: false,
        children: [
          {
            title: '采购客户名称',
            key: 'buyerName',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
          {
            title: '采购渠道层级',
            key: 'buyerCustomerType',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
          {
            title: '采购客户的国家',
            key: 'buyerCountry',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
          {
            title: '采购客户的区域',
            key: 'buyerRegion',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
        ],
      });
    }
    return result;
  }, [type]);

  const onChangeTab = (activeKey: string) => {
    setType(activeKey);
    setCheckList([]);
    setDropListMap({} as DropMap);
  };

  const onCheck = (list: Key[]) => {
    if (list.length > checkList.length) {
      message.warning('请拖拽到下方的区域');
      return;
    }
    setCheckList(list);
    const newMap = {} as DropMap;
    Object.keys(dropListMap).forEach((key: DropKeyEnum) => {
      const options = dropListMap[key];
      newMap[key] = options.filter((op) => list.includes(op.value)) || [];
    });
    setDropListMap(newMap);
  };

  const onDrop = (option: Option, key: DropKeyEnum) => {
    const resultMap = {
      ...dropListMap,
    };
    const resultList = [...checkList];
    // 如果已经有了，就移除掉原来的
    if (checkList.includes(option.value)) {
      Object.keys(dropListMap).forEach((dropKey: DropKeyEnum) => {
        const options = dropListMap[dropKey];
        const index = options.findIndex((op) => option.value === op.value);

        let temp = option;
        if (index !== -1) {
          temp = options.splice(index, 1)[0];
          resultMap[dropKey] = options;
          if (!resultMap[key]) {
            resultMap[key] = [];
          }
          resultMap[key].push(temp);
        }
      });
    } else {
      resultList.push(option.value);
      if (!resultMap[key]) {
        resultMap[key] = [];
      }
      // 值默认给求和
      let temp: DropMapItem = {
        ...option,
      };
      if (key === DropKeyEnum.value) {
        temp.detail = 'sum';
      }
      resultMap[key].push(temp);
    }
    setDropListMap(resultMap);
    setCheckList(resultList);
  };

  const onDragOut = (k: DropKeyEnum, value: string) => {
    const resultMap = {
      ...dropListMap,
    };
    resultMap[k] = resultMap[k].filter((item) => item.value !== value);
    setDropListMap(resultMap);
    setCheckList(checkList.filter((item) => item !== value));
  };

  const titleRender = (nodeData: TreeData) => {
    if (nodeData.checkable) {
      const option = {
        label: nodeData.title,
        value: nodeData.key,
        supportType: nodeData.supportType,
      };
      return (
        <DragBox
          option={option}
          canDrag={() => {
            return !checkList.includes(option.value);
          }}
        >
          {option.label}
        </DragBox>
      );
    } else {
      return <div>{nodeData.title}</div>;
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = (values: any) => {
    if (!isEmpty(values) && !isEmpty(detailConfig)) {
      const field = Object.keys(values)[0];
      const value = values[field];
      const key = detailConfig.key;
      const resultMap = {
        ...dropListMap,
      };
      const arr = resultMap[key];
      resultMap[key] = arr.map((item) => {
        if (item.value === field) {
          item.detail = value;
        }
        return item;
      });
      setDropListMap(resultMap);
    }
    setVisible(false);
  };

  const clientData = useMemo(() => {
    const result: PivotData = {
      type,
      filter:
        dropListMap?.filter?.map((item) => {
          return {
            field: item.value,
            op: 'in',
            value: item.detail,
          };
        }) || [],
      row: {
        field: dropListMap?.row?.[0]?.value,
        filter: {
          field: dropListMap?.row?.[0]?.value,
          op: 'in',
          value: dropListMap?.row?.[0]?.detail,
        },
      },
      column: {
        field: dropListMap?.column?.[0]?.value,
        filter: {
          field: dropListMap?.column?.[0]?.value,
          op: 'in',
          value: dropListMap?.column?.[0]?.detail,
        },
      },
      value: {
        field: dropListMap?.value?.[0]?.value,
        aggregator: dropListMap?.value?.[0]?.detail,
      },
    };
    return result;
  }, [dropListMap, type]);

  const currentDetail = useMemo(() => {
    if (!detailConfig || !dropListMap) {
      return;
    }
    const { key, field } = detailConfig;
    const arr = dropListMap[key] || [];
    const obj = arr.find((item) => item.value === field);
    return {
      [field]: obj?.detail,
    };
  }, [dropListMap, detailConfig]);

  const getData = async () => {
    const res = await getPivotData(clientData);
    setPivotData({
      ...res.data,
      rowLabel: dropListMap.row?.[0]?.label || '',
      columnLabel: dropListMap.column?.[0]?.label || '',
      valueLabel: dropListMap.value?.[0]?.label || '',
      filterLabel: dropListMap.filter?.map((item) => item.label).join('、') || '',
    });
  };

  useEffect(() => {
    const { row, column, value } = clientData;
    if (!value.field && !row.field && !column.field) {
      return;
    }
    if (!value.field) {
      message.warning('请选择值');
      return;
    }
    if (!value.aggregator) {
      message.warning('请选择值的聚合');
      return;
    }
    if (!row.field) {
      message.warning('请选择行');
      return;
    }
    if (!column.field) {
      message.warning('请选择列');
      return;
    }
    getData();
  }, [clientData]);

  return (
    <PageContainer className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.leftTree}>
          <DndProvider backend={HTML5Backend}>
            <Tabs
              activeKey={type}
              defaultActiveKey="stock"
              destroyInactiveTabPane
              onChange={onChangeTab}
            >
              {data.map((item) => {
                return (
                  <TabPane tab={item.tabName} key={item.tabValue}>
                    <div className={styles.tabItem}>
                      <div className={styles.drags}>
                        <Tree
                          selectable={false}
                          defaultExpandAll
                          checkedKeys={checkList}
                          treeData={treeData}
                          checkable={true}
                          onCheck={onCheck}
                          titleRender={titleRender}
                        />
                      </div>
                      <div className={styles.drops}>
                        <div className={styles.flexRow}>
                          {dropConfigs.map((config) => {
                            const key = config.key;
                            const current = dropListMap[key] || [];
                            return (
                              <div key={key} className={styles.item}>
                                <div className={styles.flex}>
                                  {config.icon}
                                  <div className={styles.title}>{config.label}</div>
                                </div>
                                <DropBox
                                  list={current}
                                  config={config}
                                  onDrop={(option: Option) => {
                                    onDrop(option, key);
                                  }}
                                  onOpenDetail={async (option: Option, key: DropKeyEnum) => {
                                    const res = await getAllValues(option.value, type);
                                    setModalOptions(res.data);
                                    setDetailConfig({
                                      key,
                                      field: option.value,
                                    });
                                    setVisible(true);
                                  }}
                                  onDragOut={onDragOut}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </TabPane>
                );
              })}
            </Tabs>
          </DndProvider>
        </div>
        <div className={styles.right}>
          <div className={styles.top}>
            <ProForm
              initialValues={{}}
              onFinish={async (values) => {
                if (
                  isEmpty(dropListMap.column) ||
                  isEmpty(dropListMap.row) ||
                  isEmpty(dropListMap.value)
                ) {
                  message.warning('行、列、值不能为空，请先选择');
                  return;
                }
                if (isEmpty(clientData.value?.aggregator)) {
                  message.warning('请先选择值的聚合类型');
                  return;
                }
                const res = await add({
                  customizeName: values.customizeName,
                  desc: values.desc,
                  pivot: clientData,
                });
                if (res.code === 0) {
                  message.success('创建成功');
                  setTimeout(() => {
                    history.push('/analysis/list');
                  }, 1500);
                }
              }}
              submitter={{
                render: () => {
                  return [
                    <Button
                      htmlType="button"
                      onClick={() => {
                        setCheckList([]);
                        setDropListMap({} as DropMap);
                        setModalOptions([]);
                        setVisible(false);
                        setDetailConfig(undefined);
                        setPivotData({
                          list: [],
                          row: '',
                          rowLabel: '',
                          column: '',
                          columnLabel: '',
                          value: '',
                          valueLabel: '',
                          filterLabel: '',
                          sort: [],
                        });
                      }}
                      key="clear"
                    >
                      清空
                    </Button>,
                    // <Button
                    //   htmlType="button"
                    //   onClick={getData}
                    //   key="test"
                    // >
                    //   测试
                    // </Button>,
                    <Button htmlType="submit" type="primary" key="create">
                      创建自定义分析
                    </Button>,
                  ];
                },
              }}
            >
              <>
                <ProFormText
                  name="customizeName"
                  label="名称"
                  placeholder="请输入名称"
                  rules={[
                    {
                      required: true,
                      message: '请输入名称!',
                    },
                  ]}
                />
                <ProFormText name="desc" label="描述" placeholder="请输入名称" />
              </>
            </ProForm>
          </div>
          <div className={styles.middle}>
            <LineChart
              data={pivotData.list}
              xField={pivotData.row}
              yField={pivotData.value}
              seriesField={pivotData.column}
              xFieldLabel={pivotData.rowLabel}
              yFieldLabel={pivotData.valueLabel}
              seriesFieldLabel={pivotData.columnLabel}
              filterLabel={pivotData.filterLabel}
              sort={pivotData.sort}
            />
          </div>
          <div className={styles.bottom}>
            <TableChart
              data={pivotData.list}
              xField={pivotData.row}
              yField={pivotData.value}
              seriesField={pivotData.column}
              xFieldLabel={pivotData.rowLabel}
              yFieldLabel={pivotData.valueLabel}
              seriesFieldLabel={pivotData.columnLabel}
              filterLabel={pivotData.filterLabel}
              sort={pivotData.sort}
            />
          </div>
        </div>
      </div>
      <OperationModal
        visible={visible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        detailConfig={detailConfig}
        modalOptions={modalOptions}
        current={currentDetail}
      />
    </PageContainer>
  );
};

export default Channel;
