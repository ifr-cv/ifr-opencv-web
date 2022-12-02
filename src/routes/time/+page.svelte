<script lang="ts">
  import LoadingHero from '$components/LoadingHero.svelte';
  import { getTimeWatcherList } from '$lib/api/time';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import TimeGraph from './TimeGraph.svelte';
  import { isNoBaseSettingError } from '$def/errors';
  import { toBaseSetting } from '$lib/api/paes';
  import ErrorHero from '$components/ErrorHero.svelte';

  let select: string;
</script>

{#if browser}
  {#await getTimeWatcherList()}
    <LoadingHero />
  {:then list}
    {((select = list[0]) && '') || ''}
    <div class="container">
      <div class="row">
        <div class="col-md-2 col-12">
          <ul class="list-group">
            {#each list as type}
              <li class="list-group-item" class:active={select === type}>{type}</li>
            {:else}
              <li class="list-group-item">无运行中的时间监控</li>
            {/each}
          </ul>
        </div>
        <div class="col-md-10 col-12">
          {#if list.length}
            {#key select}
              <TimeGraph type={select} />
            {/key}
          {/if}
        </div>
      </div>
    </div>
  {:catch err}
    {#if isNoBaseSettingError(err)}
      {goto(toBaseSetting($page.url.pathname))}
    {:else}
      <ErrorHero description={err} />
    {/if}
  {/await}
{:else}
  <LoadingHero />
{/if}

<style lang="scss">
  li.list-group-item {
    cursor: pointer;
    &:not(.active):hover {
      background-color: rgba($color: #000000, $alpha: 0.05);
    }
  }
</style>
