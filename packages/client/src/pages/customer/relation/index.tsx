import { useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import img from './user.png';
import G6 from '@antv/g6';
import styles from './style.less';
import { getRelations } from './service';
import { customerTypeMap } from '../../../constants';

const Relations = () => {
  const ref = useRef<HTMLDivElement>(null);

  const getData = async () => {
    const res = await getRelations();
    return res.data;
  };

  const init = async () => {
    const container = ref.current;
    if (!ref.current) {
      return;
    }
    const data = await getData();
    const tooltip = new G6.Tooltip({
      offsetX: 10,
      offsetY: 10,
      // the types of items that allow the tooltip show up
      // 允许出现 tooltip 的 item 类型
      itemTypes: ['node', 'edge'],
      // custom the tooltip's content
      // 自定义 tooltip 内容
      getContent: (e) => {
        const cfg = e?.item?.getModel() || {};
        const outDiv = document.createElement('div');
        outDiv.style.width = 'fit-content';
        //outDiv.style.padding = '0px 0px 20px 0px';
        outDiv.innerHTML = `
          <h3>客户名称: ${cfg.label}</h3>
          <h3>渠道层级: ${customerTypeMap[cfg.customerType] || ''}</h3>`;
        return outDiv;
      },
    });
    const backgroundArr = ['#F99898', '#90D9D9', '#82DC89'];
    data.nodes.forEach((item) => {
      item.style = {
        fill: backgroundArr[item.customerType - 1],
        stroke: backgroundArr[item.customerType - 1],
      };
      item.label = item.customerName;
      item.id = item.id + '';
    });
    data.edges.forEach((item, index) => {
      item.id = `link_${index}`;
      item.source = item.source + '';
      item.target = item.target + '';
    });
    const width = container.scrollWidth;
    const height = container.scrollHeight || 500;
    const graph = new G6.Graph({
      container: ref.current.id,
      width,
      height,
      // linkCenter: true,
      plugins: [tooltip],
      fitCenter: true,
      modes: {
        default: ['brush-select', 'drag-node', 'drag-canvas', 'zoom-canvas'],
        altSelect: [
          {
            type: 'brush-select',
            trigger: 'drag',
          },
          'drag-node',
        ],
      },
      defaultNode: {
        /* node type */
        type: 'circle',
        /* node size */
        size: [60],
        /* style for the keyShape */
        style: {
          fill: '#F99898',
          stroke: '#F99898',
        },
        labelCfg: {
          /* label's position, options: center, top, bottom, left, right */
          position: 'bottom',
          /* label's offset to the keyShape, 4 by default */
          //   offset: 12,
          /* label's style */
          style: {
            fontSize: 16,
            fill: '#000',
            fontWeight: 500,
          },
        },
        /* configurations for four linkpoints */
        linkPoints: {
          // top: true,
          // right: true,
          // bottom: true,
          // left: true,
          /* linkPoints' size, 8 by default */
          //   size: 5,
          /* linkPoints' style */
          //   fill: '#ccc',
          //   stroke: '#333',
          //   lineWidth: 2,
        },
        /* icon configuration */
        icon: {
          /* whether show the icon, false by default */
          show: true,
          /* icon's img address, string type */
          img: img,
          /* icon's size, 20 * 20 by default: */
          width: 40,
          height: 40,
        },
      },
      /* styles for different states, there are built-in styles for states: active, inactive, selected, highlight, disable */
      nodeStateStyles: {
        // node style of active state
        active: {
          fillOpacity: 0.8,
        },
        // node style of selected state
        selected: {
          fillOpacity: 0.8,
        },
      },
      // renderer: 'svg',
      defaultEdge: {
        style: {
          endArrow: {
            path: G6.Arrow.triangle(),
            fill: '#F6BD16',
            // d: 50,
          },
          stroke: '#F6BD16',
          lineAppendWidth: 3,
        },
      },
    });
    graph.data(data);
    graph.render();

    graph.on('node:mouseenter', (e) => {
      graph.setItemState(e.item || '', 'active', true);
    });
    graph.on('node:mouseleave', (e) => {
      graph.setItemState(e.item || '', 'active', false);
    });
    graph.on('edge:mouseenter', (e) => {
      graph.setItemState(e.item || '', 'active', true);
    });
    graph.on('edge:mouseleave', (e) => {
      graph.setItemState(e.item || '', 'active', false);
    });

    if (typeof window !== 'undefined')
      window.onresize = () => {
        if (!graph || graph.get('destroyed')) return;
        if (!container || !container.scrollWidth || !container.scrollHeight) return;
        graph.changeSize(container.scrollWidth, container.scrollHeight);
      };
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <PageContainer className={styles.pageContainer}>
      <div id="customer-relation" style={{ width: '100%', height: '100%' }} ref={ref} />
    </PageContainer>
  );
};

export default Relations;
