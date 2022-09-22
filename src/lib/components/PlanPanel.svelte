<script lang="ts">
  import {
    FillTaskBlank,
    GetTaskArgTypeDefault,
    planNameRegex,
    TaskArgType,
    type PlanInfo,
    type TaskDescriptions,
  } from '$def/Task';
  import { remSubObj, toObj } from '$helpers/common';
  import { onMount } from 'svelte';
  import AnyTouch from 'any-touch';
  import IconSetting from './icons/IconSetting.svelte';
  import Modal from './Modal.svelte';
  import { removePlanInfo, savePlanInfo } from '$lib/api/task';
  import { toPlanListPage, toPlanPage } from '$lib/api/paes';
  import { goto } from '$app/navigation';

  export let description: TaskDescriptions;
  export let infos: PlanInfo;
  export let oldName: string | null = null;

  /**错误通道*/ let badChannel: Set<string> = new Set();
  /**通道使用数*/ let channelUseCount: Record<string, number> = {};
  /**通道连接*/
  let channelLink: Record<
    string,
    {
      /**from, 通道输入*/ f: string;
      /**to, 通道输出 */ t: string;
      /**channels, 使用的通道*/ c: string[];
    }
  > = {};
  $: checkChannel(infos);

  /**当前鼠标所在的元素(io)*/ let nowMouseTargetIO: any | null;
  /**当前鼠标所在的频道*/ let nowMouseTargetIOChannel: string | null;
  /**当前鼠标所在的任务*/ let nowMouseTargetTask: string | null;

  /**顶层task元素的名称*/ let topTaskName: string;

  /**每个任务的额外信息*/
  const taskExtra: Record<
    string,
    {
      /**元素所在的X坐标(百分比)*/ x: number;
      /**元素所在的Y坐标(百分比)*/ y: number;
      /**元素偏移的X坐标(像素)*/ movex: number;
      /**元素偏移的Y坐标(像素)*/ movey: number;
      /**元素宽度*/ width?: number;
      /**元素高度*/ height?: number;
      /**是否处于按压状态(缩小)*/ press?: boolean;
      /**是否展开*/ show?: boolean;
      /**html对象*/ element?: HTMLElement;
      /**是否被标记(未启用)*/ marked?: boolean;
      /**是否出错(未启用)*/ error?: boolean;
      /**any-touch*/ at?: AnyTouch;
    }
  > = {};
  (() => {
    //生成每个task的基础信息
    const TaskGroup = Array.from(new Set(Object.values(description).map((x) => x.group)));
    const groupY = toObj(
      TaskGroup,
      TaskGroup.map((_, i) => ((i + 1 / TaskGroup.length) / TaskGroup.length) * 100),
    );
    const groupX = toObj(
      TaskGroup,
      TaskGroup.map(() => 0),
    );
    for (const taskname in description) {
      const group = description[taskname].group;
      taskExtra[taskname] = { x: groupX[group]++, y: groupY[group], movex: 0, movey: 0 };
    }
    for (const taskname in description)
      taskExtra[taskname].x =
        ((taskExtra[taskname].x + 0.5) / groupX[description[taskname].group]) * 100;

    //修复数据task
    for (const taskname in description) {
      infos.tasks[taskname] = FillTaskBlank(description[taskname], infos.tasks[taskname]);
    }
  })();

  onMount(() => {
    //处理拖拽及点击事件
    const ats: AnyTouch[] = [];
    for (const taskname in taskExtra) {
      const ext = taskExtra[taskname];
      ats.push((ext.at = new AnyTouch(ext.element!)));
      ext.at.on('tap', (e) => {
        if ((e.target as HTMLElement).classList.contains('task')) {
          ext.press = e.phase !== 'end';
        }
        switch (getPanelTargetType(e)) {
          case 3:
            ext.press = e.phase !== 'end';
          //eslint-disable-line no-fallthrough
          case 2:
            if (e.phase === 'end') {
              ext.show = !ext.show;
              taskExtra[taskname] = ext;
            }
            break;
        }
      });
      ext.at.on('panstart', () => {
        topTaskName = taskname;
      });
      ext.at.on('pan', (e) => {
        if (getPanelTargetType(e) > 0) {
          ext.movex += e.deltaX;
          ext.movey += e.deltaY;
          taskExtra[taskname] = ext;
        }
      });
    }
    return () => ats.forEach((at) => at.destroy());
  });

  /**
   * 处理在IO上的鼠标移动事件, 用于标记相同通道高亮
   * @param target 目标
   * @param channel 所属频道
   * @param show 是否是展示模式
   */
  function handleIOMouseMove(target: any, channel: string, show: boolean) {
    if (show) {
      nowMouseTargetIO = target;
      nowMouseTargetIOChannel = channel;
    } else if (nowMouseTargetIO == target) {
      nowMouseTargetIOChannel = null;
      nowMouseTargetIO = null;
    }
  }
  /**
   * 处理在task上的鼠标移动事件, 用于标记task连接高亮
   * @param target 目标
   * @param show 是否是展示模式
   */
  function handleTaskMouseMove(target: string, show: boolean) {
    if (show) {
      nowMouseTargetTask = target;
    } else if (nowMouseTargetTask == target) {
      nowMouseTargetTask = null;
    }
  }

  /**
   * 获取事件的目标类型
   * @param e 事件
   * @return 3: 是底层面板
   * @return 2: 是点击切换面板状态的元素
   * @return 1: 是可以拖拽的元素
   * @return 0: 是其他元素
   */
  function getPanelTargetType(e: any) {
    const ele: HTMLElement = e.target;
    if (!ele?.classList) return 0;
    if (ele.classList.contains('task')) return 3;
    for (
      let ele = e.target as HTMLElement;
      ele?.classList && !ele.classList.contains('task');
      ele = ele.parentElement!
    ) {
      if (ele.classList.contains('click-switch')) return 2;
    }
    for (
      let ele = e.target as HTMLElement;
      ele?.classList && !ele.classList.contains('task');
      ele = ele.parentElement!
    ) {
      if (ele.classList.contains('click-move')) return 1;
    }
    return 0;
  }

  /**
   * 检查频道状态
   *
   * 统计错误的频道及每个频道使用数量
   * @param infos
   */
  function checkChannel(infos: PlanInfo) {
    let channelType: Record<string, Set<string>> = {}; //通道类型 channel_name - types
    let channelLink0: Record<string, { in: string[]; out: string[] }> = {}; //通道连接 channel_name - in_task/out_task
    channelUseCount = {};
    badChannel.clear();
    channelLink = {};
    Object.keys(infos.tasks)
      .filter((name) => infos.tasks[name].enable)
      .forEach((taskname) => {
        const t = infos.tasks[taskname]; //任务数据
        const d: Record<string, string> = {}; //IO类型 ioname - iotype
        Object.keys(description[taskname].io).forEach(
          (ioname) => (d[ioname] = description[taskname].io[ioname].type),
        );

        Object.keys(t.io).forEach((ioname) => {
          const channelname = t.io[ioname].channel; //IO的频道名

          let ct = channelType[channelname];
          if (!ct) ct = channelType[channelname] = new Set();
          ct.add(d[ioname]);

          channelUseCount[channelname] = (channelUseCount[channelname] || 0) + 1;

          let link = channelLink0[channelname];
          if (!link) link = channelLink0[channelname] = { in: [], out: [] };
          link[description[taskname].io[ioname].isIn ? 'in' : 'out'].push(taskname);
        });
      });
    for (const c in channelLink0)
      channelLink0[c].out.forEach((f) => {
        channelLink0[c].in.forEach((t) => {
          const key = `${f}/${t}`;
          let link = channelLink[key];
          if (!link) channelLink[key] = { f, t, c: [c] };
          else link.c.push(c);
        });
      });
    channelLink = channelLink;
    for (const c in channelType) if (channelType[c].size > 1) badChannel.add(c);
  }

  // -------------- ↑ 主体部分 ↓ 左上角lore部分 ---------------

  /**lore展示状态*/ export let loreShow = false;
  /**lore点击状态*/ let loreClick = false;
  /**lore元素*/ let loreElement: HTMLDivElement;
  /**lore模态框显示(实际)*/ let loreModalShow: () => void;
  /**lore模态框内容*/ let loreModalContent: string;
  /**lore模态框类型*/ let loreModalType: 'show' | 'ask';
  /**lore模态框标题*/ let loreModalTitle: string;
  /**lore模态框确认*/ let loreModalConfirm: (() => void) | undefined;

  /**显示lore的模态框*/
  function loreModal(title: any, content: any, t: typeof loreModalType, cb?: () => void) {
    loreModalContent = content;
    loreModalTitle = title;
    loreModalType = t;
    loreModalConfirm = cb;
    loreModalShow();
  }

  /**当事件目标是lore元素时触发*/
  function onLoreElement(e: any, fn: () => unknown) {
    if (!loreShow || e.target == loreElement) fn();
  }
</script>

<svelte:head>
  <title>流程设计 - {infos.name}</title>
</svelte:head>

<!-- 流程信息及控制 -->
<div
  bind:this={loreElement}
  id="lore-panel"
  class:show={loreShow}
  class:click={loreClick}
  on:mousedown={(e) => onLoreElement(e, () => (loreClick = true))}
  on:mouseup={(e) => onLoreElement(e, () => (loreClick = false))}
  on:mouseout={() => (loreClick = false)}
  on:blur={() => (loreClick = false)}
  on:click={(e) => onLoreElement(e, () => (loreShow = !loreShow))}
>
  {#if loreShow}
    <span class="info">
      <label class="form-label" for="plan_name_input" style:margin-bottom="none"> 流程名称 </label>
      <input
        id="plan_name_input"
        class="form-control"
        type="text"
        bind:value={infos.name}
        placeholder="Plan Name"
        class:is-invalid={!planNameRegex.test(infos.name)}
      />
      <label class="form-label" for="plan_description_input" style:margin-bottom="none">
        流程描述
      </label>
      <input
        id="plan_description_input"
        class="form-control"
        type="text"
        bind:value={infos.description}
        placeholder="Plan Description"
      />
    </span>
    <hr />
    <div class="center-box">
      <div class="btn-group" role="group">
        {#each [{ t: '任务描述', d: description, r: 0 }, { t: '流程定义', d: infos, r: 0 }, { t: '页面辅助', d: taskExtra, r: 1 }] as { t, d, r }}
          <!-- t: title , d: data , r: remove sub object    -->
          <button
            type="button"
            class="btn btn-outline-primary"
            on:click={() => loreModal(t, JSON.stringify(r ? remSubObj(d) : d, null, 4), 'show')}
          >
            查看{t.substring(2)}
          </button>
        {/each}
      </div>
    </div>
    <div class="center-box">
      <div class="btn-group" role="group">
        {#if oldName}
          <button
            type="button"
            class="btn btn-danger"
            on:click={() =>
              loreModal(
                '确认删除?',
                `你正在删除流程: ${infos.name}\n请确认你的操作!`,
                'ask',
                async () => {
                  if (await removePlanInfo(infos.name)) goto(toPlanListPage());
                  else
                    loreModal('保存删除!', `无法删除流程: "${infos.name}"\n未知原因失败`, 'show');
                },
              )}
          >
            删除
          </button>
        {/if}
        <button
          type="button"
          class="btn btn-primary"
          on:click={() =>
            loreModal(
              '确认保存?',
              `流程: "${infos.name}" 将被保存\n${
                oldName != null && oldName != infos.name ? `\n旧的流程: "${oldName}" 将被删除` : ''
              }`,
              'ask',
              async () => {
                if (oldName != null && oldName != infos.name) {
                  await removePlanInfo(oldName);
                  oldName = infos.name;
                }
                if (await savePlanInfo(infos)) goto(toPlanPage(infos.name));
                else loreModal('保存失败!', `无法保存流程: "${infos.name}"\n未知原因失败`, 'show');
              },
            )}
        >
          保存
        </button>
      </div>
    </div>
  {:else}
    <IconSetting width="25" height="25" color="#FFF" />
  {/if}
</div>
<Modal
  title={loreModalTitle}
  bind:show={loreModalShow}
  bind:confirm={loreModalConfirm}
  scrollable
  centered
  staticBackdrop
>
  {#if loreModalType === 'show'}
    <pre>{loreModalContent}</pre>
  {:else if loreModalType === 'ask'}
    {#each loreModalContent.split('\n') as line}
      <p>{line}</p>
    {/each}
  {:else}
    错误的内容类型: {loreModalType}<br />
    {loreModalContent}
  {/if}
</Modal>
<!-- 流程操控面板 -->
<div class="main">
  {#each Object.keys(description) as taskname}
    {@const d = description[taskname]}
    {@const ext = taskExtra[taskname]}
    <div
      bind:this={taskExtra[taskname].element}
      class="task click-switch stat-{ext.marked
        ? 'marked'
        : ext.error
        ? 'error'
        : infos.tasks[taskname]?.enable
        ? 'enable'
        : 'disable'}"
      class:hide={!taskExtra[taskname].show}
      style:left="calc({ext.x}% + {ext.movex}px)"
      style:top="calc({ext.y}% + {ext.movey}px)"
      style:z-index={topTaskName === taskname ? 5 : 4}
      bind:offsetWidth={taskExtra[taskname].width}
      bind:offsetHeight={taskExtra[taskname].height}
      on:mouseenter={() => handleTaskMouseMove(taskname, true)}
      on:mouseleave={() => handleTaskMouseMove(taskname, false)}
    >
      <div class="headings click-switch">
        <h4>{taskname}</h4>
        {#if ext.show}
          <span style:float="right">组: {d.group}</span>
        {/if}
        <h5>{d.description}</h5>
      </div>
      {#if ext.show}
        <div class="detail">
          <div class="form-check form-switch click-move">
            <label class="form-check-label">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                aria-checked="mixed"
                bind:checked={infos.tasks[taskname].enable}
              />
              启用任务
            </label>
          </div>
          {#if infos.tasks[taskname].enable}
            <hr />
            <h6>接口:</h6>
            {#each Object.keys(d.io) as ioname}
              {@const info = d.io[ioname]}
              <div
                class="io"
                class:stat-error={badChannel.has(infos.tasks[taskname].io[ioname].channel)}
                class:stat-marked={nowMouseTargetIOChannel ===
                  infos.tasks[taskname].io[ioname].channel}
                on:mouseenter={(e) =>
                  handleIOMouseMove(e.target, infos.tasks[taskname].io[ioname].channel, true)}
                on:mouseleave={(e) =>
                  handleIOMouseMove(e.target, infos.tasks[taskname].io[ioname].channel, false)}
              >
                <div class="mb-3">
                  <label class="form-label">
                    <span class="count">
                      连接数: <span class="number"
                        >{channelUseCount[infos.tasks[taskname].io[ioname].channel] || 0}</span
                      >
                    </span>
                    <span class="name">{ioname}</span> <span class="type"> ({info?.type})</span>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="channel"
                      bind:value={infos.tasks[taskname].io[ioname].channel}
                    />
                    <span class="io-type">
                      {info.isIn ? 'In' : 'Out'}
                    </span>
                    <small>{info.description}</small>
                  </label>
                </div>
              </div>
            {:else}
              -
            {/each}
            <hr />
            <h6>参数:</h6>
            {#each Object.keys(d.args) as argname}
              {@const info = d.args[argname]}
              <div class="args">
                <div class="mb-3">
                  <label class="form-label">
                    <span class="name">{argname}</span>
                    <span class="type"> ({TaskArgType[info?.type]})</span>
                    {#if info.type === TaskArgType.STR || info.type === TaskArgType.NUMBER}
                      <input
                        type="text"
                        class="form-control"
                        placeholder="{TaskArgType[info.type].toLowerCase()} args"
                        bind:value={infos.tasks[taskname].args[argname]}
                        class:is-invalid={info.type === TaskArgType.NUMBER &&
                          isNaN(Number(infos.tasks[taskname].args[argname]))}
                      />
                    {:else if info.type === TaskArgType.BOOL}
                      <select class="form-control" bind:value={infos.tasks[taskname].args[argname]}>
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    {:else}
                      ?
                    {/if}
                    <span
                      class="reset"
                      on:click={() => (infos.tasks[taskname].args[argname] = info.defaultValue)}
                    >
                      reset
                    </span>
                    <small>{info.description}</small>
                  </label>
                </div>
              </div>
            {:else}
              -
            {/each}
          {/if}
        </div>
      {/if}
    </div>
    <div
      class="task-bg"
      style:left="calc({ext.x}% + {ext.movex}px)"
      style:top="calc({ext.y}% + {ext.movey}px)"
      style:z-index={3}
      style:width="{taskExtra[taskname].width}px"
      style:height="{taskExtra[taskname].height}px"
      style:position="absolute"
      style:background-color="#FFF"
    >
      <!-- 空白背景, 在任务面板和连线之间 -->
    </div>
  {/each}
  <svg class="line-panel" version="1.1" xmlns="http://www.w3.org/2000/svg">
    {#each Object.values(channelLink) as { f, t, c }}
      {@const fe = taskExtra[f]}
      {@const te = taskExtra[t]}
      {@const x1 = (fe.element?.offsetLeft || 0) + (fe.width || 0) / 2}
      {@const y1 = (fe.element?.offsetTop || 0) + (fe.height || 0) / 2}
      {@const x2 = (te.element?.offsetLeft || 0) + (te.width || 0) / 2}
      {@const y2 = (te.element?.offsetTop || 0) + (te.height || 0) / 2}
      <line
        {x1}
        {y1}
        {x2}
        {y2}
        style:stroke={f === nowMouseTargetTask
          ? '#2ecc71'
          : t === nowMouseTargetTask
          ? '#3498db'
          : '#f1c40f'}
        style:stroke-width={f === nowMouseTargetTask || t === nowMouseTargetTask ? 3 : 1}
      />
      <text
        text-anchor="middle"
        dominant-baseline="middle"
        x={(x1 + x2) / 2}
        y={(y1 + y2) / 2 - 10}
        transform="rotate({(Math.atan((y1 - y2) / (x1 - x2)) * 180) / Math.PI},{(x1 + x2) /
          2},{(y1 + y2) / 2})">{c.join(' ')}</text
      >
    {/each}
  </svg>
</div>

<style lang="scss">
  #lore-panel {
    z-index: 10;
    margin: 10px;
    position: absolute;
    width: 30px;
    height: 30px;
    line-height: 30px;
    transition: transform 0.3s ease-out, width 0.3s, height 0.3s, color 0.3s, background-color 0.3s;
    border-radius: 3px;
    background-color: var(--bs-blue);
    color: #fff;
    overflow: hidden;
    white-space: nowrap;
    &:not(.show) :global(.icon) {
      position: absolute;
      width: 25px;
      height: 25px;
      left: calc((30px - 25px) / 2);
      top: calc((30px - 25px) / 2);
    }
    &.click {
      transform: scale(0.8);
    }
    &.click.show {
      transform: scale(0.9);
    }
    &.show {
      transition: transform 0.3s ease-out, width 0.5s, height 0.5s, color 0.5s,
        background-color 0.5s;
      width: 300px;
      height: 300px;
      background-color: var(--bs-gray-100);
      color: #000;
      border: 1px solid var(--bs-gray-500);
      padding: 5px 10px;
    }
    .center-box {
      margin: 4px auto;
      text-align: center;
    }
    & > .info > input {
      width: 100%;
    }
  }
  .main {
    .line-panel {
      width: 100%;
      height: 100%;
      position: absolute;
    }
    .stat-enable {
      background-color: rgba($color: lightgreen, $alpha: 0.25);
    }
    .stat-disable {
      background-color: rgba($color: grey, $alpha: 0.2);
    }
    .stat-error {
      background-color: rgba($color: red, $alpha: 0.2);
    }
    .stat-marked {
      background-color: rgba($color: yellow, $alpha: 0.2);
    }
    position: relative;
    width: 100vw;
    height: 100vh;
    .task {
      user-select: text;
      cursor: pointer;
      position: absolute;
      border: 1px #ccc dashed;
      border-radius: 5px;
      min-width: 300px;
      min-height: 400px;
      $padding: 4px;
      padding: $padding;
      transition: min-width 0.5s, min-height 0.5s, background-color 0.5s;
      overflow-x: hidden;
      overflow-y: auto;
      .detail {
        overflow-x: visible;
        position: absolute;
        width: calc(100% - $padding);
      }
      &.hide {
        border-radius: 0;
        min-width: 0;
        min-height: 0;
        padding: 0;

        .headings :not(:first-child) {
          text-align: center;
        }
      }

      .headings {
        :first-child {
          text-align: center;
          margin-bottom: 0;
        }
        :not(:first-child) {
          font-weight: normal;
          font-family: unset;
          color: hsl(205deg, 10%, 50%);
          font-size: 1rem;
        }
      }

      .io,
      .args {
        .type {
          color: gray;
        }
        .io-type,
        .count,
        .reset {
          position: absolute;
          right: 2px;
        }
        .count {
          color: gray;
          font-size: 0.8rem;
          .number {
            color: black;
            font-weight: bolder;
            font-size: 1.2rem;
          }
        }
      }

      .args .reset {
        &:hover {
          transition: color 0.3s;
          color: #000;
        }
        color: gray;
        cursor: pointer;
      }
    }
  }
</style>
