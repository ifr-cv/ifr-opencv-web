<script lang="ts">
  import { browser } from '$app/environment';
  import ErrorHero from '$components/ErrorHero.svelte';
  import LoadingHero from '$components/LoadingHero.svelte';
  import { getApi } from '$lib/api/api';
</script>

<div class="container">
  {#if browser}
    {#await getApi()}
      <LoadingHero />
    {:then api}
      <ul class="list-group">
        {#each api as { pattern, method }}
          <li class="list-group-item {method.toLowerCase()}">
            <span class="method">{method}</span>
            {pattern}
          </li>
        {:else}
          <li class="list-group-item list-group-item-action">暂无API</li>
        {/each}
      </ul>
    {:catch err}
      <ErrorHero description={err} />
    {/await}
  {:else}
    <LoadingHero />
  {/if}
</div>

<style lang="scss">
  .container {
    margin-top: 90px;
  }
  li {
    &.post {
      --color: #49cc90;
      --bg-color: #49cc901a;
    }
    &.get {
      --color: #61affe;
      --bg-color: #61affe1a;
    }
    &.put {
      --color: #fca130;
      --bg-color: #fca1301a;
    }
    &.delete {
      --color: #f93e3e;
      --bg-color: #f93e3e1a;
    }
    &.head {
      --color: #9012fe;
      --bg-color: #9012fe1a;
    }
    &.patch {
      --color: #50e3c2;
      --bg-color: #50e3c21a;
    }
    &.disabled {
      --color: #ebebeb;
      --bg-color: #ebebeb1a;
    }
    &.options {
      --color: #0d5aa7;
      --bg-color: #0d5aa71a;
    }
    background-color: var(--bg-color);
    border: 1px solid var(--color);
    &:not(:last-child) {
      border-bottom: none;
    }

    .method {
      display: inline-block;
      width: 90px;
      text-align: center;
      padding: 0 10px;
      margin-right: 10px;
      font-weight: bold;
      color: #fff;
      border-radius: 5px;
      background-color: var(--color);
    }
  }
</style>
