<script lang="ts">
  import type { PlanInfo, TaskDescriptions } from '$def/Task';
  import { toObj } from '$helpers/common';
  import * as echarts from 'echarts';
  import { onMount } from 'svelte';
  import SquareBox from './SquareBox.svelte';

  export let plan: PlanInfo;
  export let descriptions: TaskDescriptions;

  let nodes: echarts.GraphSeriesOption['data'];
  let links: echarts.GraphSeriesOption['links'];
  $: updateGraph(descriptions);

  let main: HTMLDivElement;
  let chart: echarts.ECharts;
  let option: echarts.EChartsOption;
  $: if (option && chart && !chart.isDisposed()) chart.setOption(option);

  onMount(() => {
    chart = echarts.init(main, undefined, { renderer: 'svg' });
    return () => chart.dispose();
  });

  /**
   * 更新图形
   */
  function updateGraph(descriptions: TaskDescriptions) {
    const zoom = 100;
    nodes = [];
    links = [];
    /**组别 - 任务名*/ let groups = toObj(
      Object.values(descriptions).map((x) => x.group),
      () => [] as string[],
    );
    for (const tname in descriptions) groups[descriptions[tname].group].push(tname);

    let y = 0; //垂直序号
    for (const group in groups) {
      y += zoom;
      groups[group].forEach((name, i) => {
        if (nodes)
          nodes.push({
            name,
            x: i * zoom,
            y,
            itemStyle: {
              //   color: plan.tasks[name]?.enable ? 'var(--bs-primary)' : 'var(--bs-secondary)',
              opacity: plan.tasks[name]?.enable ? 1 : 0.3,
            },
          });
      });
    }

    /**频道 - 输入/输出/数据类型*/ let channel = toObj(
      Object.values(plan.tasks)
        .filter((t) => t.enable)
        .flatMap((t) => Object.values(t.io))
        .map((io) => io.channel),
      () => ({ in: [] as string[], out: [] as string[], type: new Set<string>() }),
    );
    for (const tname in plan.tasks) {
      if (!plan.tasks[tname].enable) continue;
      for (const ioname in plan.tasks[tname].io) {
        const iod = descriptions[tname].io[ioname];
        const ioc = plan.tasks[tname].io[ioname].channel;
        channel[ioc][iod.isIn ? 'in' : 'out'].push(tname);
        channel[ioc].type.add(iod.type);
      }
    }
    for (const cname in channel) {
      const typeCnt = channel[cname].type.size;
      for (const cin in channel[cname].in) {
        for (const cout in channel[cname].out) {
          links.push({
            source: channel[cname].out[cout],
            target: channel[cname].in[cin],
            lineStyle: {
              color: typeCnt == 1 ? '#000' : 'red',
            },
          });
        }
      }
    }

    option = {
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      legend: { textStyle: { color: '#FFF' } },
      series: [
        {
          type: 'graph',
          layout: 'none',
          symbolSize: 50,
          //   roam: true,
          label: { show: true },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: { fontSize: 20 },
          data: nodes,
          links: links,
          lineStyle: {
            opacity: 0.9,
            width: 2,
            curveness: 0.1,
          },
          //   symbol: 'rect',
          itemStyle: {
            borderWidth: 0,
          },
        },
      ],
    };
  }
</script>

<!-- <svg
  on:click
  class="bd-placeholder-img card-img-top"
  width="100%"
  height="225"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="Placeholder: Thumbnail"
  preserveAspectRatio="xMidYMid slice"
  focusable="false"
>
  <title>流程{plan.name}</title>
  <rect width="100%" height="100%" fill="#55595c" />
  <text x="50%" y="50%" fill="#eceeef" dy=".3em"> Thumbnail </text>
</svg> -->
<!-- 为 ECharts 准备一个定义了宽高的 DOM -->
<SquareBox><div bind:this={main} /></SquareBox>

<style>
  div {
    height: 100%;
    width: 100%;
  }
</style>
