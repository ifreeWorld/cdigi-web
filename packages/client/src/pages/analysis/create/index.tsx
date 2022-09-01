import { Tabs, Checkbox, Row, Col } from 'antd';
import React, { useState } from 'react';
import { FilterOutlined, MenuOutlined, PauseOutlined, UnderlineOutlined } from '@ant-design/icons';
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

const dropItems = [
  {
    key: DropKeyEnum.filter,
    label: '筛选器',
    icon: <FilterOutlined className={styles.icon} />,
  },
  {
    key: DropKeyEnum.column,
    label: '列',
    icon: <PauseOutlined className={styles.icon} />,
  },
  {
    key: DropKeyEnum.row,
    label: '行',
    icon: <MenuOutlined className={styles.icon} />,
  },
  {
    key: DropKeyEnum.value,
    label: '值',
    icon: <UnderlineOutlined className={styles.icon} />,
  },
];

const DragBox = ({ option }: { option: Option }) => {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: TYPE,
      item: option,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [option.value],
  );

  return (
    <div ref={drag} style={{ opacity }} data-testid="box">
      <Checkbox value={option.value}>{option.label}</Checkbox>
    </div>
  );
};

const DropBox = ({ onDrop, list }: { onDrop: any; list: Option[] }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
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
  });

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
          return <div>{item.label}</div>;
        })}
      </div>
    </div>
  );
};

const Channel: React.FC = () => {
  const [type, setType] = useState('stock');
  const [checkList, setCheckList] = useState<CheckboxValueType[]>([]);
  const [dropListMap, setDropListMap] = useState<Record<DropKeyEnum, Option[]>>(
    {} as Record<DropKeyEnum, Option[]>,
  );

  const onChangeTab = (activeKey: string) => {
    setType(activeKey);
    setCheckList([]);
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
                        <Checkbox.Group
                          value={checkList}
                          onChange={(list: CheckboxValueType[]) => {
                            setCheckList(list);
                          }}
                        >
                          {item.dragItems.map((option) => {
                            return (
                              <Row key={option.value} style={{ marginBottom: '6px' }}>
                                <DragBox option={option} />
                              </Row>
                            );
                          })}
                        </Checkbox.Group>
                      </div>
                      <div className={styles.drops}>
                        <div className={styles.flexRow}>
                          {dropItems.map((item) => {
                            const key = item.key;
                            const current = dropListMap[key] || [];
                            return (
                              <div key={key} className={styles.item}>
                                <div className={styles.flex}>
                                  {item.icon}
                                  <div className={styles.title}>{item.label}</div>
                                </div>
                                <DropBox
                                  onDrop={(option: Option) => {
                                    onDrop(option, key);
                                  }}
                                  list={current}
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
