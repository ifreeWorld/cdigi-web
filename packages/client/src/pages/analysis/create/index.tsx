import { Tabs, message, Tree } from 'antd';
import React, { useMemo, useState } from 'react';
import {
  FilterOutlined,
  MenuOutlined,
  PauseOutlined,
  UnderlineOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { Key } from 'rc-tree/lib/interface';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { stockHeaderMap, saleHeaderMap } from '../../../constants';
import styles from './style.less';
import OperationModal from './components/OperationModal';
import { isEmpty } from 'lodash';

interface Option {
  value: string;
  label: string;
  supportType?: DropKeyEnum[];
}

enum DropKeyEnum {
  filter = 'filter',
  column = 'column',
  row = 'row',
  value = 'value',
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

const getOptions = (map: Record<string, string>) => {
  return Object.keys(map).map((label: string) => {
    return {
      label,
      value: map[label],
    };
  });
};

const data = [
  {
    tabName: '库存',
    tabValue: 'stock',
    dragItems: getOptions(stockHeaderMap),
  },
  {
    tabName: '销售',
    tabValue: 'sale',
    dragItems: getOptions(saleHeaderMap),
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
    config: false,
    max: 1,
  },
];

const DragBox = ({
  option,
  canDrag,
  children,
}: {
  option: Option;
  canDrag: () => boolean;
  children: JSX.Element | string;
}) => {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: TYPE,
      item: option,
      canDrag,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [option, canDrag],
  );

  return (
    <div ref={drag} style={{ opacity }} data-testid="box">
      {children}
    </div>
  );
};

const DropBox = ({ onDrop, list, config }: { onDrop: any; list: Option[]; config: DropConfig }) => {
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
        {list.map((option: Option) => {
          return (
            <DragBox
              key={option.value}
              option={option}
              canDrag={() => {
                return true;
              }}
            >
              <div className={styles.dropItem}>
                <div className={styles.itemTitle}>{option.label}</div>
                {config.config && <SettingOutlined className={styles.itemIcon} />}
              </div>
            </DragBox>
          );
        })}
      </div>
    </div>
  );
};

const Channel: React.FC = () => {
  const [type, setType] = useState('stock');
  const [checkList, setCheckList] = useState<Key[]>([]);
  const [dropListMap, setDropListMap] = useState<DropMap>({} as DropMap);
  const [visible, setVisible] = useState<boolean>(false);

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
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
          {
            title: '一级分类',
            key: 'categoryFirstName',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
          {
            title: '二级分类',
            key: 'categorySecondName',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
          },
          {
            title: '三级分类',
            key: 'categoryThirdName',
            checkable: true,
            supportType: [DropKeyEnum.filter, DropKeyEnum.column],
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
            supportType: [DropKeyEnum.row],
          },
          {
            title: '季度',
            key: 'quarter',
            checkable: true,
            supportType: [DropKeyEnum.row],
          },
          {
            title: '月-周',
            key: 'monthWeek',
            checkable: true,
            supportType: [DropKeyEnum.row],
          },
          {
            title: '周',
            key: 'week',
            checkable: true,
            supportType: [DropKeyEnum.row],
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
            title: '客户类型',
            key: 'customerType',
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
            title: '采购客户类型',
            key: 'buyerCustomerType',
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
      resultMap[key].push(option);
    }
    setDropListMap(resultMap);
    setCheckList(resultList);
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
    // setCurrentRow({});
  };

  const handleSubmit = (values) => {
    if (!isEmpty(values)) {
      const field = Object.keys(values)[0];
      const value = values[field];
    }
  };

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
                    <div className={styles.flexColumn}>
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
                                  onOpenDetail={(option: Option) => {
                                    setVisible(true);
                                  }}
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
        <div className={styles.right}></div>
      </div>
      <OperationModal visible={visible} onCancel={handleCancel} onSubmit={handleSubmit} />
    </PageContainer>
  );
};

export default Channel;
