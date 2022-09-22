<script>
  import { goto } from '$app/navigation';
  import { delay } from '$helpers/common';
  import { fly } from 'svelte/transition';

  import { toBaseSetting } from '$lib/api/paes';
  import Spinner from './Spinner.svelte';
</script>

<div class="px-4 py-5 my-5 text-center">
  <Spinner class="m-5" size="4rem" />
  <h1 class="display-5 fw-bold">Loading...</h1>
  <div class="col-lg-6 mx-auto">
    <div class="lead mb-4">
      <Spinner sm type="grow" />
      数据正在载入中...
    </div>
    {#await delay(1) then}
      <div in:fly={{ delay: 2000, y: 10, duration: 1000 }}>
        <p class="lead mb-4">如果你在此页面停留较久, 请检查你是否可以连接到你的设备</p>

        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <button
            type="button"
            class="btn btn-primary btn-lg px-4 gap-3"
            on:click={() => location.reload()}
          >
            刷新
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-lg px-4"
            on:click={() => goto(toBaseSetting())}
          >
            基础设置
          </button>
        </div>
      </div>
    {/await}
  </div>
</div>
