<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ErrorHero from '$components/ErrorHero.svelte';
  import LoadingHero from '$components/LoadingHero.svelte';
  import Spinner from '$components/Spinner.svelte';
  import { API_BASE_KEY, getLS } from '$def/common';
  import { isNoBaseSettingError } from '$def/errors';
  import type { PlanState, TaskDescriptions } from '$def/Task';
  import { toBaseSetting, toPlanPage } from '$lib/api/paes';
  import {
    getPlanInfo,
    getPlanState,
    getTaskDescriptions,
    listPlanInfo,
    startPlanInfo,
    stopPlanInfo,
  } from '$lib/api/task';
  import { onMount } from 'svelte';
  import PlanCard from './PlanCard.svelte';
  const PLAN_ID_PREFIX = 'plan-';

  /**流程状态*/ let state: PlanState | undefined = undefined;
  /**全部流程*/ let list: string[] | undefined = undefined;
  /**任务描述*/ let descriptions: TaskDescriptions | undefined = undefined;

  let loading = false;
  let bad: any = null;
  let flushing = false;

  /**刷新数据*/
  async function flush(noList = false) {
    if (flushing || !browser) return;
    flushing = true;
    try {
      if (bad) return;
      try {
        state = await getPlanState();
        if (!noList) list = await listPlanInfo();
        if (!descriptions) descriptions = await getTaskDescriptions();
      } catch (err) {
        bad = err;
        throw err;
      }
      loading = false;
    } finally {
      flushing = false;
    }
  }
  /**点击事件包装*/
  function onClick(fn: () => any) {
    return async () => {
      loading = true;
      try {
        try {
          await fn();
        } finally {
          flush();
        }
      } catch (error) {
        if (isNoBaseSettingError(error)) goto(toBaseSetting($page.url.pathname));
      }
    };
  }

  onMount(() => {
    flush();
    const timer = setInterval(() => bad || flush(true), 1000);
    return () => clearInterval(timer);
  });
</script>

{#if browser && state && list && descriptions && !bad}
  <main>
    <section class="py-5 text-center container">
      <div class="row py-lg-5">
        <div class="col-lg-6 col-md-8 mx-auto">
          <h1>流程列表</h1>
          <p class="lead text-muted">
            当前选中流程:
            <a
              href="#{PLAN_ID_PREFIX}{state.current}"
              disabled={!state.current}
              class="btn btn-outline-{state.current
                ? state.running
                  ? 'success'
                  : 'danger'
                : 'secondary'} position-relative"
            >
              {#if loading}<Spinner sm />{/if}
              &nbsp;&nbsp;{state.current || '暂无'}&nbsp;&nbsp;
              {#if state.current}
                <span
                  class="position-absolute top-0 start-100 translate-middle p-2 bg-{state.running
                    ? 'success'
                    : 'danger'} border border-light rounded-circle"
                >
                  <span class="visually-hidden">Running: {state.running}</span>
                </span>
              {/if}
            </a>
            <br />
            目前 {browser ? getLS(API_BASE_KEY) : ''} 共存在 {list.length} 个流程
          </p>

          <p>
            <a href={toPlanPage()} class="btn btn-primary my-2">新建</a> &nbsp;&nbsp;&nbsp;&nbsp;
            <button
              type="button"
              disabled={!state.current || !state.running}
              href="#{PLAN_ID_PREFIX}"
              class="btn btn-danger my-2"
              on:click={onClick(() => stopPlanInfo())}
            >
              {#if loading}<Spinner sm />{/if}
              停止
            </button>
            <button
              type="button"
              disabled={!state.current}
              href="#{PLAN_ID_PREFIX}"
              class="btn btn-{state.running ? 'success' : 'warning'} my-2"
              on:click={onClick(() => startPlanInfo())}
            >
              {#if loading}<Spinner sm />{/if}
              {state.running ? '重启' : '启动'}
            </button>
          </p>
        </div>
      </div>
    </section>

    <div class="album py-5 bg-light">
      <div class="container">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
          {#each list.sort() as pname (pname)}
            {#await getPlanInfo(pname)}
              <PlanCard
                {PLAN_ID_PREFIX}
                plan="Loading..."
                {state}
                {descriptions}
                {onClick}
                bind:loading
              />
            {:then plan}
              {#if plan}
                <PlanCard {PLAN_ID_PREFIX} {plan} {state} {descriptions} {onClick} bind:loading />
              {:else}
                <PlanCard
                  {PLAN_ID_PREFIX}
                  plan="404 Not Found"
                  {state}
                  {descriptions}
                  {onClick}
                  bind:loading
                />
              {/if}
            {/await}
          {/each}
        </div>
      </div>
    </div>
  </main>
{:else if bad}
  <ErrorHero description={bad} />
{:else}
  <LoadingHero />
{/if}
