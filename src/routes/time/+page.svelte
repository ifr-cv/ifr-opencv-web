<script lang="ts">
  import LoadingHero from '$components/LoadingHero.svelte';
  import { getTimeWatcherList } from '$lib/api/time';
  import { browser } from '$app/environment';
  import TimeGraph from './TimeGraph.svelte';

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
  {/await}
{:else}
  <LoadingHero />
{/if}
