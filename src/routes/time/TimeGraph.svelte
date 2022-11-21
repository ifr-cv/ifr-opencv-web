<script lang="ts">
  import { getTimeWatcher } from '$lib/api/time';
  import * as echarts from 'echarts';
  import { onMount } from 'svelte';
  import { toSeries } from '$def/TimeWatcher';
  import { Smooth } from '$def/smooth';
  import { sum } from '$helpers/common';

  export let type: string;
  let auto_flush: boolean = true;

  let main: HTMLDivElement;
  let chart: echarts.ECharts;
  let option: echarts.EChartsOption;
  $: if (option && chart && !chart.isDisposed()) chart.setOption(option);

  onMount(() => {
    const timer = setInterval(() => {
      if (auto_flush) update();
    }, 300);
    chart = echarts.init(main, undefined, { renderer: 'svg' });
    return () => {
      chart.dispose();
      clearInterval(timer);
    };
  });

  let sm: Smooth = new Smooth(50);
  /**更新数据*/
  async function update() {
    const tw = await getTimeWatcher(type);
    if (!tw) return;
    const pss = toSeries(tw);
    if (pss.length <= 0) return;

    const max = Math.max(...pss.flatMap((x) => x).map((x) => x[1]));

    let all: number;
    {
      let all_: number[] = Array(pss[0].length).fill(0);
      pss.forEach((group) => {
        group.forEach((p, i) => (all_[i] += p[1]));
      });
      all_ = all_.map((x) => x / pss.length);
      all = sum(...all_);
    }

    sm.push(max);

    const series: echarts.SeriesOption[] = pss.map((ps, i) => {
      let data: echarts.SeriesOption = {
        name: `Work ${i + 1}`,
        type: 'scatter',
        emphasis: { focus: 'series' },
        // prettier-ignore
        data:ps,
        markPoint: {
          data: [
            { type: 'max', name: 'Max' },
            { type: 'min', name: 'Min' },
          ],
        },
      };
      return data;
    });

    option = {
      animation: false,
      title: {
        text: `${type} 耗时统计`,
        subtext: `获取时间: ${new Date().toLocaleString()} / 总耗时: ${all} ms`,
      },
      grid: {
        left: '3%',
        right: '7%',
        bottom: '7%',
        containLabel: true,
      },
      tooltip: {
        // trigger: 'axis',
        showDelay: 0,
        formatter: function (params: any) {
          if (params.value.length > 1) return `${params.seriesName} :<br/> ${params.value[1]} ms`;
          else return `${params.seriesName} :<br/> ${params.name}: ${params.value} ms`;
        },
        axisPointer: {
          show: true,
          type: 'cross',
          lineStyle: {
            type: 'dashed',
            width: 1,
          },
        },
      },
      toolbox: {
        feature: {
          dataZoom: {},
          brush: {
            type: ['rect', 'polygon', 'clear'],
          },
        },
      },
      brush: {},
      legend: {
        data: pss.map((_, i) => `Work ${i + 1}`),
        left: 'center',
        bottom: 10,
      },
      xAxis: [
        {
          type: 'value',
          scale: true,
          axisLabel: {
            formatter: (v: any) => `${v} ~ ${v + 1}`,
          },
          splitLine: {
            show: false,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          scale: true,
          axisLabel: {
            formatter: '{value} ms',
          },
          splitLine: {
            show: false,
          },
          max: Math.ceil(sm.get()),
        },
      ],
      series,
    };

    if (option && chart && !chart.isDisposed()) chart.setOption(option);
  }
</script>

<div class="btn-group" role="group" aria-label="Basic outlined example">
  <button
    type="button"
    class="btn btn-outline-primary"
    class:active={auto_flush}
    on:click={() => {
      auto_flush = true;
    }}
  >
    自动刷新 0.3s
  </button>
  <button
    type="button"
    class="btn btn-outline-primary"
    class:active={!auto_flush}
    on:click={() => {
      auto_flush = false;
      update();
    }}
  >
    手动刷新
  </button>
</div>
<div bind:this={main} style:height="90vh" style:width="100%" />
