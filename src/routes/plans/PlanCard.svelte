<script lang="ts">
  import PlanThumbnail from '$components/PlanThumbnail.svelte';
  import Spinner from '$components/Spinner.svelte';
  import SquareBox from '$components/SquareBox.svelte';
  import type { PlanInfo, PlanState, TaskDescriptions } from '$def/Task';
  import { toPlanPage } from '$lib/api/paes';
  import { startPlanInfo, stopPlanInfo, usePlanInfo } from '$lib/api/task';

  export let PLAN_ID_PREFIX = 'plan-';
  export let plan: PlanInfo | string;
  export let state: PlanState;
  export let descriptions: TaskDescriptions;
  export let onClick: (fn: () => any, clazz?: string) => (e: any) => Promise<void>;
  export let loading: boolean;
  $: _loading = loading || typeof plan === 'string';
  $: pname = typeof plan !== 'string' ? plan.name : undefined;

  /**启动流程*/
  async function startPlan(pname?: string) {
    if (pname) await usePlanInfo(pname);
    await startPlanInfo();
  }
</script>

<div class="col">
  <div
    id="{PLAN_ID_PREFIX}{pname}"
    class="plan-card card shadow-sm border-{pname === state.current ? 'primary' : 'secondary'}"
  >
    <h4 class="card-header text-{pname === state.current ? 'primary' : 'secondary'}">
      {pname || plan}
    </h4>
    {#if typeof plan !== 'string'}
      <a class="plan-thumbnail" href={toPlanPage(pname)}>
        <PlanThumbnail {descriptions} {plan} />
      </a>
    {:else}
      <SquareBox>
        <div class="tup">
          <div>{plan}</div>
        </div>
      </SquareBox>
    {/if}

    <div class="card-body">
      <p class="card-text">{(typeof plan !== 'string' && plan?.description) || ' '}</p>
      <div class="d-flex justify-content-between align-items-center">
        <div class="btn-group">
          {#if pname === state.current}
            <button type="button" class="btn btn-sm btn-outline-secondary" disabled>
              已选中
            </button>
            {#if state.running}
              <button
                type="button"
                class="btn btn-sm btn-danger"
                disabled={typeof plan === 'string'}
                on:click={onClick(() => stopPlanInfo())}
              >
                {#if _loading}<Spinner sm />{/if}
                停止
              </button>
            {:else}
              <button
                type="button"
                class="btn btn-sm btn-success"
                disabled={typeof plan === 'string'}
                on:click={onClick(() => startPlanInfo())}
              >
                {#if _loading}<Spinner sm />{/if}
                运行
              </button>
            {/if}
          {:else}
            <button
              type="button"
              class="btn btn-sm btn-primary"
              disabled={typeof plan === 'string'}
              on:click={onClick(() => pname && usePlanInfo(pname))}
            >
              {#if _loading}<Spinner sm />{/if}
              选中
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-success"
              disabled={typeof plan === 'string'}
              on:click={onClick(() => pname && startPlan(pname))}
            >
              {#if _loading}<Spinner sm />{/if}
              选中并运行
            </button>
          {/if}
        </div>
        <small class="text-muted">
          {typeof plan !== 'string'
            ? Object.values(plan.tasks).filter((t) => t.enable).length
            : '--'} / {Object.keys(descriptions).length} tasks
        </small>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .tup {
    div {
      align-self: center;
      width: 100%;
      font-size: 2em;
      color: rgba($color: #000, $alpha: 0.5);
    }
    height: 100%;
    width: 100%;
    display: flex;
    text-align: center;
  }
</style>
