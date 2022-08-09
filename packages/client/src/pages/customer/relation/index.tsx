import { useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import img from './user.png';
import G6 from '@antv/g6';
import styles from './style.less';
import { customerTypeMap } from '../../../common';

const Relations = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (container) {
      const data = {
        nodes: [
          {
            id: '0',
            label: 'node-0',
            // x: 100,
            // y: 100,
            description: 'This is node-0.',
            subdescription: 'This is subdescription of node-0.',
            customerType: 1,
          },
          {
            id: '1',
            label: 'node-1',
            // x: 250,
            // y: 100,
            description: 'This is node-1.',
            subdescription: 'This is subdescription of node-1.',
            customerType: 2,
          },
          {
            id: '2',
            label: 'node-2',
            // x: 150,
            // y: 310,
            description: 'This is node-2.',
            subdescription: 'This is subdescription of node-2.',
            customerType: 2,
          },
          {
            id: '3',
            label: 'node-3',
            // x: 320,
            // y: 310,
            description: 'This is node-3.',
            subdescription: 'This is subdescription of node-3.',
            customerType: 3,
          },
        ],
        edges: [
          {
            id: 'e0',
            source: '0',
            target: '1',
            description: 'This is edge from node 0 to node 1.',
          },
          {
            id: 'e1',
            source: '0',
            target: '2',
            description: 'This is edge from node 0 to node 2.',
          },
          {
            id: 'e2',
            source: '0',
            target: '3',
            description: 'This is edge from node 0 to node 3.',
          },
          {
            id: 'e3',
            source: '1',
            target: '3',
            description: 'This is edge from node 0 to node 3.',
          },
        ],
      };
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
            <h3>用户名称: ${cfg.label}</h3>
            <h3>用户类型: ${customerTypeMap[cfg.customerType] || ''}</h3>`;
          return outDiv;
        },
      });
      const backgroundArr = ['#F99898', '#90D9D9', '#82DC89'];
      data.nodes.forEach((item) => {
        item.style = {
          fill: backgroundArr[item.customerType - 1],
          stroke: backgroundArr[item.customerType - 1],
        };
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
    }
  }, []);

  return (
    <PageContainer className={styles.pageContainer}>
      <div id="customer-relation" style={{ width: '100%', height: '100%' }} ref={ref} />
    </PageContainer>
  );
};

export default Relations;
