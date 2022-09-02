import { Tabs, Checkbox, Row } from 'antd';
import React, { useState } from 'react';
import {
  FilterOutlined,
  MenuOutlined,
  PauseOutlined,
  UnderlineOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { stockHeaderMap, saleHeaderMap } from '../../../constants';
import styles from './style.less';

interface Option {
  value: string;
  label: string;
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
}

type DropMap = Record<DropKeyEnum, Option[]>;

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
  },
  {
    key: DropKeyEnum.column,
    label: '列',
    icon: <PauseOutlined className={styles.icon} />,
    config: true,
  },
  {
    key: DropKeyEnum.row,
    label: '行',
    icon: <MenuOutlined className={styles.icon} />,
    config: true,
  },
  {
    key: DropKeyEnum.value,
    label: '值',
    icon: <UnderlineOutlined className={styles.icon} />,
    config: false,
  },
];

const DragBox = ({ option, checkList }: { option: Option; checkList: CheckboxValueType[] }) => {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: TYPE,
      item: option,
      canDrag: () => {
        return !checkList.includes(option.value);
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [option, checkList],
  );

  return (
    <div ref={drag} style={{ opacity }} data-testid="box">
      <Checkbox value={option.value}>{option.label}</Checkbox>
    </div>
  );
};

const DropBox = ({ onDrop, list, config }: { onDrop: any; list: Option[]; config: DropConfig }) => {
  const [{ isOver, canDrop }, drop] = useDrop(
    {
      accept: TYPE,
      drop: onDrop,
      canDrop: () => {
        // 每一个只能拖拽一个
        return list.length === 0;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [list],
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
        {list.map((item: Option) => {
          return (
            <div key={item.value} className={styles.dropItem}>
              <div className={styles.itemTitle}>{item.label}</div>
              {config.config && <SettingOutlined className={styles.itemIcon} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Channel: React.FC = () => {
  const [type, setType] = useState('stock');
  const [checkList, setCheckList] = useState<CheckboxValueType[]>([]);
  const [dropListMap, setDropListMap] = useState<DropMap>({} as DropMap);

  const onChangeTab = (activeKey: string) => {
    setType(activeKey);
    setCheckList([]);
    setDropListMap({} as DropMap);
  };

  const onChangeCheckbox = (list: CheckboxValueType[]) => {
    setCheckList(list);
    const newMap = {} as DropMap;
    Object.keys(dropListMap).forEach((key: DropKeyEnum) => {
      const options = dropListMap[key];
      newMap[key] = options.filter((op) => list.includes(op.value)) || [];
    });
    setDropListMap(newMap);
  };

  const onDrop = (option: Option, key: DropKeyEnum) => {
    const current = dropListMap[key] || [];
    current.push(option);
    setDropListMap({
      ...dropListMap,
      ...{
        [key]: current,
      },
    });
    setCheckList([...checkList, option.value]);
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
                        <Checkbox.Group value={checkList} onChange={onChangeCheckbox}>
                          {item.dragItems.map((option) => {
                            return (
                              <Row key={option.value} style={{ marginBottom: '6px' }}>
                                <DragBox option={option} checkList={checkList} />
                              </Row>
                            );
                          })}
                        </Checkbox.Group>
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
                                  onDrop={(option: Option) => {
                                    onDrop(option, key);
                                  }}
                                  list={current}
                                  config={config}
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
    </PageContainer>
  );
};

export default Channel;
